import 'dotenv/config';
const req = (k) => { const v = process.env[k]; if (!v?.trim()) throw new Error(`Missing: ${k}`); return v.trim(); };
const opt = (k, d = '') => (process.env[k] || '').trim() || d;
const int = (k, d) => { const v = parseInt(process.env[k], 10); return Number.isFinite(v) ? v : d; };

export const config = {
  server: { port: int('PORT', 4000), env: opt('NODE_ENV', 'development'), isProd: opt('NODE_ENV') === 'production' },
  fabric: {
    channel: opt('FABRIC_CHANNEL', 'mychannel'),
    chaincode: opt('FABRIC_CHAINCODE', 'medical'),
    mspId: opt('FABRIC_MSP_ID', 'Org1MSP'),
    peerAddr: opt('FABRIC_PEER_ADDR', 'localhost:7051'),
    ordererAddr: opt('FABRIC_ORDERER_ADDR', 'localhost:7050'),
    ordererHostname: opt('FABRIC_ORDERER_HOSTNAME', 'orderer.example.com'),
    orgPath: opt('FABRIC_ORG_PATH', '/home/blockchain/fabric-new/test-network/organizations'),
    orgDomain: opt('FABRIC_ORG_DOMAIN', 'org1.example.com'),
    user: opt('FABRIC_USER', 'Admin'),
    connectTimeout: int('FABRIC_CONNECT_TIMEOUT_MS', 5000),
    txTimeout: int('FABRIC_TX_TIMEOUT_MS', 30000),
    maxRetries: int('FABRIC_MAX_RETRIES', 3),
  },
  jwt: { secret: req('JWT_SECRET'), expiresIn: opt('JWT_EXPIRES_IN', '8h') },
  encryption: { key: opt('ENCRYPTION_KEY', '0'.repeat(64)) },
  cors: { origin: opt('CORS_ORIGIN', 'http://localhost:3000') },
};
export default config;
