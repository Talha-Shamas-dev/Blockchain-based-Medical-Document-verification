import React, { useState, useRef } from 'react'
import { C, PATIENTS, LAB_TYPES, FINANCIAL_LABELS } from '../../constants/theme'
import { Card, Badge, Btn, Stat, Input, Sel, fmtD, fmtT, short } from '../../components'

export const LabDashboard = ({ records = [], role, darkMode = true }) => {
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const assignedRecords = records.filter(r => r.lab_assigned === true)
  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Lab Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.2rem' }}>
        <Stat label="Assigned Tests" value={assignedRecords.length} />
        <Stat label="Completed" value={assignedRecords.filter(r => r.lab_completed).length} />
        <Stat label="Pending" value={assignedRecords.filter(r => !r.lab_completed).length} />
        <Stat label="Total Lab Fees" value={'$' + assignedRecords.reduce((sum, r) => sum + (r.labFee || 0), 0)} />
      </div>
    </div>
  )
}

// ── Assigned Tests ─────────────────────────────────────────────
export const LabAssigned = ({ records = [], role, darkMode = true, onComplete }) => {
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'
  const assignedRecords = records.filter(r => r.lab_assigned === true && !r.lab_completed)
  const completedRecords = records.filter(r => r.lab_assigned === true && r.lab_completed)

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Assigned Lab Tests</h2>
      <h3 style={{ fontSize: 18, marginBottom: '1rem', color: textColor }}>🟡 Pending Tests ({assignedRecords.length})</h3>
      <Card style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor, marginBottom: '1.5rem' }}>
        {assignedRecords.length === 0 ? <div style={{ padding: '1rem', color: secColor }}>No pending tests assigned</div> :
          assignedRecords.map(r => (
            <div key={r.recordID} style={{ padding: '0.5rem', borderBottom: `0.5px solid ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: textColor }}>{r.patientName || r.patientID}</div>
                  <div style={{ fontSize: 13, color: secColor }}>{r.description}</div>
                  <div style={{ fontSize: 12, color: secColor }}>Requested: {fmtD(r.timestamp)}</div>
                </div>
                <Btn onClick={() => onComplete(r.recordID)} style={{ padding: '0.3rem 1rem', fontSize: 13 }}>Complete Test</Btn>
              </div>
            </div>
          ))
        }
      </Card>
      <h3 style={{ fontSize: 18, marginBottom: '1rem', color: textColor }}>✅ Completed Tests ({completedRecords.length})</h3>
      <Card style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor }}>
        {completedRecords.length === 0 ? <div style={{ padding: '1rem', color: secColor }}>No completed tests</div> :
          completedRecords.map(r => (
            <div key={r.recordID} style={{ padding: '0.5rem', borderBottom: `0.5px solid ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: textColor }}>{r.patientName || r.patientID}</div>
                  <div style={{ fontSize: 13, color: secColor }}>{r.description}</div>
                  <div style={{ fontSize: 12, color: secColor }}>Completed: {fmtD(r.lab_completed_at || r.timestamp)}</div>
                </div>
                <Badge color={C.teal}>Completed</Badge>
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  )
}

// ── Lab Upload ──────────────────────────────────────────────────
export const LabUpload = ({ onSubmit, loading, doctorName, patientsList = [], darkMode = true, demoMode = true }) => {
  const [form, setForm] = useState({
    patientID: '',
    fileCID: '',
    fileHash: '',
    description: LAB_TYPES[0],
    diagnosis: 'Pending',
    testDate: new Date().toISOString().split('T')[0],
    notes: '',
    fileData: null,
    fileName: '',
    labFee: 0
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
  }

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = () => setForm(prev => ({ ...prev, fileData: reader.result, fileName: selectedFile.name }))
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
    if (!form.patientID || !form.description) { alert('Please fill in Patient ID and Test Type.'); return }
    if (!form.fileCID || !form.fileHash) { alert('Please upload a file to generate a hash.'); return }
    const fullDescription = `${form.description} | ${form.diagnosis}${form.notes ? ' | ' + form.notes : ''}`
    onSubmit({
      ...form,
      description: fullDescription,
      doctorName: doctorName || 'Lab Technician',
      timestamp: new Date(form.testDate).toISOString(),
      lab_assigned: false,
      lab_completed: true,
      lab_completed_at: new Date().toISOString(),
      labFee: Number(form.labFee) || 0,
      totalCost: Number(form.labFee) || 0
    })
    setForm({
      patientID: '',
      fileCID: '',
      fileHash: '',
      description: LAB_TYPES[0],
      diagnosis: 'Pending',
      testDate: new Date().toISOString().split('T')[0],
      notes: '',
      fileData: null,
      fileName: '',
      labFee: 0
    })
    setFile(null); setPatientName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>Upload Lab Result</h2>
      <Card style={{ maxWidth: 800, background: cardBg, borderColor }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Patient ID <span style={{ color: C.red }}>*</span></label>
            <Input value={form.patientID} onChange={e => handlePatientIDChange(e.target.value)} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="e.g., P001" list="lab-patient-suggestions" />
            <datalist id="lab-patient-suggestions">{patientsList.map(p => <option key={p.patientID} value={p.patientID}>{p.name}</option>)}</datalist>
            {patientName && <div style={{ fontSize: 13, color: C.teal, marginTop: '0.2rem' }}>✅ {patientName}</div>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Test Date</label>
            <Input type="date" value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Test Type <span style={{ color: C.red }}>*</span></label>
            <Sel value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }}>
              {LAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Sel>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Diagnosis</label>
            <Sel value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }}>
              <option value="Pending">⏳ Pending</option><option value="Positive">🟢 Positive</option><option value="Negative">🔴 Negative</option><option value="Inconclusive">🟡 Inconclusive</option>
            </Sel>
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
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>{FINANCIAL_LABELS.labFee}</label>
            <Input type="number" value={form.labFee} onChange={e => setForm({...form, labFee: e.target.value})} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="0" />
          </div>
          <div style={{ gridColumn: '1 / 3' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: '0.3rem', color: textColor }}>Additional Notes</label>
            <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ padding: '0.6rem', fontSize: 14, color: textColor, background: bgInput, borderColor }} placeholder="e.g., Fasting required..." />
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading || uploading} style={{
          marginTop: '1.5rem', padding: '0.75rem', fontSize: 17, fontWeight: 700, width: '100%',
          border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff',
          background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
          boxShadow: `0 6px 20px rgba(255, 209, 102, 0.35)`,
          transition: 'all 0.3s ease', opacity: (loading || uploading) ? 0.6 : 1
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 10px 30px rgba(255, 209, 102, 0.45)` }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(255, 209, 102, 0.35)` }}>
          {loading ? '⏳ Registering...' : uploading ? '⏳ Processing File...' : '📋 Register Lab Result'}
        </button>
      </Card>
    </div>
  )
}

// ── Lab Reports ─────────────────────────────────────────────────
export const LabReports = ({ records = [], role, darkMode = true }) => {
  const labRecords = records.filter(r => r.doctorName === role?.user || r.lab_completed === true)
  const textColor = darkMode ? '#EEF2FF' : '#1A1F36'
  const secColor = darkMode ? 'rgba(238,242,255,0.65)' : '#555'
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#E0E4F0'
  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: '1.5rem', color: textColor }}>My Lab Reports</h2>
      <Card style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF', borderColor }}>
        {labRecords.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: secColor, fontSize: 16 }}>No lab reports found</div> :
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: `0.5px solid ${borderColor}` }}>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Patient</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Test Type</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Diagnosis</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Fee</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Date</th>
              <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: 13, color: secColor }}>Hash</th>
            </tr></thead>
            <tbody>
              {labRecords.map(r => {
                let diagnosis = 'N/A', cleanDesc = r.description
                if (r.description?.includes('|')) { const parts = r.description.split('|'); cleanDesc = parts[0].trim(); diagnosis = parts[1]?.trim() || 'N/A' }
                return <tr key={r.recordID} style={{ borderBottom: `0.5px solid ${borderColor}40` }}>
                  <td style={{ padding: '0.6rem', fontSize: 13, color: textColor }}>{r.patientName || r.patientID}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, color: textColor }}>{cleanDesc}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13 }}>
                    <Badge color={diagnosis === 'Positive' ? C.teal : diagnosis === 'Negative' ? C.red : diagnosis === 'Inconclusive' ? C.gold : C.muted}>{diagnosis}</Badge>
                  </td>
                  <td style={{ padding: '0.6rem', fontSize: 13, color: C.gold }}>${r.labFee || 0}</td>
                  <td style={{ padding: '0.6rem', fontSize: 13, color: secColor }}>{fmtD(r.timestamp)}</td>
                  <td style={{ padding: '0.6rem', fontSize: 12, fontFamily: 'monospace', color: darkMode ? 'rgba(238,242,255,0.45)' : '#888' }}>{r.fileHash ? r.fileHash.slice(0, 16) + '…' : '-'}</td>
                </tr>
              })}
            </tbody>
          </table>
        }
      </Card>
    </div>
  )
}
