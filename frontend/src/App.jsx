import React, { useState, useEffect } from 'react'
import { C, ROLES, NAV, PATIENTS as STATIC_PATIENTS } from './constants/theme'
import { TxModal, Toast } from './components'
import { 
  PatientDashboard, PatientRecords, PatientAccess, AuditTrail,
  PatientLabReports, PatientAppointments, PatientInsuranceClaims 
} from './pages/patient'
import { DoctorDashboard, DoctorCreateRecord, DoctorPatients, DoctorRecords } from './pages/doctor'
import { LabDashboard, LabAssigned, LabUpload, LabReports } from './pages/lab'
import { InsuranceDashboard, VerifyRecord } from './pages/insurance'
import * as api from './api/fabricService'

const SEED_RECORDS = [
  { 
    recordID: 'REC-001', patientID: 'P001', patientName: 'Sarah Ali', 
    fileCID: 'QmXa1BcdEf2GhIj3Kl', fileHash: '3a7d9f2b1c4e8f6a', 
    doctorName: 'Dr. Zia', description: 'Blood Test Report', 
    timestamp: '2026-06-24T11:29:12Z', accessList: ['P001', 'Dr. Zia'], revoked: false,
    doctorFee: 50, hospitalFee: 0, labFee: 30, logisticsFee: 0, totalCost: 80,
    verificationStatus: 'pending', verified: false,
    claimSubmitted: false, claimStatus: null
  },
  { 
    recordID: 'REC-002', patientID: 'P001', patientName: 'Sarah Ali', 
    fileCID: 'QmYb2CdeGh3IjJk4Lm', fileHash: '8b2e4f1a7c3d9e5f', 
    doctorName: 'Dr. Zia', description: 'X-Ray Chest', 
    timestamp: '2026-06-20T09:00:00Z', accessList: ['P001', 'Dr. Zia', 'InsureCo MSP'], revoked: false,
    doctorFee: 75, hospitalFee: 100, labFee: 0, logisticsFee: 0, totalCost: 175,
    verificationStatus: 'pending', verified: false,
    claimSubmitted: false, claimStatus: null
  },
  { 
    recordID: 'REC-003', patientID: 'P002', patientName: 'Omar Khan', 
    fileCID: 'QmAd4EfgIj5KlLm6No', fileHash: '7d4a9c1f3b2e8g5h', 
    doctorName: 'Dr. Zia', description: 'MRI Brain Scan', 
    timestamp: '2026-06-18T16:00:00Z', accessList: ['P002', 'Dr. Zia'], revoked: false,
    doctorFee: 150, hospitalFee: 250, labFee: 80, logisticsFee: 30, totalCost: 510,
    verificationStatus: 'pending', verified: false,
    claimSubmitted: false, claimStatus: null
  },
]
const SEED_AUDIT = [
  { id: 'LOG-001', recordID: 'REC-001', requester: 'InsureCo MSP', result: 'DENIED', timestamp: '2026-06-25T10:22:00Z' },
  { id: 'LOG-002', recordID: 'REC-002', requester: 'InsureCo MSP', result: 'GRANTED', timestamp: '2026-06-24T09:15:00Z' },
]

// ── Login ──────────────────────────────────────────────
const Login = ({ onLogin, darkMode }) => {
  const handleRoleSelect = (roleId) => {
    const demoUser = {
      patient: { msp: 'P001', user: 'Sarah Ali' },
      doctor: { msp: 'Org1MSP', user: 'Dr. Zia' },
      lab: { msp: 'Org2MSP', user: 'Lab Technician' },
      insurance: { msp: 'InsureCo MSP', user: 'InsureCo Agent' },
    }
    const roleData = ROLES.find(r => r.id === roleId)
    onLogin({ ...roleData, ...demoUser[roleId] })
  }

  const bg = darkMode ? '#060B18' : '#F0F4FF'
  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 48 }}>⛓️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, background: `linear-gradient(135deg,${C.cyan},${C.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MedChain</h1>
        <p style={{ fontSize: 14, color: darkMode ? C.sec : '#555' }}>Secure Medical Records on Blockchain</p>
        <p style={{ fontSize: 12, color: darkMode ? C.muted : '#888' }}>Click a role below to login (Demo Mode)</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: 560, width: '100%' }}>
        {ROLES.map(r => (
          <div key={r.id} onClick={() => handleRoleSelect(r.id)} style={{ background: cardBg, border: `1px solid ${r.color}33`, borderRadius: 14, padding: '1.2rem 1rem', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${r.color}33`; e.currentTarget.style.background = cardBg }}>
            <div style={{ fontSize: 32 }}>{r.id === 'patient' && '👤'}{r.id === 'doctor' && '🩺'}{r.id === 'lab' && '🔬'}{r.id === 'insurance' && '🏦'}</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: r.color }}>{r.label}</div>
            <div style={{ fontSize: 12, color: darkMode ? C.sec : '#555' }}>{r.desc}</div>
            <div style={{ fontSize: 10, color: darkMode ? C.muted : '#888' }}>Click to login</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '1.5rem', fontSize: 11, color: darkMode ? C.sec : '#888' }}>🔓 Demo Mode — No password required · Password for Live Mode: <code>medchain2025</code></p>
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────
const Sidebar = ({ role, page, onNavigate, onLogout, darkMode, toggleTheme }) => {
  const nav = NAV[role.id] || []
  return (
    <div style={{ width: 220, background: darkMode ? '#080E1C' : '#FFFFFF', borderRight: `0.5px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '1rem', borderBottom: `0.5px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'}` }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: role.color }}>⛓️ MedChain</div>
        <div style={{ fontSize: 12, color: darkMode ? 'rgba(238,242,255,0.65)' : '#555' }}>{role.user}</div>
        <div style={{ fontSize: 11, color: darkMode ? 'rgba(238,242,255,0.45)' : '#888', fontFamily: 'monospace' }}>{role.msp}</div>
      </div>
      <nav style={{ flex: 1, padding: '0.5rem' }}>
        {nav.map(n => (
          <div key={n.id} onClick={() => onNavigate(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', fontSize: 14, background: page === n.id ? `${role.color}18` : 'transparent', color: page === n.id ? role.color : (darkMode ? 'rgba(238,242,255,0.65)' : '#666'), fontWeight: page === n.id ? 600 : 400 }}>
            <i className={`ti ${n.icon}`} style={{ fontSize: 18 }} />{n.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: '0.5rem', borderTop: `0.5px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'}` }}>
        <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: darkMode ? 'rgba(238,242,255,0.65)' : '#555', cursor: 'pointer', fontSize: 13, padding: '6px 12px', width: '100%', textAlign: 'left' }}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
        <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: darkMode ? 'rgba(238,242,255,0.65)' : '#555' }}>
          <i className="ti ti-logout" style={{ fontSize: 16 }} />Logout
        </div>
      </div>
    </div>
  )
}

// ── TopBar ──────────────────────────────────────────────
const TopBar = ({ role, page, darkMode }) => {
  const n = (NAV[role.id] || []).find(x => x.id === page)
  return (
    <div style={{ height: 56, borderBottom: `0.5px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'}`, display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: 12, background: darkMode ? '#060B18' : '#F8FAFF' }}>
      {n && <i className={`ti ${n.icon}`} style={{ fontSize: 18, color: role.color }} />}
      <span style={{ fontWeight: 600, fontSize: 18, color: darkMode ? '#EEF2FF' : '#1A1F36' }}>{n?.label || 'Dashboard'}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: darkMode ? 'rgba(238,242,255,0.65)' : '#555' }}>{role.user}</span>
        <span style={{ fontSize: 13, color: role.color, fontFamily: 'monospace' }}>{role.msp}</span>
      </div>
    </div>
  )
}

// ── App ──────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mc_darkMode')
    return saved !== null ? saved === 'true' : true
  })
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('mc_role')
    return saved ? JSON.parse(saved) : null
  })
  const [page, setPage] = useState(() => {
    return localStorage.getItem('mc_page') || 'dashboard'
  })

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('mc_records')
    if (saved) {
      try { return JSON.parse(saved) } catch { return SEED_RECORDS }
    }
    return SEED_RECORDS
  })

  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('mc_patients')
    if (saved) {
      try { return JSON.parse(saved) } catch { return STATIC_PATIENTS }
    }
    return STATIC_PATIENTS
  })

  const [audit, setAudit] = useState(SEED_AUDIT)
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    localStorage.setItem('mc_records', JSON.stringify(records))
  }, [records])

  useEffect(() => {
    localStorage.setItem('mc_patients', JSON.stringify(patients))
  }, [patients])

  useEffect(() => {
    localStorage.setItem('mc_darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('mc_role', JSON.stringify(role))
  }, [role])

  useEffect(() => {
    localStorage.setItem('mc_page', page)
  }, [page])

  const toggleTheme = () => setDarkMode(prev => !prev)
  const pushToast = (title, body, error = false) => {
    const id = Date.now()
    setToasts(t => [...t, { id, title, body, error }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500)
  }

  const addPatient = (newPatient) => {
    if (patients.find(p => p.patientID === newPatient.patientID)) {
      pushToast('Error', `Patient ${newPatient.patientID} already exists!`, true)
      return false
    }
    setPatients([...patients, newPatient])
    pushToast('Success', `Patient ${newPatient.name} added!`)
    return true
  }

  const fireTx = async (label, demoFn) => {
    setLoading(true); setTx({ loading: true })
    try {
      await new Promise(r => setTimeout(r, 1400))
      demoFn()
      setTx({ loading: false, txId: '0x' + Math.random().toString(16).slice(2, 10) })
      pushToast('Transaction Complete', label)
    } catch (err) {
      setTx({ loading: false, error: err.message })
      pushToast('Transaction Failed', err.message, true)
    } finally { setLoading(false) }
  }

  const handleCreate = (form) => fireTx('CreateRecord', () => {
    const recordID = 'REC-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    const patientName = patients.find(p => p.patientID === form.patientID)?.name || form.patientID
    const newRecord = {
      ...form,
      recordID,
      patientName,
      timestamp: new Date().toISOString(),
      accessList: [form.patientID, form.doctorName],
      revoked: false,
      // ✅ CRITICAL: set verificationStatus to 'pending' so insurance can act
      verificationStatus: 'pending',
      verified: false,
      doctorFee: Number(form.doctorFee) || 0,
      hospitalFee: Number(form.hospitalFee) || 0,
      labFee: Number(form.labFee) || 0,
      logisticsFee: Number(form.logisticsFee) || 0,
      totalCost: (Number(form.doctorFee) || 0) + (Number(form.hospitalFee) || 0) + 
                 (Number(form.labFee) || 0) + (Number(form.logisticsFee) || 0),
      claimSubmitted: false,
      claimStatus: null
    }
    setRecords(prev => [newRecord, ...prev])
  })

  const handleGrant = (recID, grantee) => fireTx('GrantAccess', () => {
    setRecords(prev => prev.map(r => r.recordID === recID ? { ...r, accessList: r.accessList.includes(grantee) ? r.accessList : [...r.accessList, grantee] } : r))
  })

  const handleRevoke = (recID, grantee) => fireTx('RevokeAccess', () => {
    if (grantee) {
      setRecords(prev => prev.map(r => r.recordID === recID ? { ...r, accessList: r.accessList.filter(a => a !== grantee) } : r))
    } else {
      setRecords(prev => prev.map(r => r.recordID === recID ? { ...r, revoked: true } : r))
    }
  })

  // ── Insurance Verification (Toggle verify/reject) ──────────────
  const handleToggleVerify = (recordID, action = 'verify') => {
    const rec = records.find(r => r.recordID === recordID)
    if (!rec) return
    const newStatus = action === 'verify' ? 'verified' : 'rejected'
    setRecords(prev => prev.map(r => 
      r.recordID === recordID ? { 
        ...r, 
        verified: action === 'verify',
        verificationStatus: newStatus,
        verifiedBy: 'InsureCo Agent',
        verifiedAt: new Date().toISOString()
      } : r
    ))
    setAudit(prev => [{ 
      id: 'LOG-' + String(prev.length+1).padStart(3,'0'), 
      recordID, 
      requester: 'InsureCo MSP', 
      result: action === 'verify' ? 'VERIFIED' : 'REJECTED', 
      timestamp: new Date().toISOString() 
    }, ...prev])
    pushToast('Verification Updated', `Record ${recordID} ${action === 'verify' ? 'verified' : 'rejected'}`)
  }

  // ── Insurance Claim Approval (Approve/Reject claim) ──────────────
  const handleApproveClaim = (recordID, action) => {
    setRecords(prev => prev.map(r => 
      r.recordID === recordID ? { 
        ...r, 
        claimStatus: action === 'approve' ? 'approved' : 'rejected',
        verificationStatus: action === 'approve' ? 'verified' : 'rejected',
        verified: action === 'approve',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'InsureCo Agent'
      } : r
    ))
    pushToast('Claim ' + (action === 'approve' ? 'Approved' : 'Rejected'), 
      `Claim for ${recordID} ${action === 'approve' ? 'approved' : 'rejected'} by insurance`)
  }

  // ── Lab Complete ────────────────────────────────────────
  const handleCompleteLab = (recordID) => {
    setRecords(prev => prev.map(r => 
      r.recordID === recordID ? { ...r, lab_completed: true, lab_completed_at: new Date().toISOString() } : r
    ))
    pushToast('Lab Test Completed', `Record ${recordID} marked as complete`)
  }

  // ── Patient Claim Submission ──────────────────────────────
  const handleClaim = (recordID) => {
    setRecords(prev => prev.map(r => 
      r.recordID === recordID ? { 
        ...r, 
        claimSubmitted: true, 
        claimDate: new Date().toISOString(),
        claimStatus: 'pending'
      } : r
    ))
    pushToast('Claim Submitted', `Claim for ${recordID} sent to insurance for approval`)
  }

  const handleVerify = (recID) => fireTx('RequestRecordAccess', () => {
    setAudit(prev => [{ id: 'LOG-' + String(prev.length+1).padStart(3,'0'), recordID: recID, requester: 'InsureCo MSP', result: 'GRANTED', timestamp: new Date().toISOString() }, ...prev])
  })

  const handleLogin = (userData) => {
    setRole(userData); setPage('dashboard'); pushToast('Logged In', `Welcome ${userData.user}`)
  }
  const handleLogout = () => { setRole(null); setPage('dashboard'); pushToast('Logged Out', 'See you soon!') }

  if (!role) return <Login onLogin={handleLogin} darkMode={darkMode} />

  const PAGE_MAP = {
    patient: {
      dashboard: <PatientDashboard records={records} audit={audit} role={role} darkMode={darkMode} />,
      records: <PatientRecords records={records} role={role} darkMode={darkMode} />,
      'lab-reports': <PatientLabReports records={records} role={role} darkMode={darkMode} />,
      appointments: <PatientAppointments role={role} darkMode={darkMode} />,
      claims: <PatientInsuranceClaims records={records} role={role} onClaim={handleClaim} darkMode={darkMode} />,
      access: <PatientAccess records={records} onGrant={handleGrant} onRevoke={handleRevoke} role={role} darkMode={darkMode} />,
      audit: <AuditTrail audit={audit} darkMode={darkMode} />,
    },
    doctor: {
      dashboard: <DoctorDashboard records={records} role={role} darkMode={darkMode} />,
      create: <DoctorCreateRecord onSubmit={handleCreate} loading={loading} doctorName={role.user} patientsList={patients} darkMode={darkMode} />,
      patients: <DoctorPatients records={records} patientsList={patients} onAddPatient={addPatient} darkMode={darkMode} />,
      records: <DoctorRecords records={records} role={role} />,
    },
    lab: {
      dashboard: <LabDashboard records={records} role={role} darkMode={darkMode} />,
      assigned: <LabAssigned records={records} role={role} darkMode={darkMode} onComplete={handleCompleteLab} />,
      upload: <LabUpload onSubmit={handleCreate} loading={loading} doctorName={role.user} patientsList={patients} darkMode={darkMode} demoMode={true} />,
      reports: <LabReports records={records} role={role} darkMode={darkMode} />,
    },
    insurance: {
      dashboard: <InsuranceDashboard audit={audit} darkMode={darkMode} records={records} onToggleVerify={handleToggleVerify} onApproveClaim={handleApproveClaim} />,
      verify: <VerifyRecord records={records} onVerify={handleVerify} loading={loading} darkMode={darkMode} onToggleVerify={handleToggleVerify} />,
      history: <AuditTrail audit={audit} title="Verification History" darkMode={darkMode} />,
    },
  }

  return (
    <div style={{ display: 'flex', background: darkMode ? '#060B18' : '#F0F4FF', minHeight: '100vh', color: darkMode ? '#EEF2FF' : '#1A1F36' }}>
      <Sidebar role={role} page={page} onNavigate={setPage} onLogout={handleLogout} darkMode={darkMode} toggleTheme={toggleTheme} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar role={role} page={page} darkMode={darkMode} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {PAGE_MAP[role.id]?.[page] || <div style={{ color: darkMode ? 'rgba(238,242,255,0.65)' : '#888' }}>Page not found</div>}
        </div>
      </div>
      <TxModal state={tx} onClose={() => setTx(null)} />
      <Toast messages={toasts} />
    </div>
  )
}
