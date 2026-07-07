import React, { useState, useEffect } from 'react'
import { C } from '../../constants/theme'
import { Card, Badge, Btn, Stat, Input, Tbl, fmtD, fmtT, short } from '../../components'

const copyToClipboard = (text) => {
  navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!')).catch(() => {})
}

export const InsuranceDashboard = ({ audit = [], darkMode = true, records = [], onToggleVerify, onApproveClaim }) => {
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const activeRecords = records.filter(r => !r.revoked)
  const pendingClaims = activeRecords.filter(r => r.claimStatus === 'pending').sort((a, b) => new Date(a.claimDate) - new Date(b.claimDate))

  const patientMap = {}
  activeRecords.forEach(r => {
    const pid = r.patientID
    if (!patientMap[pid]) {
      patientMap[pid] = { patientID: pid, name: r.patientName || pid, records: [], totalCost: 0, verifiedCount: 0, pendingCount: 0, rejectedCount: 0 }
    }
    patientMap[pid].records.push(r)
    patientMap[pid].totalCost += (r.totalCost || 0)
    if (r.verificationStatus === 'verified') patientMap[pid].verifiedCount++
    else if (r.verificationStatus === 'rejected') patientMap[pid].rejectedCount++
    else patientMap[pid].pendingCount++
  })

  const filteredClients = Object.values(patientMap).filter(p => 
    p.patientID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedClientData = selectedClient ? patientMap[selectedClient] : null

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Insurance Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.2rem' }}>
        <Stat label="Total Clients" value={Object.keys(patientMap).length} />
        <Stat label="Total Claims" value={activeRecords.length} />
        <Stat label="Pending Claims" value={pendingClaims.length} />
        <Stat label="Approved" value={activeRecords.filter(r => r.verificationStatus === 'verified').length} />
      </div>

      <h3 style={{ fontSize: 18, margin: '1.5rem 0 1rem', color: C.gold }}>📩 Pending Claims (Need Your Approval)</h3>
      <Card style={{ background: darkMode ? 'rgba(255,209,102,0.05)' : '#FFF8E1', borderColor: C.gold, marginBottom: '1.5rem' }}>
        {pendingClaims.length === 0 ? (
          <div style={{ padding: '1rem', color: secColor }}>No pending claims</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Record ID</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Patient</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Description</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontSize: 12, color: secColor }}>Amount</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Claim Date</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingClaims.map(r => (
                <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${borderColor}20` }}>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, fontFamily: 'monospace', color: textColor }}>{short(r.recordID, 6)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>{r.patientName || r.patientID}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>{r.description}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, textAlign: 'right', color: C.gold }}>${r.totalCost || 0}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, textAlign: 'center', color: secColor }}>{fmtD(r.claimDate)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, textAlign: 'center' }}>
                    <button onClick={() => onApproveClaim(r.recordID, 'approve')} style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`, border: 'none', borderRadius: 4, padding: '0.2rem 0.8rem', cursor: 'pointer', fontSize: 12, color: '#fff', marginRight: '0.3rem' }}>✅ Approve</button>
                    <button onClick={() => onApproveClaim(r.recordID, 'reject')} style={{ background: `linear-gradient(135deg, ${C.red}, ${C.pink})`, border: 'none', borderRadius: 4, padding: '0.2rem 0.8rem', cursor: 'pointer', fontSize: 12, color: '#fff' }}>❌ Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: 18, margin: 0, color: textColor }}>All Clients</h3>
        <Input 
          placeholder="🔍 Search by ID or Name..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 280, padding: '0.4rem 0.8rem', fontSize: 13, color: textColor, background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF', borderColor, borderRadius: 6 }}
        />
      </div>

      <Card style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Client ID</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Client Name</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Claims</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Total Amount</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Verified</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Pending</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Rejected</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(p => (
                <tr key={p.patientID} style={{ borderBottom: `0.5px solid ${borderColor}40` }}>
                  <td style={{ padding: '0.6rem', fontSize: 13, fontFamily: 'monospace', color: textColor }}>{p.patientID}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, fontWeight: 500, color: textColor }}>{p.name}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center', color: textColor }}>{p.records.length}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center', color: C.gold, fontWeight: 600 }}>${p.totalCost}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center' }}><Badge color={C.teal}>{p.verifiedCount}</Badge></td>
                  <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center' }}><Badge color={C.gold}>{p.pendingCount}</Badge></td>
                  <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center' }}><Badge color={C.red}>{p.rejectedCount}</Badge></td>
                  <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center' }}>
                    <button onClick={() => setSelectedClient(selectedClient === p.patientID ? null : p.patientID)} style={{ background: 'transparent', border: `0.5px solid ${borderColor}`, borderRadius: 4, padding: '0.2rem 0.8rem', cursor: 'pointer', fontSize: 12, color: textColor }}>
                      {selectedClient === p.patientID ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedClientData && (
        <Card style={{ background: darkMode ? 'rgba(0,245,212,0.04)' : '#F0FAFA', borderColor, borderLeft: `3px solid ${C.teal}`, marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: 18, marginBottom: '1rem', color: C.teal }}>📋 {selectedClientData.name} — All Claims</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Record ID</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Description</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontSize: 12, color: secColor }}>Total</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Status</th>
                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedClientData.records.map(r => (
                <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${borderColor}20` }}>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, fontFamily: 'monospace', color: textColor }}>{short(r.recordID, 6)}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>{r.description}</td>
                  <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, textAlign: 'right', color: C.gold }}>${r.totalCost || 0}</td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    {r.verificationStatus === 'verified' && <Badge color={C.teal}>✅</Badge>}
                    {r.verificationStatus === 'rejected' && <Badge color={C.red}>❌</Badge>}
                    {r.verificationStatus === 'pending' && <Badge color={C.gold}>⏳</Badge>}
                  </td>
                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                    {r.verificationStatus === 'pending' ? (
                      <>
                        <button onClick={() => onToggleVerify(r.recordID, 'verify')} style={{ background: 'transparent', border: `0.5px solid ${C.teal}`, borderRadius: 4, padding: '0.15rem 0.6rem', cursor: 'pointer', fontSize: 11, color: C.teal, marginRight: '0.2rem' }}>✅</button>
                        <button onClick={() => onToggleVerify(r.recordID, 'reject')} style={{ background: 'transparent', border: `0.5px solid ${C.red}`, borderRadius: 4, padding: '0.15rem 0.6rem', cursor: 'pointer', fontSize: 11, color: C.red }}>❌</button>
                      </>
                    ) : <span style={{ color: secColor, fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ── VerifyRecord with direct localStorage access ────────────────────────────
export const VerifyRecord = ({ records = [], onVerify, loading, darkMode = true, onToggleVerify }) => {
  const [patientID, setPatientID] = useState('')
  const [patientData, setPatientData] = useState(null)
  const [error, setError] = useState(null)
  // Local state for records, initialized from props but can be refreshed from localStorage
  const [localRecords, setLocalRecords] = useState(records)

  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'
  const bgInput = darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF'

  // ── Load from localStorage when component mounts ──────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('mc_records')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setLocalRecords(parsed)
        console.log('📋 Loaded from localStorage:', parsed)
      } catch (e) { /* ignore */ }
    }
  }, [])

  // ── Auto‑refresh when localRecords changes ────────────────────────────────
  useEffect(() => {
    if (patientID && patientID.trim()) {
      performSearch(patientID)
    }
  }, [localRecords])

  const performSearch = (pid) => {
    console.log('🔍 Searching records for patient:', pid)
    console.log('📋 Local records:', localRecords)
    if (!pid || !pid.trim()) {
      setError('Please enter a Patient ID')
      setPatientData(null)
      return
    }
    const trimmedPid = pid.trim()
    const patientRecords = localRecords.filter(r => 
      r.patientID && r.patientID.trim().toLowerCase() === trimmedPid.toLowerCase() && !r.revoked
    )
    console.log('📋 Found records for', trimmedPid, ':', patientRecords)
    if (patientRecords.length === 0) {
      setError(`No records found for patient ${trimmedPid}`)
      setPatientData(null)
    } else {
      setError(null)
      const name = patientRecords[0]?.patientName || trimmedPid
      const totalCost = patientRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0)
      setPatientData({ patientID: trimmedPid, name, records: patientRecords, totalCost })
    }
  }

  const handleSearch = () => {
    performSearch(patientID)
  }

  // ── Refresh: read from localStorage and update local state ────────────────
  const handleRefresh = () => {
    const stored = localStorage.getItem('mc_records')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setLocalRecords(parsed)
        console.log('🔄 Refreshed from localStorage:', parsed)
        if (patientID && patientID.trim()) {
          performSearch(patientID)
        } else {
          setError(null)
        }
      } catch (e) {
        alert('Error reading localStorage')
      }
    } else {
      alert('No records found in localStorage')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Verify Medical Records by Patient</h2>
      <Card style={{ maxWidth: 950, background: cardBg, borderColor }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
          <Input 
            placeholder="Enter Patient ID (e.g., P001) and press Enter" 
            value={patientID} 
            onChange={e => setPatientID(e.target.value)}
            style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: 14, color: textColor, background: bgInput, borderColor }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Btn onClick={handleSearch} disabled={loading} style={{ padding: '0.6rem 1.5rem' }}>{loading ? '⏳...' : '🔍 Search'}</Btn>
          <Btn onClick={handleRefresh} style={{ padding: '0.6rem 1.5rem', background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`, color: '#fff' }}>⟳ Refresh</Btn>
        </div>

        {error && <div style={{ color: C.red, marginTop: '0.5rem' }}>❌ {error}</div>}

        {patientData && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: 18, marginBottom: '0.5rem', color: C.teal }}>📋 Patient: {patientData.name} ({patientData.patientID})</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <Stat label="Total Claims" value={patientData.records.length} />
              <Stat label="Total Cost" value={'$' + patientData.totalCost} />
              <Stat label="Verified" value={patientData.records.filter(r => r.verificationStatus === 'verified').length} />
              <Stat label="Pending" value={patientData.records.filter(r => r.verificationStatus === 'pending').length} />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Record ID</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Description</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontSize: 12, color: secColor }}>Total</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Date</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Status</th>
                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontSize: 12, color: secColor }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientData.records.map(r => {
                  const isPending = r.verificationStatus === 'pending'
                  return (
                    <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${borderColor}20` }}>
                      <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, fontFamily: 'monospace', color: textColor }}>{short(r.recordID, 6)}</td>
                      <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>{r.description}</td>
                      <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, textAlign: 'right', color: C.gold }}>${r.totalCost || 0}</td>
                      <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, textAlign: 'center', color: secColor }}>{fmtD(r.timestamp)}</td>
                      <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                        {r.verificationStatus === 'verified' && <Badge color={C.teal}>✅</Badge>}
                        {r.verificationStatus === 'rejected' && <Badge color={C.red}>❌</Badge>}
                        {isPending && <Badge color={C.gold}>⏳</Badge>}
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', minWidth: '180px' }}>
                        {isPending ? (
                          <>
                            <button 
                              onClick={() => onToggleVerify(r.recordID, 'verify')} 
                              style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`, border: 'none', borderRadius: 4, padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: 11, color: '#fff', marginRight: '0.2rem' }}
                            >
                              ✅ Verify
                            </button>
                            <button 
                              onClick={() => onToggleVerify(r.recordID, 'reject')} 
                              style={{ background: `linear-gradient(135deg, ${C.red}, ${C.pink})`, border: 'none', borderRadius: 4, padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: 11, color: '#fff' }}
                            >
                              ❌ Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ color: secColor, fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
