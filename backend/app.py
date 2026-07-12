import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_bcrypt import Bcrypt
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv
from models import db, Employee, Leave, Expense, Payslip
from datetime import date, timedelta

load_dotenv()

# ─── App Configuration ────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/ess_portal'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-me-in-production')

db.init_app(app)
bcrypt = Bcrypt(app)
jwt    = JWTManager(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def validate_email_str(email: str) -> bool:
    try:
        validate_email(email, check_deliverability=False)
        return True
    except EmailNotValidError:
        return False


# ─── Health ───────────────────────────────────────────────────────────────────

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'status': 'Backend is running', 'message': 'Nexus ESS API v2.0 (PostgreSQL)'})


# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role     = data.get('role', 'Employee')
    dept     = data.get('department', 'General')

    if not name:
        return jsonify({'error': 'Name is required.'}), 400
    if not validate_email_str(email):
        return jsonify({'error': 'Valid email address is required.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400
    if Employee.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409

    is_hr = email.endswith('@hr.nexus.com') or data.get('is_hr', False)
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    emp = Employee(
        name=name, email=email, password_hash=password_hash,
        role=role, department=dept, is_hr=is_hr,
        hire_date=date.today()
    )
    db.session.add(emp)
    db.session.commit()

    token = create_access_token(identity=str(emp.id))
    return jsonify({'token': token, 'user': emp.to_dict()}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not validate_email_str(email):
        return jsonify({'error': 'Valid email address is required.'}), 400
    if not password:
        return jsonify({'error': 'Password is required.'}), 400

    emp = Employee.query.filter_by(email=email).first()
    if not emp or not bcrypt.check_password_hash(emp.password_hash, password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    token = create_access_token(identity=str(emp.id))
    return jsonify({'token': token, 'user': emp.to_dict()}), 200


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    emp_id = int(get_jwt_identity())
    emp    = Employee.query.get_or_404(emp_id)
    return jsonify(emp.to_dict())

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not validate_email_str(email):
        return jsonify({'error': 'Valid email address is required.'}), 400
        
    emp = Employee.query.filter_by(email=email).first()
    if not emp:
        # Prevent email enumeration by returning success even if not found
        return jsonify({'message': 'If your email is registered, you will receive a reset link shortly.'}), 200
        
    # In a real app, generate a unique token and send an email
    # For this demo, we'll just return a success message
    reset_token = create_access_token(identity=str(emp.id), expires_delta=timedelta(hours=1))
    
    # Simulate sending email by printing to console
    print(f"PASSWORD RESET LINK: /reset-password?token={reset_token}")
    
    return jsonify({
        'message': 'If your email is registered, you will receive a reset link shortly.',
        'demo_token': reset_token # Remove in production
    }), 200

@app.route('/api/auth/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    emp_id = int(get_jwt_identity())
    data = request.get_json()
    new_password = data.get('new_password', '')
    
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400
        
    emp = Employee.query.get_or_404(emp_id)
    emp.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully.'}), 200


# ─── Employees ────────────────────────────────────────────────────────────────

@app.route('/api/employees', methods=['GET'])
@jwt_required()
def get_employees():
    emps = Employee.query.order_by(Employee.name).all()
    return jsonify([e.to_dict() for e in emps])


@app.route('/api/employees/<int:emp_id>', methods=['GET'])
@jwt_required()
def get_employee(emp_id):
    emp = Employee.query.get_or_404(emp_id)
    return jsonify(emp.to_dict())


@app.route('/api/employees', methods=['POST'])
@jwt_required()
def add_employee():
    data  = request.get_json()
    email = data.get('email', '').strip().lower()

    if not data.get('name', '').strip():
        return jsonify({'error': 'Name is required.'}), 400
    if not validate_email_str(email):
        return jsonify({'error': 'Valid email is required.'}), 400
    if Employee.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists.'}), 409

    password_hash = bcrypt.generate_password_hash('Welcome@123').decode('utf-8')
    emp = Employee(
        name=data['name'].strip(), email=email,
        password_hash=password_hash,
        role=data.get('role', 'Employee'),
        department=data.get('department', 'General'),
        phone=data.get('phone'),
        hire_date=date.today(),
        is_hr=data.get('is_hr', False)
    )
    db.session.add(emp)
    db.session.commit()
    return jsonify(emp.to_dict()), 201


@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
@jwt_required()
def update_employee(emp_id):
    emp  = Employee.query.get_or_404(emp_id)
    data = request.get_json()
    for field in ('name', 'role', 'department', 'phone', 'status'):
        if field in data:
            setattr(emp, field, data[field])
    db.session.commit()
    return jsonify(emp.to_dict())


# ─── Leaves ───────────────────────────────────────────────────────────────────

@app.route('/api/leaves', methods=['GET'])
@jwt_required()
def get_leaves():
    emp_id = get_jwt_identity()
    caller = Employee.query.get(int(emp_id))
    # HR sees all; employee sees own
    if caller and caller.is_hr:
        leaves = Leave.query.order_by(Leave.created_at.desc()).all()
    else:
        leaves = Leave.query.filter_by(employee_id=int(emp_id)).order_by(Leave.created_at.desc()).all()
    return jsonify([l.to_dict() for l in leaves])


@app.route('/api/leaves', methods=['POST'])
@jwt_required()
def apply_leave():
    data   = request.get_json()
    emp_id = int(get_jwt_identity())

    if not data.get('start_date') or not data.get('end_date'):
        return jsonify({'error': 'Start and end dates are required.'}), 400
    if data['end_date'] < data['start_date']:
        return jsonify({'error': 'End date must be after start date.'}), 400
    if not data.get('reason', '').strip():
        return jsonify({'error': 'Reason is required.'}), 400

    leave = Leave(
        employee_id=emp_id,
        type=data.get('type', 'Casual Leave'),
        start_date=data['start_date'],
        end_date=data['end_date'],
        reason=data['reason'].strip(),
    )
    db.session.add(leave)
    db.session.commit()
    return jsonify(leave.to_dict()), 201


@app.route('/api/leaves/<int:leave_id>/action', methods=['PUT'])
@jwt_required()
def leave_action(leave_id):
    caller_id = int(get_jwt_identity())
    caller    = Employee.query.get_or_404(caller_id)
    if not caller.is_hr:
        return jsonify({'error': 'Only HR can approve or reject leaves.'}), 403

    data   = request.get_json()
    action = data.get('action')
    if action not in ('Approved', 'Rejected'):
        return jsonify({'error': 'Action must be Approved or Rejected.'}), 400

    leave = Leave.query.get_or_404(leave_id)
    leave.status      = action
    leave.reviewed_by = caller_id
    db.session.commit()
    return jsonify(leave.to_dict())


# ─── Expenses ─────────────────────────────────────────────────────────────────

@app.route('/api/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    emp_id = int(get_jwt_identity())
    caller = Employee.query.get(emp_id)
    if caller and caller.is_hr:
        expenses = Expense.query.order_by(Expense.created_at.desc()).all()
    else:
        expenses = Expense.query.filter_by(employee_id=emp_id).order_by(Expense.created_at.desc()).all()
    return jsonify([e.to_dict() for e in expenses])


@app.route('/api/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    data   = request.get_json()
    emp_id = int(get_jwt_identity())

    if not data.get('description', '').strip():
        return jsonify({'error': 'Description is required.'}), 400
    try:
        amount = float(data.get('amount', 0))
        if amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({'error': 'Valid positive amount is required.'}), 400
    if not data.get('date'):
        return jsonify({'error': 'Date is required.'}), 400

    expense = Expense(
        employee_id=emp_id,
        category=data.get('category', 'Other'),
        description=data['description'].strip(),
        amount=amount,
        date=data['date'],
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify(expense.to_dict()), 201


@app.route('/api/expenses/<int:exp_id>/action', methods=['PUT'])
@jwt_required()
def expense_action(exp_id):
    caller_id = int(get_jwt_identity())
    caller    = Employee.query.get_or_404(caller_id)
    if not caller.is_hr:
        return jsonify({'error': 'Only HR can approve or reject expenses.'}), 403

    data   = request.get_json()
    action = data.get('action')
    if action not in ('Approved', 'Rejected'):
        return jsonify({'error': 'Action must be Approved or Rejected.'}), 400

    expense = Expense.query.get_or_404(exp_id)
    expense.status = action
    db.session.commit()
    return jsonify(expense.to_dict())


# ─── Payslips ─────────────────────────────────────────────────────────────────

@app.route('/api/payslips', methods=['GET'])
@jwt_required()
def get_payslips():
    emp_id = int(get_jwt_identity())
    caller = Employee.query.get(emp_id)
    if caller and caller.is_hr:
        payslips = Payslip.query.order_by(Payslip.year.desc(), Payslip.id.desc()).all()
    else:
        payslips = Payslip.query.filter_by(employee_id=emp_id).order_by(Payslip.year.desc(), Payslip.id.desc()).all()
    return jsonify([p.to_dict() for p in payslips])


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    emp_id = int(get_jwt_identity())
    emp    = Employee.query.get_or_404(emp_id)

    pending_leaves = Leave.query.filter_by(employee_id=emp_id, status='Pending').count()
    approved_days  = sum(
        (l.end_date - l.start_date).days + 1
        for l in Leave.query.filter_by(employee_id=emp_id, status='Approved').all()
    )
    pending_expense_amt = sum(
        float(e.amount)
        for e in Expense.query.filter_by(employee_id=emp_id, status='Pending').all()
    )
    latest_payslip = Payslip.query.filter_by(employee_id=emp_id).order_by(Payslip.id.desc()).first()

    return jsonify({
        'employee':           emp.to_dict(),
        'pto_balance':        18 - approved_days,
        'pending_leaves':     pending_leaves,
        'pending_expenses':   pending_expense_amt,
        'latest_net_salary':  float(latest_payslip.net) if latest_payslip else 0,
    })


@app.route('/api/hr/stats', methods=['GET'])
@jwt_required()
def hr_stats():
    caller_id = int(get_jwt_identity())
    caller    = Employee.query.get_or_404(caller_id)
    if not caller.is_hr:
        return jsonify({'error': 'Forbidden'}), 403

    return jsonify({
        'total_employees':  Employee.query.count(),
        'active_employees': Employee.query.filter_by(status='Active').count(),
        'pending_leaves':   Leave.query.filter_by(status='Pending').count(),
        'pending_expenses': Expense.query.filter_by(status='Pending').count(),
        'monthly_payroll':  float(db.session.query(db.func.sum(Payslip.net)).scalar() or 0),
    })


# ─── DB Init & Seed ───────────────────────────────────────────────────────────

def seed_db():
    """Insert demo data if tables are empty."""
    if Employee.query.count() > 0:
        return

    hr_hash  = bcrypt.generate_password_hash('hr@12345').decode('utf-8')
    emp_hash = bcrypt.generate_password_hash('emp@12345').decode('utf-8')

    hr = Employee(name='HR Admin', email='hr@nexus.com', password_hash=hr_hash,
                  role='HR Manager', department='HR', is_hr=True, hire_date=date(2020, 1, 15))
    e1 = Employee(name='John Doe',   email='john@nexus.com', password_hash=emp_hash,
                  role='Software Engineer', department='Engineering', phone='+91-9876543210',
                  hire_date=date(2022, 3, 10))
    e2 = Employee(name='Alice Smith', email='alice@nexus.com', password_hash=emp_hash,
                  role='Product Designer', department='Design', phone='+91-9123456780',
                  hire_date=date(2021, 7, 1))
    e3 = Employee(name='Bob Martin', email='bob@nexus.com', password_hash=emp_hash,
                  role='Data Analyst', department='Analytics', hire_date=date(2023, 1, 20))

    db.session.add_all([hr, e1, e2, e3])
    db.session.flush()

    # Leaves
    db.session.add_all([
        Leave(employee_id=e1.id, type='Vacation',   start_date=date(2026,8,12), end_date=date(2026,8,16), reason='Family trip', status='Approved'),
        Leave(employee_id=e1.id, type='Sick Leave', start_date=date(2026,7,15), end_date=date(2026,7,15), reason='Fever', status='Pending'),
        Leave(employee_id=e2.id, type='Vacation',   start_date=date(2026,8,1),  end_date=date(2026,8,5),  reason='Holiday', status='Pending'),
    ])

    # Expenses
    db.session.add_all([
        Expense(employee_id=e1.id, category='Travel',   description='Client site visit', amount=3500, date=date(2026,7,10), status='Pending'),
        Expense(employee_id=e1.id, category='Meals',    description='Team lunch',        amount=1200, date=date(2026,6,28), status='Approved'),
        Expense(employee_id=e2.id, category='Software', description='License renewal',   amount=4500, date=date(2026,6,10), status='Approved'),
    ])

    # Payslips
    months = [('June', 2026, 85000), ('May', 2026, 85000), ('April', 2026, 82000)]
    for emp_obj in [e1, e2, e3]:
        for month, year, gross in months:
            deductions = round(gross * 0.15, 2)
            db.session.add(Payslip(
                employee_id=emp_obj.id, month=month, year=year,
                gross=gross, deductions=deductions, net=gross - deductions,
                status='Paid'
            ))

    db.session.commit()
    print('Database seeded with demo data.')


with app.app_context():
    db.create_all()
    seed_db()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
