/**
 * auth.routes.js
 * JWT authentication — updated for your medical chaincode roles.
 *
 * Your patientID from terminal: "P001"
 * Your doctorName from terminal: "Dr. Zia"
 */

import express from 'express'
import jwt     from 'jsonwebtoken'
import bcrypt  from 'bcryptjs'
import { body } from 'express-validator'
import { authLimiter }  from '../middleware/rateLimiter.js'
import { validate }     from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import { AppError }     from '../services/fabric.service.js'
import { config }       from '../config/index.js'
import logger           from '../utils/logger.js'

const router = express.Router()

// Password hash of 'medchain2025' — change in production
const PWD_HASH = bcrypt.hashSync('medchain2025', 10)

/**
 * Demo user store.
 * patientID matches what you pass into CreateRecord as second argument.
 * msp is the MSP identity used by Hyperledger Fabric.
 *
 * Your terminal showed:
 *   CORE_PEER_LOCALMSPID="Org1MSP"
 *   Admin@org1.example.com
 */
const USERS = {
  // Patients — patientID matches what you use in chaincode calls
  'patient-p001':   { role: 'patient',   msp: 'P001',         name: 'Patient P001',        hash: PWD_HASH },
  'patient-p002':   { role: 'patient',   msp: 'P002',         name: 'Patient P002',        hash: PWD_HASH },

  // Doctors — org1
  'doctor-zia':     { role: 'doctor',    msp: 'Org1MSP',      name: 'Dr. Zia',             hash: PWD_HASH },
  'doctor-tariq':   { role: 'doctor',    msp: 'Org1MSP',      name: 'Dr. Tariq Hassan',    hash: PWD_HASH },

  // Insurance — org2 or separate org
  'insurer-1':      { role: 'insurance', msp: 'Org2MSP',      name: 'InsureCo Agent',      hash: PWD_HASH },

  // Lab technicians — org2
  'lab-tech':       { role: 'lab',       msp: 'Org2MSP',      name: 'LabCorp Technician',  hash: PWD_HASH },

  // Admin (matches your CORE_PEER_MSPCONFIGPATH Admin@org1.example.com)
  'admin':          { role: 'doctor',    msp: 'Org1MSP',      name: 'Network Admin',       hash: PWD_HASH },
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login',
  authLimiter,
  body('username').trim().notEmpty().withMessage('username required'),
  body('password').notEmpty().withMessage('password required'),
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body
      const user = USERS[username.toLowerCase()]

      if (!user || !(await bcrypt.compare(password, user.hash))) {
        logger.warn('[Auth] Failed login', { username, ip: req.ip })
        return next(new AppError('Invalid username or password', 401, 'UNAUTHORIZED'))
      }

      const payload = {
        username,
        role: user.role,
        msp:  user.msp,
        name: user.name,
      }

      const token   = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn || "8h" })
      const refresh = jwt.sign({ username }, config.jwt.secret, { expiresIn: config.jwt.refreshExpires || "7d" })

      logger.info('[Auth] Login success', { username, role: user.role, msp: user.msp })

      res.json({
        success: true,
        token,
        refresh,
        user: { username, role: user.role, msp: user.msp, name: user.name },
        expiresIn: config.jwt.expiresIn || "8h",
      })
    } catch (err) { next(err) }
  }
)

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post('/refresh',
  body('refresh').notEmpty().withMessage('refresh token required'),
  validate,
  (req, res, next) => {
    try {
      const decoded = jwt.verify(req.body.refresh, config.jwt.secret)
      const user    = USERS[decoded.username]
      if (!user) return next(new AppError('User not found', 404, 'NOT_FOUND'))

      const token = jwt.sign(
        { username: decoded.username, role: user.role, msp: user.msp, name: user.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn || "8h" }
      )
      res.json({ success: true, token })
    } catch {
      next(new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED'))
    }
  }
)

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) =>
  res.json({ success: true, user: req.user })
)

export default router
