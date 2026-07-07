import React, { useState, useRef, useEffect } from 'react'
import { C, PATIENTS as STATIC_PATIENTS } from '../../constants/theme'
import { Card, Badge, Btn, Stat, Input, Sel, Tbl, fmtD, fmtT, short } from '../../components'

// ── Doctor Dashboard ──────────────────────────────────────────
export const DoctorDashboard = ({ records, role, darkMode = true }) => {
  const myRecords = records.filter(r => r.doctorName === role.user)
  const totalRecords = myRecords.length
  const uniquePatients = [...new Set(myRecords.map(r => r.patientID))]
  const totalPatients = uniquePatients.length
  const totalFees = myRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0)

  const emergencyRecords = myRecords.filter(r => 
    r.description?.toLowerCase().includes('emergency') || 
    r.description?.toLowerCase().includes('urgent')
  )
  const emergencyCount = emergencyRecords.length

  const latestRecords = [...myRecords].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3)

  const [appointments] = useState([
    { id: 'A001', patient: 'Sarah Ali', time: '10:00 AM', type: 'Follow-up' },
    { id: 'A002', patient: 'Omar Khan', time: '11:30 AM', type: 'Checkup' },
    { id: 'A003', patient: 'Ahmed Hassan', time: '2:00 PM', type: 'Emergency' },
  ])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // ── Dynamic colors ──────────────────────────────────────────
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'
  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF'
  const tableHeaderBg = darkMode ? 'rgba(255,255,255,0.04)' : '#F5F7FA'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0, color: textColor }}>Doctor Dashboard</h2>
          <p style={{ fontSize: 14, color: secColor, margin: '0.2rem 0 0' }}>
            Welcome back, {role.user} • <span style={{ color: C.cyan }}>{today}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Btn style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, color: '#fff', border: 'none', padding: '0.4rem 1rem' }}>
            📋 Create Record
          </Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Stat label="Total Records" value={totalRecords} />
        <Stat label="Patients Treated" value={totalPatients} />
        <Stat label="Emergency Cases" value={emergencyCount} />
        <Stat label="Total Fees" value={'$' + totalFees} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <Card style={{ background: cardBg, borderColor }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 style={{ fontSize: 18, color: textColor, margin: 0 }}>📅 Today's Appointments</h3>
            <Btn style={{ fontSize: 12, padding: '0.15rem 0.8rem', background: 'transparent', border: `0.5px solid ${borderColor}`, color: secColor }}>
              View All
            </Btn>
          </div>
          {appointments.length === 0 ? (
            <div style={{ color: secColor, fontSize: 14 }}>No appointments for today</div>
          ) : (
            appointments.map((apt, idx) => (
              <div key={apt.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '0.5rem 0', borderBottom: idx < appointments.length - 1 ? `0.5px solid ${borderColor}` : 'none' 
              }}>
                <div>
                  <div style={{ fontWeight: 500, color: textColor }}>{apt.patient}</div>
                  <div style={{ fontSize: 12, color: secColor }}>{apt.type} • {apt.time}</div>
                </div>
                <Badge color={apt.type === 'Emergency' ? C.red : C.cyan}>{apt.type}</Badge>
              </div>
            ))
          )}
        </Card>

        <Card style={{ background: cardBg, borderColor }}>
          <h3 style={{ fontSize: 18, color: textColor, margin: '0 0 0.8rem 0' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Btn style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`, color: '#fff', border: 'none', padding: '0.5rem', fontSize: 14, justifyContent: 'flex-start' }}>
              ➕ Create New Record
            </Btn>
            <Btn style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`, color: '#fff', border: 'none', padding: '0.5rem', fontSize: 14, justifyContent: 'flex-start' }}>
              👥 View All Patients
            </Btn>
            <Btn style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`, color: '#fff', border: 'none', padding: '0.5rem', fontSize: 14, justifyContent: 'flex-start' }}>
              🚑 Emergency Cases
            </Btn>
            <Btn style={{ background: `linear-gradient(135deg, ${C.pink}, ${C.red})`, color: '#fff', border: 'none', padding: '0.5rem', fontSize: 14, justifyContent: 'flex-start' }}>
              ⏰ Edit Schedule
            </Btn>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: 18, color: textColor, marginBottom: '0.8rem' }}>📋 Recently Added Records</h3>
        <Card style={{ background: cardBg, borderColor, overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: tableHeaderBg }}>
              <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Patient</th>
                <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Description</th>
                <th style={{ padding: '0.6rem', textAlign: 'right', fontSize: 13, color: secColor }}>Cost</th>
                <th style={{ padding: '0.6rem', textAlign: 'center', fontSize: 13, color: secColor }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestRecords.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: secColor }}>No records yet</td></tr>
              ) : (
                latestRecords.map(r => (
                  <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${borderColor}40` }}>
                    <td style={{ padding: '0.6rem', fontSize: 13, color: textColor }}>{r.patientName || r.patientID}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, color: textColor }}>{r.description}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'right', color: C.gold }}>${r.totalCost || 0}</td>
                    <td style={{ padding: '0.6rem', fontSize: 13, textAlign: 'center', color: secColor }}>{fmtD(r.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

// ── Create Record ──────────────────────────────────────────────
export const DoctorCreateRecord = ({ onSubmit, loading, doctorName, patientsList = [], darkMode = true }) => {
  const [form, setForm] = useState({
    patientID: '',
    fileCID: '',
    fileHash: '',
    description: '',
    recordDate: new Date().toISOString().split('T')[0],
    notes: '',
    fileData: null,
    fileName: '',
    doctorFee: 0,
    hospitalFee: 0,
    logisticsFee: 0
  })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [patientName, setPatientName] = useState('')
  const fileInputRef = useRef(null)

  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'
  const bgInput = darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF'
  const bgDisabled = darkMode ? 'rgba(255,255,255,0.02)' : '#F5F7FA'
  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF'

  const handlePatientIDChange = (value) => {
    setForm({ ...form, patientID: value })
    const found = patientsList.find(p => p.patientID === value)
    setPatientName(found ? found.name : '')
    if (value && form.description) generateHashFromData(value, form.description)
  }

  const generateHashFromData = async (patientID, description) => {
    if (!patientID || !description) return
    try {
      const data = `${patientID}|${description}|${form.recordDate}|${doctorName}`
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      const mockCID = 'Qm' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8)
      setForm(prev => ({ ...prev, fileHash: hashHex, fileCID: mockCID }))
    } catch { /* ignore */ }
  }

  const handleDescriptionChange = (value) => {
    setForm({ ...form, description: value })
    if (form.patientID && value) generateHashFromData(form.patientID, value)
  }

  const handleDateChange = (value) => {
    setForm({ ...form, recordDate: value })
    if (form.patientID && form.description) generateHashFromData(form.patientID, form.description)
  }

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, fileData: reader.result, fileName: selectedFile.name }))
      }
      reader.readAsDataURL(selectedFile)

      const buffer = await selectedFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      const mockCID = 'Qm' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8)
      setForm(prev => ({ ...prev, fileHash: hashHex, fileCID: mockCID }))
    } catch (err) { console.error('File processing failed:', err) }
    setUploading(false)
  }

  const handleSubmit = () => {
    if (!form.patientID || !form.description) {
      alert('Please fill in Patient ID and Description.')
      return
    }
    if (!form.fileCID || !form.fileHash) {
      alert('Please upload a file or enter data to generate a hash.')
      return
    }
    const fullDescription = `${form.description}${form.notes ? ' | ' + form.notes : ''}`
    onSubmit({
      ...form,
      description: fullDescription,
      doctorName: doctorName || 'Dr. Zia',
      timestamp: new Date(form.recordDate).toISOString(),
      doctorFee: Number(form.doctorFee) || 0,
      hospitalFee: Number(form.hospitalFee) || 0,
      logisticsFee: Number(form.logisticsFee) || 0,
      totalCost: (Number(form.doctorFee) || 0) + (Number(form.hospitalFee) || 0) + (Number(form.logisticsFee) || 0)
    })
    setForm({
      patientID: '',
      fileCID: '',
      fileHash: '',
      description: '',
      recordDate: new Date().toISOString().split('T')[0],
      notes: '',
      fileData: null,
      fileName: '',
      doctorFee: 0,
      hospitalFee: 0,
      logisticsFee: 0
    })
    setFile(null); setPatientName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Create Medical Record</h2>
      <Card style={{ maxWidth: 850, background: cardBg, borderColor }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Patient ID <span style={{ color: C.red }}>*</span></label>
            <Input value={form.patientID} onChange={e => handlePatientIDChange(e.target.value)} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="Search patient by ID" list="doctor-patient-suggestions" />
            <datalist id="doctor-patient-suggestions">{patientsList.map(p => <option key={p.patientID} value={p.patientID}>{p.name} ({p.patientID})</option>)}</datalist>
            {patientName && <div style={{ fontSize: 13, color: C.teal, marginTop: '0.2rem' }}>✅ {patientName}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Record Date</label>
            <Input type="date" value={form.recordDate} onChange={e => handleDateChange(e.target.value)} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} />
          </div>

          <div style={{ gridColumn: '1 / 3' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Description / Diagnosis <span style={{ color: C.red }}>*</span></label>
            <Input value={form.description} onChange={e => handleDescriptionChange(e.target.value)} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="e.g., Blood Test Report, X-Ray Chest, MRI..." />
          </div>

          <div style={{ gridColumn: '1 / 3' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Upload Report File</label>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: `0.5px solid ${borderColor}`, background: bgInput, color: textColor, fontSize: 14 }} accept=".pdf,.jpg,.png,.dcm,.txt" />
            {file && <div style={{ fontSize: 13, color: secColor, marginTop: '0.2rem' }}>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB) {uploading ? '🔄 Generating hash...' : '✅ Ready'}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>IPFS CID</label>
            <Input value={form.fileCID} style={{ padding: '0.6rem', fontSize: 14, fontFamily: 'monospace', color: secColor, background: bgDisabled, borderColor }} placeholder="Auto-generated" disabled />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>SHA-256 Hash</label>
            <div style={{ padding: '0.6rem', fontSize: 13, fontFamily: 'monospace', color: secColor, background: bgDisabled, borderRadius: 8, border: `0.5px solid ${borderColor}`, wordBreak: 'break-all', maxHeight: 60, overflowY: 'auto' }}>{form.fileHash || 'Auto-generated'}</div>
          </div>

          <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Doctor Fee</label>
              <Input type="number" value={form.doctorFee} onChange={e => setForm({...form, doctorFee: e.target.value})} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Hospital Fee</label>
              <Input type="number" value={form.hospitalFee} onChange={e => setForm({...form, hospitalFee: e.target.value})} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="0" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Logistics Fee</label>
              <Input type="number" value={form.logisticsFee} onChange={e => setForm({...form, logisticsFee: e.target.value})} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="0" />
            </div>
          </div>

          <div style={{ gridColumn: '1 / 3' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Additional Notes</label>
            <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="e.g., Follow-up in 2 weeks, Referral..." />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || uploading} style={{
          marginTop: '1.5rem', padding: '0.75rem', fontSize: 17, fontWeight: 700, width: '100%',
          border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff',
          background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`,
          boxShadow: `0 6px 20px rgba(0, 200, 232, 0.35)`,
          transition: 'all 0.3s ease', opacity: (loading || uploading) ? 0.6 : 1, letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 30px rgba(0, 200, 232, 0.45)` }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(0, 200, 232, 0.35)` }}>
          {loading ? '⏳ Submitting...' : uploading ? '⏳ Processing File...' : '🔗 Submit Record to Blockchain'}
        </button>
      </Card>
    </div>
  )
}

// ── Helper ──────────────────────────────────────────────────────
const copyToClipboard = (text) => {
  navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!')).catch(() => {})
}

// ── Patients ──────────────────────────────────────────────────
export const DoctorPatients = ({ records = [], patientsList = [], onAddPatient, darkMode = true }) => {
  const [expandedId, setExpandedId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newPatient, setNewPatient] = useState({ patientID: '', name: '' })

  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const mutedColor = darkMode ? 'rgba(238,242,255,0.45)' : '#888'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'

  const getPatientRecords = (patientID) => records.filter(r => r.patientID === patientID)
  const toggleExpand = (patientID) => setExpandedId(expandedId === patientID ? null : patientID)

  const generateID = () => {
    const existing = patientsList.map(p => parseInt(p.patientID.replace('P', '')) || 0)
    const max = existing.length ? Math.max(...existing) : 0
    return `P${String(max + 1).padStart(3, '0')}`
  }

  const handleAddPatient = () => {
    if (!newPatient.patientID || !newPatient.name) { alert('Please fill in both Patient ID and Name'); return }
    if (onAddPatient) { const success = onAddPatient(newPatient); if (success) { setShowModal(false); setNewPatient({ patientID: '', name: '' }) } }
  }

  const sortedPatients = [...patientsList].sort((a, b) => {
    const aRecs = getPatientRecords(a.patientID)
    const bRecs = getPatientRecords(b.patientID)
    const aDate = aRecs.length > 0 ? new Date(aRecs[aRecs.length - 1].timestamp) : new Date(0)
    const bDate = bRecs.length > 0 ? new Date(bRecs[bRecs.length - 1].timestamp) : new Date(0)
    return bDate - aDate
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 24, margin: 0, color: textColor }}>Patient Roster</h2>
        <button onClick={() => { setNewPatient({ patientID: generateID(), name: '' }); setShowModal(true) }} style={{ background: `linear-gradient(135deg, ${C.teal}, ${C.cyan})`, border: 'none', color: '#fff', padding: '0.5rem 1.2rem', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>➕ Add New Patient</button>
      </div>

      <Card style={{ overflow: 'hidden', padding: 0, background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#F5F7FA' }}>
              <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Patient ID</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Patient Name</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Records</th>
                <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Latest Report</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Last Visit</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Total Cost</th>
                <th style={{ padding: '0.8rem', textAlign: 'center', fontSize: 13, color: darkMode ? C.sec : '#555', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPatients.map(p => {
                const patientRecs = getPatientRecords(p.patientID)
                const latest = patientRecs.length > 0 ? patientRecs[patientRecs.length - 1] : null
                const isExpanded = expandedId === p.patientID
                const totalCost = patientRecs.reduce((sum, r) => sum + (r.totalCost || 0), 0)
                return (
                  <React.Fragment key={p.patientID}>
                    <tr style={{ borderBottom: `0.5px solid ${borderColor}40` }}>
                      <td style={{ padding: '0.8rem', fontSize: 14, fontFamily: 'monospace', color: textColor }}>{p.patientID}</td>
                      <td style={{ padding: '0.8rem', fontSize: 14, fontWeight: 500, color: textColor }}>{p.name}</td>
                      <td style={{ padding: '0.8rem', fontSize: 14, textAlign: 'center' }}><Badge color={patientRecs.length > 0 ? C.cyan : mutedColor}>{patientRecs.length}</Badge></td>
                      <td style={{ padding: '0.8rem', fontSize: 14, color: secColor }}>{latest?.description || '-'}</td>
                      <td style={{ padding: '0.8rem', fontSize: 14, textAlign: 'center', color: secColor }}>{latest ? fmtD(latest.timestamp) : '-'}</td>
                      <td style={{ padding: '0.8rem', fontSize: 14, textAlign: 'center', color: C.gold }}>${totalCost}</td>
                      <td style={{ padding: '0.8rem', fontSize: 14, textAlign: 'center' }}>
                        <button onClick={() => toggleExpand(p.patientID)} style={{ background: isExpanded ? 'rgba(0,245,212,0.15)' : 'transparent', border: `0.5px solid ${isExpanded ? C.teal : borderColor}`, borderRadius: 4, color: isExpanded ? C.teal : textColor, padding: '0.2rem 0.8rem', cursor: 'pointer', fontSize: 12 }}>{isExpanded ? 'Hide Records' : 'View Records'}</button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={{ padding: '1rem', background: darkMode ? 'rgba(0,245,212,0.04)' : '#F0FAFA' }}>
                          <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: 15, color: C.teal }}>📋 All On-Chain Records for {p.name}</div>
                          {patientRecs.length === 0 ? (
                            <div style={{ color: secColor, fontSize: 14, padding: '1rem', textAlign: 'center' }}>No records found</div>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Record ID</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Description</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Doctor</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Date</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Doctor Fee</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Hospital Fee</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Logistics</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>Total</th>
                                  <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontSize: 12, color: secColor }}>File</th>
                                </tr>
                              </thead>
                              <tbody>
                                {patientRecs.map(r => (
                                  <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${borderColor}20` }}>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, fontFamily: 'monospace', color: textColor }}>{short(r.recordID, 6)}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>{r.description}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: secColor }}>{r.doctorName}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: secColor }}>{fmtD(r.timestamp)}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>${r.doctorFee || 0}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>${r.hospitalFee || 0}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: textColor }}>${r.logisticsFee || 0}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', fontSize: 13, color: C.gold, fontWeight: 600 }}>${r.totalCost || 0}</td>
                                    <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                                      {r.fileData ? <a href={r.fileData} download={r.fileName || 'report'} target="_blank" rel="noopener noreferrer" style={{ color: C.cyan, textDecoration: 'none' }}>📄</a> : <span style={{ color: mutedColor }}>—</span>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <Card style={{ maxWidth: 450, width: '90%', background: darkMode ? '#111A2C' : '#FFFFFF' }}>
            <h3 style={{ fontSize: 20, marginBottom: '1rem', color: textColor }}>Add New Patient</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div><label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Patient ID</label><Input value={newPatient.patientID} onChange={e => setNewPatient({...newPatient, patientID: e.target.value})} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF', borderColor }} /></div>
              <div><label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Full Name</label><Input value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF', borderColor }} /></div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Btn onClick={handleAddPatient} style={{ flex: 1, padding: '0.6rem', fontSize: 15 }}>➕ Add Patient</Btn>
                <Btn onClick={() => setShowModal(false)} variant="secondary" style={{ flex: 1, padding: '0.6rem', fontSize: 15 }}>Cancel</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── My Records ──────────────────────────────────────────────────
export const DoctorRecords = ({ records = [], role }) => {
  const myRecords = records.filter(r => r.doctorName === role?.user)
  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem' }}>My Medical Records</h2>
      <Card>
        {myRecords.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(238,242,255,0.65)', fontSize: 16 }}>No records found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: 'rgba(238,242,255,0.65)' }}>ID</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: 'rgba(238,242,255,0.65)' }}>Patient</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: 'rgba(238,242,255,0.65)' }}>Description</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: 'rgba(238,242,255,0.65)' }}>Date</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: 'rgba(238,242,255,0.65)' }}>Total</th>
            </tr></thead>
            <tbody>
              {myRecords.map(r => (
                <tr key={r.recordID} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.6rem', fontSize: 13, fontFamily: 'monospace' }}>{short(r.recordID, 8)}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13 }}>{r.patientName || r.patientID}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13 }}>{r.description}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, color: 'rgba(238,242,255,0.65)' }}>{fmtD(r.timestamp)}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, color: C.gold, fontWeight: 600 }}>${r.totalCost || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
