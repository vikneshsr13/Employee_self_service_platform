import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/HRDashboard';
import Leaves from './pages/Leaves';
import Expenses from './pages/Expenses';
import Salary from './pages/Salary';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const role = localStorage.getItem('role');
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'hr' ? '/hr' : '/dashboard'} replace />;
  }
  return <Layout role={role}>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Employee Routes */}
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['employee']}><Dashboard /></PrivateRoute>} />
        <Route path="/leaves" element={<PrivateRoute allowedRoles={['employee']}><Leaves /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute allowedRoles={['employee']}><Expenses /></PrivateRoute>} />
        <Route path="/salary" element={<PrivateRoute allowedRoles={['employee']}><Salary /></PrivateRoute>} />

        {/* HR Routes */}
        <Route path="/hr" element={<PrivateRoute allowedRoles={['hr']}><HRDashboard /></PrivateRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
