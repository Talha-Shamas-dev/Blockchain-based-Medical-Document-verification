import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, rules } from '../middleware/validate.js'
import { readSlowDown } from '../middleware/rateLimiter.js'
import fabricService from '../services/fabric.service.js'
import cacheService from '../services/cache.service.js'
import { enqueueCreateRecord } from '../services/queue.service.js'
import { config } from '../config/index.js'
import { saveRecord, getRecord, getRecordsByPatient, getAllRecords, logAccess } from '../services/db.service.js'

const router = express.Router()
router.use(authenticate)

// ── POST /api/records/sync ────────────────────────────────────
router.post('/sync',
  authorize('doctor', 'lab'),
  rules.patientID(), rules.fileCID(), rules.fileHash(),
  rules.doctorName(), rules.description(),
  validate,
  async (req, res, next) => {
    try {
      const { patientID, fileCID, fileHash, doctorName, description } = req.body
      const recordID = 'REC-' + uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()

      // 1. Submit to Fabric (blockchain)
      const result = await fabricService.createRecord({
        recordID, patientID, fileCID, fileHash, doctorName, description,
      })

      // 2. Save to SQLite Database (metadata + blockchain proof)
      await saveRecord({
        recordID,
        patientID,
        fileCID,
        fileHash,
        doctorName,
        description,
        timestamp: new Date().toISOString(),
        txId: result?.txId || 'pending'
      })

      // 3. Invalidate cache
      await cacheService.invalidatePatient(patientID)

      res.status(201).json({ success: true, ...result })
    } catch (err) { next(err) }
  }
)

// ── GET /api/records/:recordID ────────────────────────────────
router.get('/:recordID',
  readSlowDown,
  rules.recordID(), validate,
  async (req, res, next) => {
    try {
      const { recordID } = req.params
      // First try database (faster)
      let record = await getRecord(recordID)
      if (!record) {
        // Fallback to blockchain
        const fabricRecord = await fabricService.getRecord(recordID)
        if (fabricRecord) {
          record = {
            record_id: fabricRecord.recordID,
            patient_id: fabricRecord.patientID,
            file_cid: fabricRecord.fileCID,
            file_hash: fabricRecord.fileHash,
            doctor_name: fabricRecord.doctorName,
            description: fabricRecord.description,
            timestamp: fabricRecord.timestamp
          }
        }
      }
      if (!record) return res.status(404).json({ error: { message: 'Record not found' } })
      res.json({ success: true, record })
    } catch (err) { next(err) }
  }
)

// ── GET /api/records/patient?patientID=P001 ──────────────────
router.get('/patient',
  readSlowDown,
  rules.patientIDQuery(), validate,
  async (req, res, next) => {
    try {
      const { patientID } = req.query
      const records = await getRecordsByPatient(patientID)
      res.json({ success: true, count: records.length, records })
    } catch (err) { next(err) }
  }
)

// ── GET /api/records/all ───────────────────────────────────────
router.get('/all',
  authorize('doctor', 'lab', 'insurance'),
  async (req, res, next) => {
    try {
      const records = await getAllRecords()
      res.json({ success: true, count: records.length, records })
    } catch (err) { next(err) }
  }
)

export default router
