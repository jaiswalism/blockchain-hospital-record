# MediBlock — Development Phases & Architecture Roadmap

---

## 1. Development Phases

### Phase 0: Secrets & Repository Hygiene [COMPLETED]
- [x] **Secret Rotation & Isolation:** Deprecated exposed Infura keys and hardcoded private seed phrases.
- [x] **Environment Variable Management:** Created `.env.example` with template variables for `RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `DEPLOYER_MNEMONIC`, and `NEXT_PUBLIC_CONTRACT_ADDRESS`.
- [x] **Secure Script Config:** Refactored `ethereum/deploy.js` and `ethereum/web3.js` to safely read environment variables using `dotenv`.
- [x] **Dependency Optimization:** Removed unused `electron` devDependency from `package.json`.

---

### Phase 1: Smart Contract Security & Bug Fixes (`Record.sol`) [COMPLETED]
- [x] **1.1 Multi-Appointment Storage:** Refactored `Record.sol` to index appointments via `Appointments[] public appointmentsList` and `mapping(address => uint[]) patientAppointments`. Appointments are never overwritten on follow-up visits.
- [x] **1.2 Strict Consent Enforcement on Writes:** `setAppointment` strictly enforces `require(isApproved[_addr][msg.sender])`. Unapproved doctors cannot write to patient records.
- [x] **1.3 Access-Gated Record Search:** Added cryptographic permission checks to `searchAppointment` so only the patient, the attending physician, or the admin can read sensitive prescriptions and diagnoses.
- [x] **1.4 Admin Doctor Verification System:** Implemented `verifyDoctor(address)` so newly registered doctors require admin approval before issuing clinical appointments.
- [x] **1.5 Permission Counter Accuracy:** Fixed `permissionGrantedCount` to increment only on first grant and properly decrement on revocation.
- [x] **1.6 EVM Input Validation:** Added zero-address validations (`require(_addr != address(0))`) and non-empty string checks.
- [x] **1.7 Comprehensive Event Logging:** Added `PatientRegistered`, `DoctorRegistered`, `DoctorVerified`, `AccessGranted`, `AccessRevoked`, `AppointmentCreated`, and `AppointmentUpdated`.
- [x] **1.8 Consultation Edit Protection:** `updateAppointment` requires the caller to be the doctor who created the record (or contract owner).

---

### Phase 2: Frontend Design System & Role-Based UX [COMPLETED]
- [x] **2.1 Modern Web3 Visual Identity:** Redesigned UI with deep obsidian (`#090A0E`), atmospheric ember sunset radial glow, and fiery orange (`#FF4D2D`) accents matching Web3 inspiration designs.
- [x] **2.2 Redesigned Landing Page (`/`):** Interactive hero architecture simulator (Patient Flow vs. Doctor Flow) and 3-tier comparative role cards.
- [x] **2.3 Dynamic Role-Aware Header (`components/MenuBar.js`):** Header queries on-chain roles in real time (`isPatient`, `isDoctor`, `isDoctorVerified`, `owner`) with instant MetaMask `accountsChanged` reactivity.
- [x] **2.4 Actionable Error Messaging:** Replaced generic "account already exists" alerts with specific feedback (user rejected tx, unauthorized access, or validation failures).
- [x] **2.5 Status Banners & Banishment of `alert()`:** Replaced all browser `alert()` popups with inline glassmorphic status banners and transaction progress loaders.
- [x] **2.6 Dashboard Telemetry & Admin Panel (`/dashboard`):** Grouped registration timelines by month-year, fixed divide-by-zero risks, and added an **Admin Doctor Verification Panel**.
- [x] **2.7 Consent Gateways (`/approve-doctor`, `/revoke-doctor`):** Added directory of registered doctors for one-click access granting, and active grants list with one-click revocation.
- [x] **2.8 Consultation Workflow (`/make-appointment`):** Added authorized patient dropdown to prevent manual copy-paste of hex addresses.
- [x] **2.9 Safe Client Hydration:** Migrated wallet-dependent reads (`web3.eth.getAccounts()`) to `componentDidMount` to eliminate SSR crashes.

---

### Phase 3: Automated Testing & Verification [COMPLETED]
- [x] **3.1 Ganache & Mocha Test Suite:** Expanded `test/Record.test.js` to 8 comprehensive unit tests covering:
  1. Contract deployment & owner assignment.
  2. Patient record creation.
  3. Revert on duplicate patient registration.
  4. Doctor registration & admin verification enforcement.
  5. Consent requirement for appointment creation.
  6. Non-overwriting multiple appointment history.
  7. Accurate grant/revoke counter tracking.
  8. Access denial for revoked doctors.
- [x] **3.2 Production Build Verification:** Verified Next.js 12-page static and dynamic production build with zero errors.
- [x] **3.3 Live Sepolia Deployment:** Verified and confirmed live smart contract deployment at `0xB1Af58d43fDf8e5a637BcdeBB52DfE1E32AF0f2D`.

---

### Phase 4: Encrypted Off-Chain Storage (IPFS) [PLANNED]
- [ ] **4.1 Off-Chain Architecture:** Store only cryptographic hashes and IPFS Content Identifiers (CIDs) on-chain; sensitive data (names, IC, allergies, prescriptions) stored off-chain.
- [ ] **4.2 Client-Side Encryption:** Implement AES-256-GCM record encryption using random symmetric keys wrapped with doctor/patient public keys (ECIES or Lit Protocol).
- [ ] **4.3 Decentralized Pinning:** Integrate Pinata / web3.storage API for decentralized storage.
- [ ] **4.4 File Attachments:** Enable upload of lab reports, blood work PDFs, and medical scans.
- [ ] **4.5 Zero-Knowledge Proofs:** Integrate zk-SNARKs (Circom/snarkjs) for selective disclosure (e.g. proof of eligibility without identity leak).

---

### Phase 5: Advanced Healthcare & Compliance Features [PLANNED]
- [ ] **5.1 Expirable & Scoped Consent:** Implement access expiration timestamps (e.g. 7-day emergency grant) and scoped categories (Labs Only, Imaging Only).
- [ ] **5.2 Patient Audit Trail Log:** Patient dashboard displaying a chronological timeline of which doctors viewed their record and when.
- [ ] **5.3 Emergency Break-Glass Override:** Emergency QR-code access for first responders with logged on-chain alerts.
- [ ] **5.4 HL7 FHIR Standard Mapping:** Standardize patient records to match international HL7 FHIR and ICD-10 medical terminology.
- [ ] **5.5 Prescription Objects:** Expand prescriptions into independent data structures (dosage, frequency, duration, refills, active status).

---

### Phase 6: Tooling, Migration & DevOps [PLANNED]
- [ ] **6.1 Hardhat / Foundry Migration:** Upgrade development harness to Hardhat with TypeScript and automated gas reporting.
- [ ] **6.2 Frontend Upgrade:** Upgrade Next.js to App Router with TypeScript, Tailwind CSS, and `wagmi` / `viem` / `RainbowKit`.
- [ ] **6.3 Security Auditing:** Integrate Slither and Mythril static analysis into CI pipeline.
- [ ] **6.4 Layer 2 Deployment:** Support low-fee Ethereum Layer 2 networks (Base, Polygon, Arbitrum).
- [ ] **6.5 Subgraph Indexing:** Deploy The Graph subgraph for real-time querying of medical events.

---

### Phase 7: Compliance & Enterprise Governance [PLANNED]
- [ ] **7.1 Regulatory Mapping:** Align cryptographic architecture with HIPAA, GDPR, and India DPDP compliance.
- [ ] **7.2 Hospital Consortium Multisig:** Multi-signature governance (Safe) for verified hospital administrative actions.
- [ ] **7.3 Account Abstraction (ERC-4337):** Social login / gas sponsorship for non-crypto patient onboarding.

---

## 2. Target Structure After the Upgrade

```text
blockchain-hospital-record/
├── contracts/            # Record.sol (Solidity ^0.8.20 modular contracts)
│   ├── PatientRegistry.sol
│   ├── DoctorRegistry.sol
│   ├── ConsentManager.sol
│   └── AppointmentManager.sol
├── test/                 # Hardhat unit, fuzzing & integration tests (TypeScript)
├── scripts/              # deploy.ts, verify.ts, seed.ts
├── deployments/          # sepolia.json, mainnet.json, base.json
├── frontend/             # Next.js 14+ (App Router, TypeScript, Tailwind)
│   ├── app/              # Role-based route groups (patient, doctor, admin)
│   ├── components/       # Modern shadcn/ui + Web3 glassmorphic design system
│   ├── lib/              # wagmi config, crypto.ts (AES-256), ipfs.ts
│   └── hooks/            # useRecord, useConsent, useAppointments custom hooks
├── indexer/              # The Graph subgraph schema, mappings & ABIs
├── .env.example          # Environment variables specification
├── hardhat.config.ts     # Multi-network configuration & compiler settings
└── README.md             # Project documentation, architecture & runbook
```
