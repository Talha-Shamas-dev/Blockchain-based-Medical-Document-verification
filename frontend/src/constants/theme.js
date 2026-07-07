export const C = {
  bg: '#060B18',
  sb: '#080E1C',
  card: 'rgba(255,255,255,0.04)',
  bd: 'rgba(255,255,255,0.08)',
  text: '#EEF2FF',
  sec: 'rgba(238,242,255,0.65)',
  muted: 'rgba(238,242,255,0.45)',
  cyan: '#00C8E8',
  purple: '#9B5DE5',
  pink: '#E25E9E',
  teal: '#00F5D4',
  blue: '#4361EE',
  red: '#FF5C8A',
  gold: '#FFD166',
}

export const ROLES = [
  { id: 'patient', label: 'Patient Portal', color: '#00C8E8', desc: 'View your records and control access.' },
  { id: 'doctor', label: 'Doctor Portal', color: '#9B5DE5', desc: 'Create records and manage patients.' },
  { id: 'lab', label: 'Hospital / Lab', color: '#FFD166', desc: 'Upload lab results and register them.' },
  { id: 'insurance', label: 'Insurance Co.', color: '#00F5D4', desc: 'Verify patient records for claims.' },
]

export const NAV = {
  patient: [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { id: 'records', label: 'My Records', icon: 'ti-file-medical' },
    { id: 'lab-reports', label: 'Lab Reports', icon: 'ti-microscope' },
    { id: 'appointments', label: 'Appointments', icon: 'ti-calendar' },
    { id: 'claims', label: 'Insurance Claims', icon: 'ti-shield' },
    { id: 'access', label: 'Access Control', icon: 'ti-lock' },
    { id: 'audit', label: 'Audit Trail', icon: 'ti-history' },
  ],
  doctor: [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { id: 'create', label: 'Create Record', icon: 'ti-circle-plus' },
    { id: 'patients', label: 'Patients', icon: 'ti-users' },
    { id: 'records', label: 'My Records', icon: 'ti-file-check' },
  ],
  lab: [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { id: 'assigned', label: 'Assigned Tests', icon: 'ti-file-invoice' },
    { id: 'upload', label: 'Upload Result', icon: 'ti-upload' },
    { id: 'reports', label: 'My Reports', icon: 'ti-report' },
  ],
  insurance: [
    { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
    { id: 'verify', label: 'Verify Record', icon: 'ti-shield-check' },
    { id: 'history', label: 'Request History', icon: 'ti-history' },
  ],
}

export const PATIENTS = [
  { patientID: 'P001', name: 'Sarah Ali' },
  { patientID: 'P002', name: 'Omar Khan' },
  { patientID: 'P003', name: 'Fatima Zahra' },
  { patientID: 'P004', name: 'Ahmed Hassan' },
  { patientID: 'P005', name: 'Muhammad Asif' },
]

export const LAB_TYPES = [
  'CBC Lab Result', 'Urine Analysis', 'LFT Report', 'RFT Report',
  'HbA1c Result', 'Thyroid Panel', 'Lipid Profile', 'ECG Report',
  'Ultrasound Report', 'Culture & Sensitivity',
]

export const FINANCIAL_LABELS = {
  doctorFee: 'Doctor Consultation Fee',
  hospitalFee: 'Hospital Room Rent',
  labFee: 'Lab Test Charges',
  logisticsFee: 'Logistics & Supplies',
  totalCost: 'Total Cost'
}
