# MedChain Frontend v2.0 — Updated for YOUR medical chaincode

Four complete role dashboards — **Patient**, **Doctor**, **Hospital/Lab**, **Insurance Company** —
wired to match your actual deployed chaincode field names exactly:

```
recordID, patientID, fileCID, fileHash, doctorName, description, timestamp, accessList, revoked
```

## What changed from the previous version

| Old field (didn't match your chaincode) | New field (matches your chaincode) |
|---|---|
| `patientDID` | `patientID` |
| `ipfsCID` | `fileCID` |
| `reportType` | `description` |
| `createdBy` | `doctorName` |
| channel `medchannel` | channel `mychannel` |
| chaincode `medchain` | chaincode `medical` |

## Two modes — switchable from the login screen

**Demo mode** (default) — works immediately, no backend needed. Uses realistic seed data so you can click through all 4 dashboards and see every screen.

**Live mode** — click the mode toggle on the login screen. Connects to your real `medchain-backend-updated` Express server:
- Real JWT login (`POST /api/auth/login`)
- Real chaincode calls (`CreateRecord`, `GrantAccess`, `RequestRecordAccess`, etc.)
- Real-time WebSocket updates when a Fabric transaction confirms (no polling)
- Falls back to demo mode automatically if the backend is unreachable, with a toast explaining why

## The four dashboards

### Patient Portal
Dashboard (record count, identity card), My Records (full detail view with access list and on-chain history), Access Control (grant/revoke access to doctors, labs, or insurance companies by patientID/MSP), Audit Trail (every access attempt ever logged against their records).

### Doctor Portal
Dashboard (records created, patient count), Create Record (the actual `CreateRecord` form with all 6 fields your chaincode expects), Patients (roster with per-patient record counts), My Records (everything this doctor has created).

### Hospital / Lab Portal
Dashboard (results uploaded, patients served), Upload Result (two-step flow: real file upload → AES-256 encrypt → IPFS via your backend's `/api/ipfs/upload`, then register the returned `fileCID`+`fileHash` on-chain), My Reports.

### Insurance Company Portal
Dashboard (grant/deny statistics), Verify Record (calls the audited `RequestRecordAccess` — the function that creates a permanent on-chain log regardless of outcome, which is what makes a denial or approval legally defensible), Request History.

## Quick start

```bash
npm install
npm run dev
# http://localhost:3000 — demo mode works out of the box
```

## Going live

1. Start your Fabric network and deploy chaincode (you already know this part — `mychannel` / `medical`).
2. Start Redis: `docker run -d -p 6379:6379 redis:7-alpine`
3. Start the backend:
   ```bash
   cd medchain-backend-updated
   npm install
   node --env-file=.env server.js
   ```
4. Back here, refresh the browser and click the mode toggle on the login screen — it switches to **Live Mode**.
5. Log in as any role (password `medchain2025` for all demo accounts) — this now hits your real backend and your real Hyperledger Fabric network.

## File upload → IPFS → blockchain flow (Lab portal)

This is the one screen where demo and live mode behave differently:
- **Demo mode**: clicking "Encrypt → Upload to IPFS" simulates a CID/hash instantly.
- **Live mode**: selecting a real file and clicking the same button sends it to `POST /api/ipfs/upload`, which AES-256 encrypts it, pins it to IPFS via Pinata, and returns the real `fileCID` + `fileHash` — which then go straight into `CreateRecord`.

## Project structure

```
src/
├── App.jsx                   ← routing, demo/live toggle, WebSocket, all 4 role state
├── api/fabricService.js      ← every backend call, field names match your chaincode
├── constants/theme.js        ← colors, role definitions, nav config
├── components/index.jsx      ← Card, Badge, Btn, Stat, Table, TxModal, Toast
└── pages/
    ├── patient/   Dashboard · Records · Access Control · Audit Trail
    ├── doctor/    Dashboard · Create Record · Patients · My Records
    ├── lab/       Dashboard · Upload Result · My Reports
    └── insurance/ Dashboard · Verify Record (+ shared AuditTrail from patient/)
```
