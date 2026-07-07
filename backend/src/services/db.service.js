import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../medchain.db');

let db = null;

export async function getDb() {
    if (!db) {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        console.log('[DB] Connected to SQLite');
    }
    return db;
}

// ── Save Record to Database ──────────────────────────────
export async function saveRecord(record) {
    const db = await getDb();
    const { recordID, patientID, fileCID, fileHash, doctorName, description, timestamp, txId } = record;
    await db.run(
        `INSERT OR REPLACE INTO medical_records 
         (record_id, patient_id, file_cid, file_hash, doctor_name, description, timestamp, tx_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [recordID, patientID, fileCID, fileHash, doctorName, description, timestamp, txId]
    );
    console.log(`[DB] Saved record ${recordID}`);
    return record;
}

// ── Get Record ──────────────────────────────────────────────
export async function getRecord(recordID) {
    const db = await getDb();
    return db.get(`SELECT * FROM medical_records WHERE record_id = ?`, [recordID]);
}

// ── Get Records by Patient ──────────────────────────────────
export async function getRecordsByPatient(patientID) {
    const db = await getDb();
    return db.all(`SELECT * FROM medical_records WHERE patient_id = ? ORDER BY timestamp DESC`, [patientID]);
}

// ── Get All Records ──────────────────────────────────────────
export async function getAllRecords() {
    const db = await getDb();
    return db.all(`SELECT * FROM medical_records ORDER BY timestamp DESC`);
}

// ── Log Access Request ──────────────────────────────────────
export async function logAccess(recordID, requesterMSP, result) {
    const db = await getDb();
    await db.run(
        `INSERT INTO access_logs (record_id, requester_msp, result) VALUES (?, ?, ?)`,
        [recordID, requesterMSP, result]
    );
    console.log(`[DB] Logged access for ${recordID} by ${requesterMSP}: ${result}`);
}

// ── Get Access Logs ──────────────────────────────────────────
export async function getAccessLogs(recordID) {
    const db = await getDb();
    return db.all(`SELECT * FROM access_logs WHERE record_id = ? ORDER BY timestamp DESC`, [recordID]);
}
