from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Employee(db.Model):
    __tablename__ = 'employees'

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role          = db.Column(db.String(80),  nullable=False, default='Employee')
    department    = db.Column(db.String(80),  nullable=False, default='General')
    phone         = db.Column(db.String(20),  nullable=True)
    hire_date     = db.Column(db.Date,        nullable=True)
    status        = db.Column(db.String(20),  nullable=False, default='Active')
    is_hr         = db.Column(db.Boolean,     nullable=False, default=False)
    created_at    = db.Column(db.DateTime,    default=datetime.utcnow)

    leaves    = db.relationship('Leave',   backref='employee', lazy=True, cascade='all, delete-orphan', foreign_keys='Leave.employee_id')
    expenses  = db.relationship('Expense', backref='employee', lazy=True, cascade='all, delete-orphan')
    payslips  = db.relationship('Payslip', backref='employee', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'role':       self.role,
            'department': self.department,
            'phone':      self.phone,
            'hire_date':  str(self.hire_date) if self.hire_date else None,
            'status':     self.status,
            'is_hr':      self.is_hr,
            'created_at': str(self.created_at),
        }


class Leave(db.Model):
    __tablename__ = 'leaves'

    id          = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    type        = db.Column(db.String(50),  nullable=False)
    start_date  = db.Column(db.Date,        nullable=False)
    end_date    = db.Column(db.Date,        nullable=False)
    reason      = db.Column(db.Text,        nullable=False)
    status      = db.Column(db.String(20),  nullable=False, default='Pending')
    reviewed_by = db.Column(db.Integer,     db.ForeignKey('employees.id'), nullable=True)
    created_at  = db.Column(db.DateTime,    default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':          self.id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.name if self.employee else None,
            'type':        self.type,
            'start_date':  str(self.start_date),
            'end_date':    str(self.end_date),
            'reason':      self.reason,
            'status':      self.status,
            'created_at':  str(self.created_at),
        }


class Expense(db.Model):
    __tablename__ = 'expenses'

    id          = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    category    = db.Column(db.String(50),   nullable=False)
    description = db.Column(db.String(255),  nullable=False)
    amount      = db.Column(db.Numeric(10,2), nullable=False)
    date        = db.Column(db.Date,          nullable=False)
    status      = db.Column(db.String(20),    nullable=False, default='Pending')
    created_at  = db.Column(db.DateTime,      default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':            self.id,
            'employee_id':   self.employee_id,
            'employee_name': self.employee.name if self.employee else None,
            'category':      self.category,
            'description':   self.description,
            'amount':        float(self.amount),
            'date':          str(self.date),
            'status':        self.status,
            'created_at':    str(self.created_at),
        }


class Payslip(db.Model):
    __tablename__ = 'payslips'

    id          = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    month       = db.Column(db.String(20),    nullable=False)
    year        = db.Column(db.Integer,       nullable=False)
    gross       = db.Column(db.Numeric(12,2), nullable=False)
    deductions  = db.Column(db.Numeric(12,2), nullable=False)
    net         = db.Column(db.Numeric(12,2), nullable=False)
    status      = db.Column(db.String(20),    nullable=False, default='Paid')
    created_at  = db.Column(db.DateTime,      default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':          self.id,
            'employee_id': self.employee_id,
            'month':       self.month,
            'year':        self.year,
            'gross':       float(self.gross),
            'deductions':  float(self.deductions),
            'net':         float(self.net),
            'status':      self.status,
        }
