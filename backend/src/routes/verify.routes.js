/**
 * verify.routes.js — Insurance verification routes with DB logging
 */
import express from 'express'
import { body, query } from 'express-validator'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { verifyLimiter } from '../middleware/rateLimiter.js'
import fabricService from '../services/fabric.service.js'
import { enqueueVerifyAccess } from '../services/queue.service.js'
import { logAccess } from '../services/db.service.js'

const router = express.Router()
router.use(authenticate, verifyLimiter)

// POST /api/verify/request — async
router.post('/request',
  authorize('insurance'),
  body('recordID').trim().notEmpty().withMessage('recordID required'), validate,
  async (req, res, next) => {
    try {
      const jobId = await enqueueVerifyAccess({
        recordID: req.body.recordID,
        userId: req.user.username,
      })
      // Log the request
      await logAccess(req.body.recordID, req.user.msp, 'VERIFY_REQUEST')
      res.status(202).json({
        success: true,
        message: 'Verification queued — result via WebSocket (verify:complete)',
        jobId,
      })
    } catch (err) { next(err) }
  }
)

// POST /api/verify/request/sync — waits for Fabric
router.post('/request/sync',
  authorize('insurance'),
  body('recordID').trim().notEmpty(), validate,
  async (req, res, next) => {
    try {
      const result = await fabricService.requestRecordAccess(req.body.recordID)
      await logAccess(req.body.recordID, req.user.msp, result.result || 'VERIFIED')
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  }
)

// GET /api/verify/check?recordID=REC-001&requesterID=P001
router.get('/check',
  query('recordID').trim().notEmpty(),
  query('requesterID').trim().notEmpty(), validate,
  async (req, res, next) => {
    try {
      const { recordID, requesterID } = req.query
      const result = await fabricService.verifyAccess(recordID, requesterID)
      await logAccess(recordID, req.user.msp, 'CHECK_ACCESS')
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  }
)

// POST /api/verify/integrity
router.post('/integrity',
  body('recordID').trim().notEmpty(),
  body('computedHash').trim().notEmpty()
    .matches(/^[a-fA-F0-9]+$/).withMessage('computedHash must be hex'),
  validate,
  async (req, res, next) => {
    try {
      const { recordID, computedHash } = req.body
      const result = await fabricService.verifyIntegrity(recordID, computedHash)
      await logAccess(recordID, req.user.msp, 'INTEGRITY_CHECK')
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  }
)

export default router
