import React from 'react'

export const Card = ({ children, className = "" }) => <div className={`card ${className}`}>{children}</div>
export const Badge = ({ children, color = "gray" }) => <span className={`badge ${color}`}>{children}</span>
export const Btn = ({ children, onClick, variant = "primary", type = "button", disabled }) => <button type={type} onClick={onClick} className={`btn btn-${variant}`} disabled={disabled}>{children}</button>
export const Stat = ({ label, value }) => <div className="stat"><span className="stat-label">{label}</span><span className="stat-value">{value}</span></div>
export const Input = (props) => <input className="input" {...props} />
export const Sel = (props) => <select className="select" {...props} />
export const Tbl = ({ headers, rows }) => {
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return <div style={{ padding: "1rem", color: "rgba(238,242,255,0.55)" }}>No data available</div>
  }
  return (
    <table className="table">
      <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
    </table>
  )
}
export const fmtD = (d) => d ? new Date(d).toLocaleDateString() : '-'
export const fmtT = (d) => d ? new Date(d).toLocaleTimeString() : '-'
export const short = (str, len = 8) => {
  if (!str) return '-'
  return str.length > len + 3 ? str.slice(0, len) + '…' : str
}
export const TxModal = ({ state, onClose }) => {
  if (!state) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: '#111A2C', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '90%', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: '0.5rem' }}>⛓️</div>
        {state.loading && <div style={{ color: '#00C8E8' }}>⏳ Transaction in progress...</div>}
        {state.error && <div style={{ color: '#FF5C8A' }}>❌ {state.error}</div>}
        {state.txId && !state.loading && !state.error && <div style={{ color: '#00F5D4' }}>✅ Transaction confirmed<br/><span style={{ fontSize: 12, opacity: 0.6, fontFamily: 'monospace' }}>{state.txId}</span></div>}
        <Btn onClick={onClose} variant="secondary" style={{ marginTop: '1rem' }}>Close</Btn>
      </div>
    </div>
  )
}
export const Toast = ({ messages }) => {
  if (!messages || messages.length === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, zIndex: 9999 }}>
      {messages.map(m => (
        <div key={m.id} style={{ background: m.error ? 'rgba(255,92,138,0.15)' : 'rgba(0,245,212,0.08)', border: `0.5px solid ${m.error ? '#FF5C8A' : '#00F5D4'}`, borderRadius: 10, padding: '0.8rem 1rem', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: m.error ? '#FF5C8A' : '#00F5D4' }}>{m.title}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{m.body}</div>
        </div>
      ))}
    </div>
  )
}
export default { Card, Badge, Btn, Stat, Input, Sel, Tbl, fmtD, fmtT, short, TxModal, Toast }
