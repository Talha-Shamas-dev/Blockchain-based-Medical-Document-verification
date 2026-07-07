/**
 * validate.js — Updated field names to match YOUR medical chaincode
 *
 * Your chaincode fields (from GetRecord response):
 *   recordID, patientID, fileCID, fileHash,
 *   doctorName, description, timestamp, accessList, revoked
 */

import { body, param, query, validationResult } from 'express-validator'
import { AppError } from '../services/fabric.service.js'

/** Run validations — abort with 422 on failure */
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const details = errors.array().map(e => ({ field: e.path, message: e.msg }))
    return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', details))
  }
  next()
}

// ── Field rules — updated to match your chaincode ─────────────────────────────

export const rules = {

  // Path param: /api/records/:recordID
  recordID: () =>
    param('recordID')
      .trim().notEmpty().withMessage('recordID is required')
      .isLength({ max: 64 }).withMessage('recordID too long'),

  // YOUR chaincode uses patientID, not patientDID
  patientID: () =>
    body('patientID')
      .trim().notEmpty().withMessage('patientID is required')
      .isLength({ max: 256 }).withMessage('patientID too long'),

  // YOUR chaincode uses fileCID, not ipfsCID
  fileCID: () =>
    body('fileCID')
      .trim().notEmpty().withMessage('fileCID is required')
      .isLength({ min: 10, max: 128 }).withMessage('Invalid IPFS CID — must be 10–128 chars'),

  // SHA-256 hex hash
  fileHash: () =>
    body('fileHash')
      .trim().notEmpty().withMessage('fileHash is required')
      .isLength({ min: 8, max: 128 }).withMessage('fileHash must be 8–128 chars (SHA-256 recommended)')
      .matches(/^[a-fA-F0-9]+$/).withMessage('fileHash must be hexadecimal'),

  // YOUR chaincode uses doctorName, not createdBy
  doctorName: () =>
    body('doctorName')
      .trim().notEmpty().withMessage('doctorName is required')
      .isLength({ max: 128 }).withMessage('doctorName too long'),

  // YOUR chaincode uses description, not reportType
  description: () =>
    body('description')
      .trim().notEmpty().withMessage('description is required')
      .isLength({ max: 512 }).withMessage('description too long (max 512 chars)'),

  // For access grant/revoke
  granteeID: () =>
    body('granteeID')
      .trim().notEmpty().withMessage('granteeID is required')
      .isLength({ max: 512 }).withMessage('granteeID too long'),

  // Query param: ?patientID=...
  patientIDQuery: () =>
    query('patientID')
      .trim().notEmpty().withMessage('patientID query parameter is required'),
}
