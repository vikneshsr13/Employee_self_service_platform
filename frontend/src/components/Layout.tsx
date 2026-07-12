import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children, role }: { children: React.ReactNode, role: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/status')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus('Backend Disconnected'));
  }, []);

  return (
    <div className="app-container">
      <Sidebar open={sidebarOpen} role={role} />
      
      <main className="main-content" style={{ marginLeft: sidebarOpen ? '280px' : '0', transition: 'margin-left 0.3s ease' }}>
        <header className="top-header">
          <div className="flex items-center gap-4">
            <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <div className="search-bar">
              <Search size={18} color="var(--text-tertiary)" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          
          <div className="header-actions">
            <div style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                display: 'inline-block', 
                width: 8, height: 8, 
                borderRadius: '50%', 
                backgroundColor: backendStatus.includes('running') ? 'var(--success)' : 'var(--danger)'
              }}></span>
              {backendStatus}
            </div>
            <button className="icon-btn" style={{ position: 'relative' }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '4px', right: '4px',
                width: '8px', height: '8px',
                backgroundColor: 'var(--danger)',
                borderRadius: '50%'
              }}></span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
