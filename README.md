# 🏥 Blockchain-Based Medical Document Verification System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Fabric](https://img.shields.io/badge/Hyperledger_Fabric-2.5-blue)](https://hyperledger-fabric.readthedocs.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB)](https://reactjs.org/)

> **A decentralized ecosystem for secure, tamper-proof, and instant verification of medical documents using Hyperledger Fabric Blockchain and IPFS.**

---

## 📋 Table of Contents
- [🚀 Introduction](#-introduction)
- [⚠️ Problem Statement](#️-problem-statement)
- [💡 Solution & Features](#-solution--features)
- [🏗️ System Architecture](#️-system-architecture)
- [🔄 Data Flow Diagram](#-data-flow-diagram)
- [👥 User Roles](#-user-roles)
- [🛠️ Technology Stack](#️-technology-stack)
- [📸 Screenshots](#-screenshots)
- [⚙️ Local Setup (Installation)](#️-local-setup-installation)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🚀 Introduction

In the modern healthcare ecosystem, patients often struggle to manage their medical history across multiple hospitals, labs, and insurance providers. This project leverages **Hyperledger Fabric** (a permissioned blockchain) to create a single source of truth for medical documents.

By combining **Blockchain** (for immutability and access control) with **IPFS** (InterPlanetary File System for decentralized storage), we ensure that:
- Medical records cannot be tampered with or forged.
- Patients have absolute ownership and consent control over their data.
- Verification (e.g., for insurance claims or new doctors) is reduced to seconds instead of days.

---

## ⚠️ Problem Statement

**"Medical identity theft, record forgery, and fragmented patient data cost the global healthcare industry billions annually and risk patient lives."**

Traditional systems suffer from:
1.  **Centralized Vulnerabilities:** Single points of failure and hacking targets.
2.  **Data Silos:** Hospitals, labs, and insurers do not share data seamlessly.
3.  **Forgery:** Paper-based or simple digital documents are easily forged.
4.  **Lack of Patient Ownership:** Patients rarely have access to or control over their own complete medical history.
5.  **Inefficient Verification:** Insurance claim verifications take weeks due to manual cross-checking.

---

## 💡 Solution & Features

### ✨ Key Features
- **🔗 Immutable Records:** Once a document hash is stored on the Fabric ledger, it cannot be altered.
- **🛡️ Access Control:** Smart contracts (Chaincode) enforce strict permissions—only authorized doctors/insurers can view specific records.
- **📂 Decentralized Storage:** Documents are stored on IPFS; the blockchain only stores the hash (CID), ensuring GDPR compliance and scalability.
- **⚡ Instant Verification:** Any stakeholder (e.g., insurance company) can verify the authenticity of a document in real-time.
- **👤 Role-Based Dashboards:** Separate UIs for Patients, Doctors, Labs, and Insurance companies.

---

## 🏗️ System Architecture

Below is the high-level architecture showcasing how the Frontend, Backend, Fabric Network, and IPFS interact.

```mermaid
graph TD
    User((User)) -->|Interacts| Frontend[React + Vite Frontend]
    
    subgraph Server
        Frontend -->|REST API| Backend[Node.js + Express API]
        Backend -->|SDK Calls| Fabric[Hyperledger Fabric Network]
        Backend -->|Pinning| IPFS[IPFS Cluster]
    end

    subgraph Hyperledger Fabric Network (Permissioned)
        Fabric -->|Commits| Ledger[(Distributed Ledger)]
        Fabric -->|Invokes| Chaincode[Smart Contracts / Chaincode]
    end

    subgraph Storage
        IPFS -->|Stores| Documents[Medical PDFs / Reports]
        Ledger -->|Stores Hashes| CIDs[(IPFS Hashes / CIDs)]
    end

    style Fabric fill:#f9f,stroke:#333,stroke-width:2px
    style Backend fill:#bbf,stroke:#333,stroke-width:2px
    style Frontend fill:#bfb,stroke:#333,stroke-width:2px
