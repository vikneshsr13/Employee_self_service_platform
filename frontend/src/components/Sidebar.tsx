import React from 'react';
import { 
  LayoutDashboard, Users, Calendar, FileText, Settings, LogOut,
  Briefcase, DollarSign, Shield
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  role: string;
}

export default function Sidebar({ open, role }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const employeeLinks = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'My Dashboard' },
    { path: '/leaves',    icon: <Calendar size={20} />,        label: 'Time & Leave' },
    { path: '/expenses',  icon: <DollarSign size={20} />,      label: 'Expenses' },
    { path: '/salary',    icon: <FileText size={20} />,        label: 'Salary Slips' },
  ];

  const hrLinks = [
    { path: '/hr', icon: <Shield size={20} />, label: 'HR Dashboard' },
  ];

  const links = role === 'hr' ? hrLinks : employeeLinks;

  return (
    <aside className="sidebar" style={{ transform: open ? 'translateX(0)' : 'translateX(-280px)', transition: 'transform 0.3s ease' }}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Briefcase size={20} />
        </div>
        <span className="brand-name">Nexus ESS</span>
      </div>

      <div className="nav-links">
        {links.map(link => (
          <div
            key={link.path}
            className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
            onClick={() => navigate(link.path)}
          >
            {link.icon}
            <span>{link.label}</span>
          </div>
        ))}
      </div>

      <div className="nav-links" style={{ flex: 'none', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', paddingBottom: '0' }}>
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="nav-item" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar" style={{ background: role === 'hr' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : undefined }}>
            {role === 'hr' ? 'HR' : 'JD'}
          </div>
          <div className="user-info">
            <span className="user-name">{role === 'hr' ? 'HR Admin' : 'John Doe'}</span>
            <span className="user-role">{role === 'hr' ? 'Human Resources' : 'Software Engineer'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
