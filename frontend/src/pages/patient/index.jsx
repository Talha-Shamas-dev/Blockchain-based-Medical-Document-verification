import React, { useState } from 'react'
import { C } from '../../constants/theme'
import { Card, Badge, Btn, Stat, Input, fmtD, fmtT, short } from '../../components'

const copyToClipboard = (text) => {
  navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!')).catch(() => {})
}

const DOCTORS = [
  { id: 'D001', name: 'Dr. Zia', specialty: 'Cardiology', available: ['Mon 9:00-11:00', 'Wed 14:00-16:00'] },
  { id: 'D002', name: 'Dr. Tariq Hassan', specialty: 'Orthopedics', available: ['Tue 10:00-12:00', 'Thu 15:00-17:00'] },
  { id: 'D003', name: 'Dr. Fatima Noor', specialty: 'Pediatrics', available: ['Mon 13:00-15:00', 'Fri 9:00-11:00'] },
]

// ── Patient Dashboard ──────────────────────────────────────────
export const PatientDashboard = ({ records, audit, role, darkMode = true }) => {
  const myRecords = records.filter(r => r.patientID === role.msp && !r.revoked)
  const totalRecords = myRecords.length
  const totalCost = myRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0)
  const pendingInsurance = myRecords.filter(r => r.verificationStatus === 'pending').length
  const nextAppointment = 'Jul 10, 2026 - Dr. Zia (Cardiology)'
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Patient Dashboard</h2>
      <Card style={{ background: `linear-gradient(135deg, ${C.cyan}22, ${C.purple}22)`, border: `0.5px solid ${C.bd}`, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: textColor }}>{role.user}</div>
            <div style={{ fontSize: 14, color: secColor }}>Patient ID: {role.msp}</div>
            <div style={{ fontSize: 13, color: darkMode ? C.muted : '#888' }}>Member since Jan 2026</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Badge color={C.teal}>Active</Badge>
            <div style={{ fontSize: 13, color: secColor, marginTop: '0.2rem' }}>📧 {role.user.toLowerCase().replace(' ', '.')}@email.com</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Stat label="Total Visits" value={totalRecords} />
        <Stat label="Total Expenses" value={'$' + totalCost} />
        <Stat label="Pending Insurance" value={pendingInsurance} />
        <Stat label="Next Visit" value={nextAppointment} />
      </div>

      <Card style={{ padding: '0.5rem 1rem', background: darkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFF' }}>
        <div style={{ fontSize: 13, color: secColor }}>💡 Tip: Use the sidebar to navigate.</div>
      </Card>
    </div>
  )
}

// ── My Records ──────────────────────────────────────────────────
export const PatientRecords = ({ records, role, darkMode = true }) => {
  const myRecords = records.filter(r => r.patientID === role.msp && !r.revoked)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>My Medical Records</h2>
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#F5F7FA' }}>
              <tr style={{ borderBottom: `0.5px solid ${darkMode ? C.bd : '#E0E4F0'}` }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Record ID</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Doctor</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Description</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', fontSize: 13, color: secColor }}>Total Cost</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Date</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Status</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: secColor }}>No records found</td></tr>
              ) : (
                myRecords.map(r => (
                  <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${darkMode ? C.bd : '#E0E4F0'}40` }}>
                    <td style={{ padding: '0.6rem', fontSize: 13, fontFamily: 'monospace', color: textColor }}>{short(r.recordID, 8)}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, color: textColor }}>{r.doctorName}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, color: textColor }}>{r.description}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'right', color: C.gold }}>${r.totalCost || 0}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center', color: secColor }}>{fmtD(r.timestamp)}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center' }}>
                      {r.verificationStatus === 'verified' && <Badge color={C.teal}>✅ Verified</Badge>}
                      {r.verificationStatus === 'rejected' && <Badge color={C.red}>❌ Rejected</Badge>}
                      {r.verificationStatus === 'pending' && <Badge color={C.gold}>⏳ Pending</Badge>}
                    </td>
                    <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedRecord(selectedRecord === r.recordID ? null : r.recordID)}
                        style={{ background: 'transparent', border: `0.5px solid ${darkMode ? C.bd : '#E0E4F0'}`, borderRadius: 4, padding: '0.15rem 0.6rem', cursor: 'pointer', fontSize: 12, color: textColor }}
                      >
                        {selectedRecord === r.recordID ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedRecord && (
        <Card style={{ marginTop: '1.5rem', background: darkMode ? 'rgba(0,245,212,0.04)' : '#F0FAFA', borderLeft: `3px solid ${C.teal}` }}>
          {(() => {
            const r = myRecords.find(rec => rec.recordID === selectedRecord)
            if (!r) return null
            return (
              <div>
                <h3 style={{ fontSize: 18, marginBottom: '0.5rem', color: C.teal }}>📋 Record Details: {r.recordID}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><b style={{ color: textColor }}>Patient:</b> <span style={{ color: secColor }}>{r.patientName || r.patientID}</span></div>
                  <div><b style={{ color: textColor }}>Doctor:</b> <span style={{ color: secColor }}>{r.doctorName}</span></div>
                  <div style={{ gridColumn: '1 / 3' }}><b style={{ color: textColor }}>Description:</b> <span style={{ color: secColor }}>{r.description}</span></div>
                  <div><b style={{ color: textColor }}>Date:</b> <span style={{ color: secColor }}>{fmtD(r.timestamp)}</span></div>
                  <div><b style={{ color: textColor }}>Status:</b> <span style={{ color: secColor }}>{r.verificationStatus}</span></div>
                  <div><b style={{ color: textColor }}>Total Cost:</b> <span style={{ color: C.gold }}>${r.totalCost || 0}</span></div>
                  <div><b style={{ color: textColor }}>Doctor Fee:</b> <span style={{ color: secColor }}>${r.doctorFee || 0}</span></div>
                  <div><b style={{ color: textColor }}>Hospital Fee:</b> <span style={{ color: secColor }}>${r.hospitalFee || 0}</span></div>
                  <div><b style={{ color: textColor }}>Lab Fee:</b> <span style={{ color: secColor }}>${r.labFee || 0}</span></div>
                  <div><b style={{ color: textColor }}>Logistics:</b> <span style={{ color: secColor }}>${r.logisticsFee || 0}</span></div>
                  <div style={{ gridColumn: '1 / 3' }}>
                    <b style={{ color: textColor }}>SHA-256 Hash:</b>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all', color: secColor, background: darkMode ? 'rgba(255,255,255,0.02)' : '#F5F7FA', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                      {r.fileHash}
                      <button onClick={() => copyToClipboard(r.fileHash)} style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer' }}>📋</button>
                    </div>
                  </div>
                  {r.fileData && (
                    <div style={{ gridColumn: '1 / 3' }}>
                      <b style={{ color: textColor }}>File:</b>
                      <a href={r.fileData} download={r.fileName || 'report'} target="_blank" rel="noopener noreferrer" style={{ color: C.cyan, marginLeft: '0.5rem' }}>📥 Download {r.fileName || 'report'}</a>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </Card>
      )}
    </div>
  )
}

// ── Access Control ─────────────────────────────────────────────
export const PatientAccess = ({ records, onGrant, onRevoke, role, darkMode = true }) => {
  const myRecords = records.filter(r => r.patientID === role.msp && !r.revoked)
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Access Control</h2>
      {myRecords.map(r => (
        <Card key={r.recordID} style={{ marginBottom: '0.6rem' }}>
          <b style={{ color: textColor }}>{r.recordID}</b> — <span style={{ color: secColor }}>{r.description} (${r.totalCost || 0})</span>
          <div style={{ marginTop: '0.4rem', fontSize: 11, color: secColor }}>Access List: {r.accessList?.join(', ') || 'None'}</div>
          <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Input placeholder="Grantee ID" style={{ width: 'auto', flex: 1, minWidth: 150 }} id={`grant-${r.recordID}`} />
            <Btn onClick={() => { const v = document.getElementById(`grant-${r.recordID}`); if(v) onGrant(r.recordID, v.value) }}>Grant</Btn>
            <Input placeholder="Revoke ID" style={{ width: 'auto', flex: 1, minWidth: 150 }} id={`revoke-${r.recordID}`} />
            <Btn variant="secondary" onClick={() => { const v = document.getElementById(`revoke-${r.recordID}`); if(v) onRevoke(r.recordID, v.value) }}>Revoke</Btn>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Audit Trail ──────────────────────────────────────────────
export const AuditTrail = ({ audit = [], title = "Audit Trail", darkMode = true }) => {
  const rows = audit.map(a => [fmtD(a.timestamp), a.recordID, a.requester, a.result])
  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: darkMode ? '#EEF2FF' : '#1A1F36' }}>{title}</h2>
      <Tbl headers={['Timestamp','Record','Requester','Result']} rows={rows} />
    </div>
  )
}

// ── Lab Reports ─────────────────────────────────────────────────
export const PatientLabReports = ({ records, role, darkMode = true }) => {
  const labRecords = records.filter(r => r.patientID === role.msp && r.lab_completed === true)
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>My Lab Reports</h2>
      {labRecords.length === 0 ? (
        <Card><div style={{ color: secColor }}>No lab reports available</div></Card>
      ) : (
        labRecords.map(r => (
          <Card key={r.recordID} style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: textColor }}>{r.description}</div>
                <div style={{ fontSize: 13, color: secColor }}>Doctor: {r.doctorName}</div>
                <div style={{ fontSize: 13, color: secColor }}>Date: {fmtD(r.timestamp)}</div>
              </div>
              <div>
                {r.fileData && (
                  <a href={r.fileData} download={r.fileName || 'lab-report'} target="_blank" rel="noopener noreferrer" style={{ color: C.cyan }}>📥 Download</a>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

// ── Appointments ────────────────────────────────────────────────
export const PatientAppointments = ({ role, darkMode = true }) => {
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointments, setAppointments] = useState([
    { id: 'A001', doctor: 'Dr. Zia', specialty: 'Cardiology', date: '2026-07-10', time: '10:00 AM', status: 'Upcoming' }
  ])
  const [selectedSlot, setSelectedSlot] = useState('')
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'

  const handleBook = () => {
    if (!selectedDoctor || !appointmentDate || !selectedSlot) {
      alert('Please select a doctor, date, and time slot.')
      return
    }
    const doctor = DOCTORS.find(d => d.id === selectedDoctor)
    if (!doctor) return
    setAppointments([...appointments, {
      id: 'A' + Date.now(),
      doctor: doctor.name,
      specialty: doctor.specialty,
      date: appointmentDate,
      time: selectedSlot,
      status: 'Pending'
    }])
    alert(`Appointment booked with ${doctor.name} on ${appointmentDate} at ${selectedSlot}`)
    setSelectedDoctor('')
    setAppointmentDate('')
    setSelectedSlot('')
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>My Appointments</h2>
      
      <h3 style={{ fontSize: 18, marginBottom: '0.5rem', color: textColor }}>📅 Upcoming Appointments</h3>
      {appointments.filter(a => a.status === 'Upcoming' || a.status === 'Pending').length === 0 ? (
        <Card><div style={{ color: secColor }}>No upcoming appointments</div></Card>
      ) : (
        appointments.filter(a => a.status === 'Upcoming' || a.status === 'Pending').map(a => (
          <Card key={a.id} style={{ marginBottom: '0.5rem', borderLeft: `3px solid ${C.teal}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: textColor }}>{a.doctor}</div>
                <div style={{ fontSize: 13, color: secColor }}>{a.specialty}</div>
                <div style={{ fontSize: 13, color: secColor }}>{a.date} at {a.time}</div>
              </div>
              <Badge color={a.status === 'Upcoming' ? C.teal : C.gold}>{a.status}</Badge>
            </div>
          </Card>
        ))
      )}

      <h3 style={{ fontSize: 18, marginTop: '1.5rem', marginBottom: '0.5rem', color: textColor }}>📝 Book New Appointment</h3>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Select Doctor</label>
            <select 
              value={selectedDoctor} 
              onChange={e => setSelectedDoctor(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: `0.5px solid ${darkMode ? C.bd : '#E0E4F0'}`, background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', color: textColor }}
            >
              <option value="">Choose a doctor</option>
              {DOCTORS.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Date</label>
            <Input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} style={{ padding: '0.5rem', color: textColor, background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor: darkMode ? C.bd : '#E0E4F0' }} />
          </div>
        </div>
        {selectedDoctor && (
          <div style={{ marginTop: '0.8rem' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Available Time Slots</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {DOCTORS.find(d => d.id === selectedDoctor)?.available.map(slot => (
                <button 
                  key={slot} 
                  onClick={() => setSelectedSlot(slot)}
                  style={{ 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: 4, 
                    border: `0.5px solid ${selectedSlot === slot ? C.teal : darkMode ? C.bd : '#E0E4F0'}`,
                    background: selectedSlot === slot ? C.teal : 'transparent',
                    color: selectedSlot === slot ? '#000' : textColor,
                    cursor: 'pointer'
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}
        <Btn onClick={handleBook} style={{ marginTop: '0.8rem', background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, color: '#fff', border: 'none', padding: '0.5rem 1.2rem' }}>Book Appointment</Btn>
      </Card>
    </div>
  )
}

// ── Insurance Claims ─────────────────────────────────────────────
export const PatientInsuranceClaims = ({ records, role, onClaim, darkMode = true }) => {
  const myRecords = records.filter(r => r.patientID === role.msp && !r.revoked)
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'

  const handleClaim = (recordID) => {
    if (window.confirm(`Submit insurance claim for record ${recordID}? This will be sent to the insurance company for verification.`)) {
      onClaim(recordID)
      alert('✅ Claim submitted successfully! You will be notified once it is verified.')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Insurance Claims</h2>
      {myRecords.length === 0 ? (
        <Card><div style={{ color: secColor }}>No medical records found.</div></Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {myRecords.map(r => {
            const isClaimable = !r.claimSubmitted
            return (
              <Card key={r.recordID} style={{ borderLeft: `3px solid ${r.claimSubmitted ? C.teal : C.gold}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: textColor }}>{r.description}</div>
                    <div style={{ fontSize: 13, color: secColor }}>Record ID: {r.recordID}</div>
                    <div style={{ fontSize: 13, color: secColor }}>Doctor: {r.doctorName}</div>
                    <div style={{ fontSize: 13, color: secColor }}>Date: {fmtD(r.timestamp)}</div>
                    <div style={{ fontSize: 13, color: secColor }}>Total Cost: <span style={{ color: C.gold, fontWeight: 600 }}>${r.totalCost || 0}</span></div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      {r.claimSubmitted && <Badge color={C.gold}>📤 Claimed</Badge>}
                      {r.verificationStatus === 'verified' && <Badge color={C.teal}>✅ Approved</Badge>}
                      {r.verificationStatus === 'rejected' && <Badge color={C.red}>❌ Rejected</Badge>}
                      {!r.claimSubmitted && <Badge color={C.sec}>Not Claimed</Badge>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                    {!r.claimSubmitted && (
                      <button
                        onClick={() => handleClaim(r.recordID)}
                        style={{
                          background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
                          border: 'none',
                          borderRadius: 8,
                          padding: '0.6rem 1.5rem',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(255, 209, 102, 0.4)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.03)'
                          e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 209, 102, 0.6)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 209, 102, 0.4)'
                        }}
                      >
                        💰 Submit Claim
                      </button>
                    )}
                    {r.claimSubmitted && r.verificationStatus === 'pending' && (
                      <Badge color={C.gold}>⏳ Waiting for Approval</Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
