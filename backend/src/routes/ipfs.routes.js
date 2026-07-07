/**
 * ipfs.routes.js
 * Upload a medical file → AES-256 encrypt → pin to IPFS → return fileCID + fileHash
 *
 * The returned fileCID and fileHash go directly into POST /api/records/sync
 * as the fileCID and fileHash fields (matching your chaincode field names).
 */

import express from 'express'
import multer  from 'multer'
import { authenticate, authorize } from '../middleware/auth.js'
import ipfsService from '../services/ipfs.service.js'
import { AppError } from '../services/fabric.service.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png', 'image/jpeg', 'image/jpg',
      'application/dicom', 'image/dicom',
    ]
    const ok = allowed.includes(file.mimetype) || file.originalname.endsWith('.dcm')
    if (ok) cb(null, true)
    else cb(new AppError(`File type not allowed: ${file.mimetype}`, 400, 'INVALID_FILE_TYPE'))
  },
})

// POST /api/ipfs/upload
// Returns: { fileCID, fileHash, encryptedSize, originalSize }
// Pass fileCID and fileHash directly into POST /api/records/sync
router.post('/upload',
  authenticate,
  authorize('doctor', 'lab'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('No file provided', 400, 'NO_FILE')

      const { ipfsCID, fileHash, encryptedSize } = await ipfsService.upload(
        req.file.buffer,
        req.file.originalname,
      )

      // Return as fileCID to match your chaincode field name
      res.status(201).json({
        success:       true,
        fileCID:       ipfsCID,       // ← your chaincode field name
        fileHash,                      // ← your chaincode field name
        encryptedSize,
        originalSize:  req.file.size,
        originalName:  req.file.originalname,
        gatewayUrl:    ipfsService.gatewayUrl(ipfsCID),
        note: 'Use fileCID and fileHash in POST /api/records/sync',
      })
    } catch (err) { next(err) }
  }
)

export default router
