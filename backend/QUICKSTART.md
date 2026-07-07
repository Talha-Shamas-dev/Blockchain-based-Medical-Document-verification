# MedChain Backend — Quick Start Guide
## Calibrated for YOUR actual Hyperledger Fabric deployment

---

## What your terminal showed us

```
Channel   : mychannel
Chaincode : medical
Peer      : localhost:7051
Orderer   : localhost:7050
User      : Admin@org1.example.com
Org Path  : /home/blockchain/fabric/fabric-samples/test-network/organizations
```

Your chaincode CreateRecord args (from successful invoke):
```
CreateRecord, REC-001, P001, QmTestCID123, abc123def456, Dr. Zia, Blood Test Report
              ───────  ────  ───────────── ────────────  ──────  ─────────────────
              recordID patientID  fileCID    fileHash   doctorName  description
```

---

## Step 1 — Start your Fabric network (you already know this)

```bash
cd /home/blockchain/fabric/fabric-samples/test-network

# Full clean reset
./network.sh down
docker container rm -f $(docker container ls -aq) 2>/dev/null || true
docker volume rm -f $(docker volume ls -q) 2>/dev/null || true
docker network rm fabric_test 2>/dev/null || true
docker images dev-* -q | xargs -r docker rmi -f

# Start network + create channel
./network.sh up
./network.sh createChannel -c mychannel

# Deploy your medical chaincode
./network.sh deployCC -ccn medical -ccp ../medical-chaincode -ccl go
```

---

## Step 2 — Start Redis (needed for caching + job queue)

```bash
# Option A: Docker (easiest)
docker run -d --name medchain-redis -p 6379:6379 redis:7-alpine

# Option B: If Redis is already installed locally
redis-server

# Verify Redis is running
redis-cli ping
# Should print: PONG
```

---

## Step 3 — Configure backend

```bash
cd medchain-backend-updated

# .env is already configured for your setup — verify the key values:
cat .env | grep FABRIC

# Expected output:
# FABRIC_CHANNEL=mychannel
# FABRIC_CHAINCODE=medical
# FABRIC_MSP_ID=Org1MSP
# FABRIC_PEER_ADDR=localhost:7051
# FABRIC_ORG_PATH=/home/blockchain/fabric/fabric-samples/test-network/organizations
# FABRIC_ORG_DOMAIN=org1.example.com
# FABRIC_USER=Admin

# Generate a proper encryption key
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env

# Set a JWT secret
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
```

---

## Step 4 — Install and run

```bash
npm install
node --env-file=.env server.js

# You should see:
# ═══════════════════════════════════════════════
#   MedChain Backend  v2.1
#   Channel   : mychannel
#   Chaincode : medical
#   Peer      : localhost:7051
#   User      : Admin@org1.example.com
# ═══════════════════════════════════════════════
# [Boot] HTTP  → http://localhost:4000
# [Boot] WS   → ws://localhost:4000/ws
# [Fabric] Connected ✓
# [Boot] Ready ✓
```

---

## Step 5 — Test the API

### Login first
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor-zia","password":"medchain2025"}' | jq
```

Save the token:
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor-zia","password":"medchain2025"}' | jq -r .token)
```

### Create a record (sync — same as your peer CLI invoke)
```bash
curl -s -X POST http://localhost:4000/api/records/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientID":   "P001",
    "fileCID":     "QmTestCID123",
    "fileHash":    "abc123def456",
    "doctorName":  "Dr. Zia",
    "description": "Blood Test Report"
  }' | jq
```

### Get a record
```bash
curl -s http://localhost:4000/api/records/REC-001 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Health check
```bash
# Quick (no auth)
curl -s http://localhost:4000/api/health | jq

# Deep (with auth) — checks Fabric, Redis, IPFS, Queue
curl -s http://localhost:4000/api/health/full \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## API endpoints summary

| Method | Endpoint | Role | What it does |
|--------|----------|------|--------------|
| POST | `/api/auth/login` | any | Get JWT token |
| GET  | `/api/health` | no auth | Liveness check |
| GET  | `/api/health/full` | any | Deep system check |
| POST | `/api/records/sync` | doctor, lab | Create record (waits for Fabric) |
| POST | `/api/records` | doctor, lab | Create record (async, WebSocket result) |
| GET  | `/api/records/:recordID` | any | Get record (cached) |
| GET  | `/api/records/patient?patientID=P001` | any | All records for patient |
| GET  | `/api/records/:recordID/history` | any | On-chain version history |
| POST | `/api/access/grant/sync` | patient | Grant access to a party |
| POST | `/api/access/revoke` | patient | Revoke access (async) |
| POST | `/api/verify/request/sync` | insurance | Audited access request |
| GET  | `/api/verify/check` | any | Quick boolean access check |
| POST | `/api/verify/integrity` | any | Verify file hash |
| POST | `/api/ipfs/upload` | doctor, lab | Upload → encrypt → IPFS |

---

## Demo users (password: `medchain2025`)

| Username | Role | patientID / MSP |
|----------|------|-----------------|
| `patient-p001` | patient | P001 |
| `patient-p002` | patient | P002 |
| `doctor-zia` | doctor | Org1MSP |
| `doctor-tariq` | doctor | Org1MSP |
| `insurer-1` | insurance | Org2MSP |
| `lab-tech` | lab | Org2MSP |
| `admin` | doctor | Org1MSP |

---

## Common errors and fixes

### `[Fabric] Connection failed`
```bash
# Is test-network running?
docker ps | grep peer
# If not: cd test-network && ./network.sh up && ./network.sh createChannel -c mychannel
```

### `[Fabric] Connected but CreateRecord fails`
```bash
# Is chaincode deployed?
cd /home/blockchain/fabric/fabric-samples/test-network
peer lifecycle chaincode querycommitted --channelID mychannel --name medical
# Should show: Version: 1.0, Sequence: 1
```

### `Redis connection error`
```bash
redis-cli ping  # Should return PONG
# If not: docker start medchain-redis
```

### `TLS handshake failed` (same error you saw in terminal)
The backend uses `--tls --cafile` automatically via the Fabric Gateway SDK.
If you see TLS errors, verify `FABRIC_ORG_PATH` points to the correct organizations folder.
