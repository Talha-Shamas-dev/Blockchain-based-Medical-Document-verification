/**
 * fabricService.js
 * ─────────────────────────────────────────────────────────────────
 * All calls go to the Express backend at /api/*
 * Field names match YOUR medical chaincode exactly:
 *   recordID, patientID, fileCID, fileHash, doctorName, description
 *
 * Backend routes (from medchain-backend-updated):
 *   POST   /api/auth/login
 *   POST   /api/records/sync          (waits for Fabric — recommended for demo)
 *   POST   /api/records               (async — returns jobId, result via WebSocket)
 *   GET    /api/records/:recordID
 *   GET    /api/records/patient?patientID=...
 *   GET    /api/records/:recordID/history
 *   POST   /api/access/grant/sync
 *   POST   /api/access/revoke
 *   POST   /api/access/revoke-record
 *   POST   /api/verify/request/sync
 *   GET    /api/verify/check
 *   POST   /api/verify/integrity
 *   POST   /api/ipfs/upload
 *   GET    /api/health, /api/health/full
 */
import axios from 'axios'
import { io } from 'socket.io-client'

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('mc_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Normalize backend error shape: { success:false, error:{ code, message } }
api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.error?.message || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

// ── Auth ──────────────────────────────────────────────────────────

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => {
    localStorage.setItem('mc_token', r.data.token)
    return r.data
  })

export const logout = () => localStorage.removeItem('mc_token')

export const getMe = () => api.get('/auth/me').then(r => r.data)

// ── Records ───────────────────────────────────────────────────────

/**
 * Create a record — SYNC (waits for Fabric, ~1-3s). Best for demo/dev.
 * @param {{patientID, fileCID, fileHash, doctorName, description}} data
 */
export const createRecordSync = (data) =>
  api.post('/records/sync', data).then(r => r.data)

/**
 * Create a record — ASYNC (returns jobId immediately, result via WebSocket).
 * Best for production / high traffic.
 */
export const createRecordAsync = (data) =>
  api.post('/records', data).then(r => r.data)

/** GetRecord — fast cached read */
export const getRecord = (recordID) =>
  api.get(`/records/${recordID}`).then(r => r.data)

/** GetRecordsByPatient — needs CouchDB; falls back to [] on LevelDB */
export const getRecordsByPatient = (patientID) =>
  api.get('/records/patient', { params: { patientID } }).then(r => r.data)

/** GetRecordHistory — full on-chain version history */
export const getRecordHistory = (recordID) =>
  api.get(`/records/${recordID}/history`).then(r => r.data)

// ── Access Control ────────────────────────────────────────────────

export const grantAccessSync = (recordID, granteeID) =>
  api.post('/access/grant/sync', { recordID, granteeID }).then(r => r.data)

export const revokeAccess = (recordID, granteeID) =>
  api.post('/access/revoke', { recordID, granteeID }).then(r => r.data)

export const revokeRecord = (recordID) =>
  api.post('/access/revoke-record', { recordID }).then(r => r.data)

// ── Verification (Insurance) ──────────────────────────────────────

/** RequestRecordAccess — AUDITED, sync. Logs GRANTED/DENIED on-chain regardless. */
export const requestRecordAccessSync = (recordID) =>
  api.post('/verify/request/sync', { recordID }).then(r => r.data)

/** VerifyAccess — fast boolean check, no on-chain trace */
export const verifyAccess = (recordID, requesterID) =>
  api.get('/verify/check', { params: { recordID, requesterID } }).then(r => r.data)

/** VerifyIntegrity — compare a SHA-256 hash against the on-chain stored hash */
export const verifyIntegrity = (recordID, computedHash) =>
  api.post('/verify/integrity', { recordID, computedHash }).then(r => r.data)

// ── IPFS Upload ───────────────────────────────────────────────────

/**
 * Upload a file: backend encrypts AES-256, pins to IPFS, returns fileCID + fileHash
 * ready to pass directly into createRecordSync().
 */
export const uploadToIPFS = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ipfs/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

// ── Health ────────────────────────────────────────────────────────

export const healthCheck     = () => api.get('/health').then(r => r.data)
export const healthCheckFull = () => api.get('/health/full').then(r => r.data)

// ── WebSocket (real-time tx confirmations) ───────────────────────

let socket = null

/**
 * Connect to the backend's Socket.IO server for real-time updates.
 * Events: tx:confirmed, tx:failed, verify:complete, ipfs:complete
 */
export function connectSocket(onEvent) {
  const token = localStorage.getItem('mc_token')
  if (!token) return null

  socket = io('/', { path: '/ws', auth: { token } })

  socket.on('connected',       (d) => onEvent?.('connected', d))
  socket.on('tx:confirmed',    (d) => onEvent?.('tx:confirmed', d))
  socket.on('tx:failed',       (d) => onEvent?.('tx:failed', d))
  socket.on('verify:complete', (d) => onEvent?.('verify:complete', d))
  socket.on('ipfs:complete',   (d) => onEvent?.('ipfs:complete', d))
  socket.on('connect_error',   (e) => onEvent?.('error', { message: e.message }))

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
