import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, DollarSign, Eye, X } from 'lucide-react';
import { apiGetPayslips } from '../api';

interface Payslip { id: number; month: string; year: number; gross: number; deductions: number; net: number; status: string; }

export default function Salary() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [viewSlip, setViewSlip] = useState<Payslip | null>(null);

  useEffect(() => {
    apiGetPayslips().then(data => { setPayslips(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const latest = payslips[0];

  return (
    <>
      <div className="page-header">
        <div><h1>Salary & Payslips</h1><p>View your earnings and download monthly payslips.</p></div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
        <div className="card stat-card"><div className="stat-icon success"><DollarSign size={28} /></div><div className="stat-details"><span className="stat-value">₹{latest ? Number(latest.net).toLocaleString() : '—'}</span><span className="stat-label">Last Net Salary</span></div></div>
        <div className="card stat-card"><div className="stat-icon primary"><TrendingUp size={28} /></div><div className="stat-details"><span className="stat-value">₹{latest ? Number(latest.gross).toLocaleString() : '—'}</span><span className="stat-label">Gross CTC / Month</span></div></div>
        <div className="card stat-card"><div className="stat-icon warning"><FileText size={28} /></div><div className="stat-details"><span className="stat-value">₹{latest ? Number(latest.deductions).toLocaleString() : '—'}</span><span className="stat-label">Total Deductions</span></div></div>
      </div>

      <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
        {latest && (
          <div className="card" style={{ flex: '1', minWidth: '280px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Latest Salary Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Basic Salary',       amount:  Math.round(latest.gross * 0.529), color: 'var(--primary-color)', sign: '+' },
                { label: 'HRA',                amount:  Math.round(latest.gross * 0.235), color: 'var(--secondary-color)', sign: '+' },
                { label: 'Special Allowance',  amount:  Math.round(latest.gross * 0.236), color: 'var(--success)', sign: '+' },
                { label: 'Income Tax (TDS)',   amount: -Math.round(latest.deductions * 0.627), color: 'var(--danger)', sign: '-' },
                { label: 'PF Contribution',    amount: -Math.round(latest.deductions * 0.373), color: 'var(--warning)', sign: '-' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center" style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></span>
                    <span className="text-sm" style={{ fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: item.amount < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {item.sign}₹{Math.abs(item.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }} className="flex justify-between items-center">
                <span style={{ fontWeight: 700 }}>Net Pay</span>
                <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--success)' }}>₹{Number(latest.net).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ flex: '2', minWidth: '380px' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Payslip History</h2>
          {loading ? <p style={{ textAlign:'center', color:'var(--text-tertiary)' }}>Loading…</p> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Month</th><th>Gross (₹)</th><th>Deductions (₹)</th><th>Net Pay (₹)</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {payslips.map(slip => (
                    <tr key={slip.id}>
                      <td style={{ fontWeight: 500 }}>{slip.month} {slip.year}</td>
                      <td>₹{Number(slip.gross).toLocaleString()}</td>
                      <td style={{ color: 'var(--danger)' }}>₹{Number(slip.deductions).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{Number(slip.net).toLocaleString()}</td>
                      <td><span className={slip.status === 'Paid' ? 'badge success' : 'badge warning'}>{slip.status}</span></td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={() => setViewSlip(slip)}>
                            <Eye size={14} style={{ marginRight: 4 }} />View
                          </button>
                          <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>
                            <Download size={14} style={{ marginRight: 4 }} />PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && payslips.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No payslips yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {viewSlip && (
        <div className="modal-overlay" onClick={() => setViewSlip(null)}>
          <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Payslip — {viewSlip.month} {viewSlip.year}</h2>
              <button className="icon-btn" onClick={() => setViewSlip(null)}><X size={20} /></button>
            </div>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              {[
                ['Period', `${viewSlip.month} ${viewSlip.year}`],
                ['Gross Salary', `₹${Number(viewSlip.gross).toLocaleString()}`],
                ['Total Deductions', `-₹${Number(viewSlip.deductions).toLocaleString()}`],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between" style={{ marginBottom: '0.75rem', color: k === 'Total Deductions' ? 'var(--danger)' : undefined }}>
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
              <div className="flex justify-between">
                <strong style={{ fontSize: '1.1rem' }}>Net Pay</strong>
                <strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>₹{Number(viewSlip.net).toLocaleString()}</strong>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              <Download size={16} style={{ marginRight: 6 }} /> Download PDF
            </button>
          </div>
        </div>
      )}
    </>
  );
}
