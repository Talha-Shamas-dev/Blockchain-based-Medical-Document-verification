import { connect, signers } from '@hyperledger/fabric-gateway';
import grpc from '@grpc/grpc-js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';
import logger from '../utils/logger.js';
import { withRetry, CircuitBreaker } from '../utils/retry.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
export class FabricError extends AppError {
  constructor(m, d = null) { super(m, 502, 'FABRIC_ERROR', d); this.name = 'FabricError'; }
}
export class NotFoundError extends AppError {
  constructor(r) { super(`${r} not found`, 404, 'NOT_FOUND'); this.name = 'NotFoundError'; }
}
export class AccessDeniedError extends AppError {
  constructor(m = 'Access denied') { super(m, 403, 'ACCESS_DENIED'); this.name = 'AccessDeniedError'; }
}

class FabricService {
  #gateway = null;
  #grpcClient = null;
  #contract = null;
  #connecting = false;
  #cb = new CircuitBreaker({ threshold: 5, resetMs: 30000 });

  get #peerTLSCert() {
    return path.join(config.fabric.orgPath, 'peerOrganizations', config.fabric.orgDomain, 'peers', `peer0.${config.fabric.orgDomain}`, 'tls', 'ca.crt');
  }
  get #ordererTLSCert() {
    const ordererDomain = config.fabric.orgDomain.replace(/^[^.]+\./, '');
    return path.join(config.fabric.orgPath, 'ordererOrganizations', ordererDomain, 'orderers', config.fabric.ordererHostname, 'msp', 'tlscacerts', `tlsca.${ordererDomain}-cert.pem`);
  }
  get #userMSPPath() {
    return path.join(config.fabric.orgPath, 'peerOrganizations', config.fabric.orgDomain, 'users', `${config.fabric.user}@${config.fabric.orgDomain}`, 'msp');
  }

  async #loadIdentity() {
    const certDir = path.join(this.#userMSPPath, 'signcerts');
    const keyDir = path.join(this.#userMSPPath, 'keystore');
    const certFiles = await fs.readdir(certDir);
    const keyFiles = await fs.readdir(keyDir);
    if (!certFiles.length) throw new FabricError(`No cert files in ${certDir}`);
    if (!keyFiles.length) throw new FabricError(`No key files in ${keyDir}`);
    const certificate = await fs.readFile(path.join(certDir, certFiles[0]));
    const privateKey = crypto.createPrivateKey(await fs.readFile(path.join(keyDir, keyFiles[0])));
    return { mspId: config.fabric.mspId, certificate, signer: signers.newPrivateKeySigner(privateKey) };
  }

  async #buildGrpcClient() {
    const tlsCert = await fs.readFile(this.#peerTLSCert);
    return new grpc.Client(config.fabric.peerAddr, grpc.credentials.createSsl(tlsCert), {
      'grpc.max_receive_message_length': 100 * 1024 * 1024,
      'grpc.keepalive_time_ms': 30000,
      'grpc.keepalive_timeout_ms': 5000,
      'grpc.keepalive_permit_without_calls': 1,
    });
  }

  async connect() {
    if (this.#contract && this.#cb.state !== 'OPEN') return;
    if (this.#connecting) { await new Promise(r => setTimeout(r, 500)); return; }
    this.#connecting = true;
    try {
      this.disconnect();
      this.#grpcClient = await this.#buildGrpcClient();
      const { mspId, certificate, signer } = await this.#loadIdentity();
      this.#gateway = connect({
        client: this.#grpcClient,
        identity: { mspId, credentials: certificate },
        signer,
        evaluateOptions: () => ({ deadline: Date.now() + config.fabric.txTimeout }),
        endorseOptions: () => ({ deadline: Date.now() + config.fabric.txTimeout }),
        submitOptions: () => ({ deadline: Date.now() + config.fabric.txTimeout }),
        commitStatusOptions: () => ({ deadline: Date.now() + config.fabric.txTimeout * 2 }),
      });
      this.#contract = this.#gateway.getNetwork(config.fabric.channel).getContract(config.fabric.chaincode);
      logger.info('[Fabric] Connected');
    } catch (err) {
      this.disconnect();
      throw new FabricError(`Connection failed: ${err.message}`);
    } finally {
      this.#connecting = false;
    }
  }

  disconnect() {
    try { this.#gateway?.close(); } catch {}
    try { this.#grpcClient?.close(); } catch {}
    this.#gateway = this.#grpcClient = this.#contract = null;
  }

  async #getContract() {
    if (!this.#contract) await this.connect();
    return this.#contract;
  }

  async #submit(fnName, ...args) {
    return this.#cb.call(() => withRetry(async () => {
      const c = await this.#getContract();
      try { return await c.submitTransaction(fnName, ...args); }
      catch (err) {
        if (this.#isConnErr(err)) { this.disconnect(); throw err; }
        throw this.#parseErr(err, fnName);
      }
    }, { attempts: config.fabric.maxRetries, baseMs: 500, label: fnName, shouldRetry: this.#isConnErr.bind(this) }));
  }

  async #evaluate(fnName, ...args) {
    return this.#cb.call(() => withRetry(async () => {
      const c = await this.#getContract();
      try { return await c.evaluateTransaction(fnName, ...args); }
      catch (err) {
        if (this.#isConnErr(err)) { this.disconnect(); throw err; }
        throw this.#parseErr(err, fnName);
      }
    }, { attempts: config.fabric.maxRetries, baseMs: 300, label: fnName, shouldRetry: this.#isConnErr.bind(this) }));
  }

  #isConnErr(err) { const m = err?.message?.toLowerCase() || ''; return m.includes('unavailable') || m.includes('connect') || m.includes('grpc'); }
  #parseErr(err, fn) {
    const raw = err?.message || String(err);
    if (raw.includes('already exists')) throw new AppError('Record already exists', 409, 'CONFLICT');
    if (raw.includes('does not exist')) throw new NotFoundError('Record');
    if (raw.includes('access denied') || raw.includes('not authorized')) throw new AccessDeniedError();
    logger.error(`[Fabric] ${fn} error`, { raw });
    throw new FabricError(`${fn} failed: ${raw}`);
  }

  async healthCheck() {
    try { await this.connect(); return { status: 'ok', channel: config.fabric.channel, cc: config.fabric.chaincode, circuitBreaker: this.#cb.state }; }
    catch (err) { return { status: 'error', error: err.message, circuitBreaker: this.#cb.state }; }
  }

  async createRecord({ recordID, patientID, fileCID, fileHash, doctorName, description }) {
    if (!recordID || !patientID || !fileCID || !fileHash || !doctorName || !description)
      throw new AppError('All fields required', 400, 'VALIDATION_ERROR');
    await this.#submit('CreateRecord', recordID, patientID, fileCID, fileHash, doctorName, description);
    return { success: true, recordID };
  }

  async getRecord(recordID) {
    const result = await this.#evaluate('GetRecord', recordID);
    return JSON.parse(result.toString());
  }

  async getRecordsByPatient(patientID) {
    try {
      const result = await this.#evaluate('GetRecordsByPatient', patientID);
      const parsed = JSON.parse(result.toString());
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      if (err.message?.includes('not supported')) return [];
      throw err;
    }
  }

  async getRecordHistory(recordID) {
    const result = await this.#evaluate('GetRecordHistory', recordID);
    const parsed = JSON.parse(result.toString());
    return Array.isArray(parsed) ? parsed : [];
  }

  async grantAccess(recordID, granteeID) {
    await this.#submit('GrantAccess', recordID, granteeID);
    return { success: true };
  }

  async revokeAccess(recordID, granteeID) {
    await this.#submit('RevokeAccess', recordID, granteeID);
    return { success: true };
  }

  async revokeRecord(recordID) {
    await this.#submit('RevokeRecord', recordID);
    return { success: true };
  }

  async requestRecordAccess(recordID) {
    try {
      const result = await this.#submit('RequestRecordAccess', recordID);
      const record = result?.length ? JSON.parse(result.toString()) : null;
      return { result: 'GRANTED', record };
    } catch (err) {
      if (err.code === 'ACCESS_DENIED') return { result: 'DENIED', record: null, message: err.message };
      throw err;
    }
  }

  async verifyAccess(recordID, requesterID) {
    const result = await this.#evaluate('VerifyAccess', recordID, requesterID);
    return { hasAccess: result.toString() === 'true' };
  }

  async verifyIntegrity(recordID, computedHash) {
    const result = await this.#evaluate('VerifyIntegrity', recordID, computedHash);
    return { intact: result.toString() === 'true' };
  }
}

export const fabricService = new FabricService();
export default fabricService;
