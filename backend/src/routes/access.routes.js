/**
 * access.routes.js — Grant / Revoke access (patient only) + DB logging
 */
import express from 'express'
import { body } from 'express-validator'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, rules } from '../middleware/validate.js'
import fabricService from '../services/fabric.service.js'
import cacheService from '../services/cache.service.js'
import { enqueueGrantAccess, enqueueRevokeAccess, enqueueRevokeRecord } from '../services/queue.service.js'
import { logAccess } from '../services/db.service.js'

export const accessRouter = express.Router()
accessRouter.use(authenticate)

const recBody = () => body('recordID').trim().notEmpty().withMessage('recordID required')

// POST /api/access/grant — async
accessRouter.post('/grant',
  authorize('patient'),
  recBody(), rules.granteeID(), validate,
  async (req, res, next) => {
    try {
      const { recordID, granteeID } = req.body
      const jobId = await enqueueGrantAccess({ recordID, granteeID, userId: req.user.username })
      await cacheService.invalidateRecord(recordID)
      // Log access attempt
      await logAccess(recordID, req.user.msp, 'GRANT_ATTEMPT')
      res.status(202).json({ success: true, message: 'Grant queued', jobId })
    } catch (err) { next(err) }
  }
)

// POST /api/access/grant/sync — synchronous
accessRouter.post('/grant/sync',
  authorize('patient'),
  recBody(), rules.granteeID(), validate,
  async (req, res, next) => {
    try {
      const { recordID, granteeID } = req.body
      const result = await fabricService.grantAccess(recordID, granteeID)
      await cacheService.invalidateRecord(recordID)
      await logAccess(recordID, req.user.msp, 'GRANTED')
      res.json({ success: true, ...result })
    } catch (err) { next(err) }
  }
)

// POST /api/access/revoke
accessRouter.post('/revoke',
  authorize('patient'),
  recBody(), rules.granteeID(), validate,
  async (req, res, next) => {
    try {
      const { recordID, granteeID } = req.body
      const jobId = await enqueueRevokeAccess({ recordID, granteeID, userId: req.user.username })
      await cacheService.invalidateRecord(recordID)
      await logAccess(recordID, req.user.msp, 'REVOKE_ATTEMPT')
      res.status(202).json({ success: true, message: 'Revoke queued', jobId })
    } catch (err) { next(err) }
  }
)

// POST /api/access/revoke-record — soft-delete entire record
accessRouter.post('/revoke-record',
  authorize('patient'),
  recBody(), validate,
  async (req, res, next) => {
    try {
      const { recordID } = req.body
      const jobId = await enqueueRevokeRecord({ recordID, userId: req.user.username })
      await cacheService.invalidateRecord(recordID)
      await logAccess(recordID, req.user.msp, 'REVOKE_RECORD')
      res.status(202).json({ success: true, message: 'Record revocation queued', jobId })
    } catch (err) { next(err) }
  }
)

export default accessRouter
