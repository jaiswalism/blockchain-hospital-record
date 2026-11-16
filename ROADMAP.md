# Blockchain Hospital Record System — Tasks, Fixes & Upgrade Plan

A decentralized hospital and patient record management system on Ethereum (Solidity + Next.js + MetaMask). This file is the working checklist: what the project does now, what must be fixed, what to update, and what to add. Tick boxes as you go.

---

## 1. Current state

**Stack:** Solidity `^0.4.17` · Next.js 9 · React 16 · Semantic UI · web3.js 1.x · Sepolia (Infura) · mocha + ganache-cli · recharts

| Area | What exists |
|---|---|
| Patients | Register, edit, view record (`/register-patient`, `/edit-patient`, `/record/:address`) |
| Doctors | Register, edit, view profile (`/register-doctor`, `/edit-doctor`, `/doctor/:address`) |
| Access control | Patient grants/revokes doctor access (`/approve-doctor`, `/revoke-doctor`) |
| Appointments | Doctor creates/updates: date, time, diagnosis, prescription, notes, status (`/make-appointment`, `/edit-appointment`) |
| Dashboard | Counters + recharts (growth cards, area and pie charts) (`/dashboard`) |
| Directory | All patient addresses + search (`/list`) |
| Dev tooling | `ethereum/compile.js`, `ethereum/deploy.js`, `test/Record.test.js` |

**Legend:** 🔴 P0 critical · 🟠 P1 important · 🟡 P2 improvement · 🟢 P3 nice to have

---

## 2. Phase 0 — Secrets & repo hygiene (do first, ~1 hour)

- [x] 🔴 **Rotate the Infura key and abandon the wallet** whose seed phrase is hardcoded in `ethereum/deploy.js`. Treat both as compromised.
- [x] 🔴 Remove secrets from `ethereum/deploy.js` and `ethereum/web3.js`; read from environment variables:
  ```js
  require('dotenv').config();
  const provider = new HDWalletProvider(process.env.DEPLOYER_MNEMONIC, process.env.RPC_URL);
  ```
- [x] 🔴 Add `.env` to `.gitignore`; create `.env.example` with placeholder values only.
- [ ] 🔴 Purge the secrets from git history (`git filter-repo` or BFG) if the repo is public or shared.
- [x] 🟠 Move the contract address out of `ethereum/record.js` into config (`NEXT_PUBLIC_CONTRACT_ADDRESS`) or a `deployments.json` per network.
- [x] 🟡 Stop committing `ethereum/build/Record.json` (650 KB); generate it on build.
- [x] 🟡 Remove unused `electron` devDependency from `package.json`.

---

## 3. Phase 1 — Smart contract fixes (`ethereum/contracts/Record.sol`)

### Bugs and access-control gaps

| # | Task | Why |
|---|---|---|
| [x] 🔴 1.1 | Give every appointment an ID: `Appointment[] appointments;` + `mapping(address => uint[]) patientAppointments;` | Today `appointments[patientAddr]` is overwritten on each new appointment; `appointmentList` and counters grow with duplicates |
| [x] 🔴 1.2 | `setAppointment` must require the patient has approved the doctor (`isApproved[patient][msg.sender]`) | Any registered doctor can write to any patient |
| [x] 🔴 1.3 | Add access checks to `searchAppointment` and `searchDoctor` (or return only non-sensitive fields) | Diagnosis and prescription are readable by anyone |
| [x] 🔴 1.4 | Doctor verification: use `owner` as admin; `setDoctor` creates a *pending* doctor, `verifyDoctor(addr)` approves; only verified doctors can create appointments | Anyone can currently register as a doctor, so "verified doctors" on the dashboard is not true |
| [x] 🟠 1.5 | Fix `permissionGrantedCount`: increment only if not already granted; decrement on revoke | Counter inflates on repeats and never decreases |
| [x] 🟠 1.6 | Input validation: non-empty required fields, max string length, non-zero address | Prevents junk data and gas griefing |
| [x] 🟠 1.7 | Emit events: `PatientRegistered`, `DoctorRegistered`, `DoctorVerified`, `AccessGranted`, `AccessRevoked`, `AppointmentCreated`, `AppointmentUpdated` | Needed for audit log, cheap dashboard, and indexing |
| [x] 🟠 1.8 | `updateAppointment` must check the caller is the doctor who created that appointment | Any doctor can edit another doctor's entry |
| [ ] 🟡 1.9 | Remove unbounded array returns (`getPatients`, `getDoctors`, `getAppointments`) in favour of events or paginated getters | Will fail as data grows |

### Privacy (the big one)

- [ ] 🔴 1.10 **Stop storing readable patient data on-chain.** The `isApproved` check on view functions does not protect data: `eth_call` lets a caller set `from` to any address, and contract storage is public. See Phase 4 for the encrypted off-chain design; on-chain keep only hashes/CIDs and permissions.

### Language and structure

- [ ] 🟠 1.11 Upgrade to Solidity `^0.8.20`: `constructor()`, remove `var`, add `view`/`pure`, use custom errors.
- [ ] 🟠 1.12 Use OpenZeppelin `AccessControl` (roles: `ADMIN`, `DOCTOR`, `PATIENT`) and `Pausable`.
- [ ] 🟡 1.13 Split into modules: `PatientRegistry`, `DoctorRegistry`, `ConsentManager`, `AppointmentManager`.

### Reference snippet (target shape for 1.1, 1.2, 1.4, 1.7)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Record {
    address public admin;
    enum DoctorStatus { None, Pending, Verified, Suspended }

    struct Appointment {
        address doctor;
        address patient;
        string  date;
        string  time;
        bytes32 dataHash;   // hash of encrypted details (Phase 4)
        string  cid;        // IPFS pointer to encrypted payload
        string  status;
        uint64  createdAt;
    }

    mapping(address => DoctorStatus) public doctorStatus;
    mapping(address => mapping(address => bool)) public isApproved; // patient => grantee
    Appointment[] public appointments;
    mapping(address => uint256[]) public patientAppointments;

    event DoctorVerified(address indexed doctor);
    event AccessGranted(address indexed patient, address indexed grantee);
    event AccessRevoked(address indexed patient, address indexed grantee);
    event AppointmentCreated(uint256 indexed id, address indexed patient, address indexed doctor);

    modifier onlyAdmin() { require(msg.sender == admin, "not admin"); _; }

    constructor() { admin = msg.sender; }

    function verifyDoctor(address d) external onlyAdmin {
        require(doctorStatus[d] == DoctorStatus.Pending, "not pending");
        doctorStatus[d] = DoctorStatus.Verified;
        emit DoctorVerified(d);
    }

    function createAppointment(
        address patient, string calldata date, string calldata time,
        bytes32 dataHash, string calldata cid, string calldata status
    ) external returns (uint256 id) {
        require(doctorStatus[msg.sender] == DoctorStatus.Verified, "doctor not verified");
        require(isApproved[patient][msg.sender], "no patient consent");
        id = appointments.length;
        appointments.push(Appointment(msg.sender, patient, date, time, dataHash, cid, status, uint64(block.timestamp)));
        patientAppointments[patient].push(id);
        emit AppointmentCreated(id, patient, msg.sender);
    }
}
```

---

## 4. Phase 2 — Frontend fixes and updates

| # | File | Task |
|---|---|---|
| [x] 🟠 2.1 | `pages/register-patient.js`, `pages/register-doctor.js` | The `catch` shows "account already exists" for **every** error. Show the real error (user rejected tx, out of gas, already registered). |
| [x] 🟠 2.2 | `pages/dashboard.js` | Month grouping uses month name only (`monthName[getMonth()]`), so Jan 2026 and Jan 2027 merge. Group by `year-month`. Also guard divide-by-zero in growth %. |
| [ ] 🟠 2.3 | `pages/dashboard.js` | N+1 chain calls in `getInitialProps` (a call per patient/doctor/appointment). Replace with event queries (`getPastEvents`) or an indexer. |
| [x] 🟠 2.4 | `pages/list.js` | Remove or restrict the public list of all patient addresses; replace with consent-based search. |
| [x] 🟠 2.5 | All pages | Replace `alert()` with toast notifications plus tx status (pending / confirmed / failed + Etherscan link). |
| [x] 🟠 2.6 | `pages/details.js`, `details-doctor.js`, `list.js`, `dashboard.js` | Reads happen in `getInitialProps` (runs on the server where `accounts[0]` doesn't exist). Move wallet-dependent reads to the client (`componentDidMount` / hooks). |
| [x] 🟠 2.7 | `ethereum/web3.js` | If MetaMask is missing, it silently falls back to a read-only Infura provider; show a clear "Install / connect MetaMask" banner. Handle `accountsChanged` and `chainChanged`. Enforce Sepolia network. |
| [x] 🟡 2.8 | Forms (register / edit / appointment) | Validate IC, phone, DOB, address fields before sending; show gas estimate. |
| [x] 🟡 2.9 | `components/MenuBar.js` | Role-aware menu: show Patient / Doctor / Admin items based on on-chain role instead of showing everything to everyone. |
| [x] 🟡 2.10 | `pages/make-appointment.js`, `edit-appointment.js` | Pick patient from the list of patients who granted access; don't type raw addresses. |
| [x] 🟡 2.11 | `pages/approve-doctor.js`, `revoke-doctor.js` | Show a list of current grants with one-click revoke; validate the address format; wording says "doctor or patient", clarify. |
| [x] 🟢 2.12 | Whole UI | Responsive layout, accessibility labels, dark mode, i18n. |

---

## 5. Phase 3 — Tests (`test/Record.test.js`)

Currently only happy paths. Add:

- [x] 🟠 Doctor cannot create appointment without patient consent
- [x] 🟠 Unverified doctor cannot create appointment
- [x] 🟠 Only admin can verify doctors
- [x] 🟠 Second appointment for the same patient does **not** overwrite the first
- [x] 🟠 Revoked doctor loses access
- [x] 🟠 Duplicate patient/doctor registration reverts
- [x] 🟠 Permission counter correct after repeated grant and revoke
- [ ] 🟡 Doctor A cannot update Doctor B's appointment
- [ ] 🟡 Events are emitted with correct args
- [ ] 🟡 Fuzz tests (Foundry) and gas report; target coverage above 90%
- [ ] 🟡 Frontend tests (Jest + React Testing Library) for forms and error states

---

## 6. Phase 4 — Real privacy: encrypted off-chain storage

**Principle:** the blockchain stores proof and permissions, not medical data.

```
Patient/Doctor UI
  → encrypt record (AES-256-GCM, random per-record key)
  → upload ciphertext to IPFS → CID
  → wrap the record key for the patient (and each approved doctor) with their public key
  → tx: store keccak256(ciphertext) + CID on-chain
Reader
  → fetch CID → unwrap key with own wallet key → decrypt locally
```

- [ ] 🔴 Define what stays on-chain (address, role, consent, hash, CID, timestamps) vs. off-chain encrypted (IC, name, phone, address, allergies, medication, diagnosis, prescription).
- [ ] 🔴 Client-side encryption helper (`lib/crypto.js`) using WebCrypto + wallet public key (ECIES) — or Lit Protocol for conditional key release.
- [ ] 🟠 IPFS pinning via Pinata / web3.storage / Filebase (API key stored server-side, not in the browser bundle).
- [ ] 🟠 Integrity check: recompute hash after fetch and compare to on-chain hash; show "verified" badge.
- [ ] 🟠 Key wrapping on grant; on revoke, stop sharing new records and rotate keys for future data. Document honestly that already-downloaded data cannot be un-seen.
- [ ] 🟡 File attachments: PDFs, lab reports, imaging.
- [ ] 🟢 ZK proofs for selective disclosure (e.g. "over 18", "valid insurance") with Circom/snarkjs.

---

## 7. Phase 5 — New features

### Access and identity
- [ ] 🟠 Consent with **expiry and scope** (e.g. labs only, 7 days)
- [ ] 🟠 Patient **audit log**: who viewed/granted/revoked and when (from events)
- [ ] 🟠 Admin dashboard: verify / suspend doctors
- [ ] 🟡 **Emergency access**: limited view (blood group, allergies, emergency contact) via QR card, with a logged break-glass override
- [ ] 🟡 Hospital/organization entity; doctors belong to a hospital
- [ ] 🟡 Guardian/delegate access (minors, caregivers)
- [ ] 🟡 Key recovery (social recovery or multisig); losing the wallet currently means losing the record forever
- [ ] 🟢 Account abstraction (ERC-4337) / social login so non-crypto users can onboard

### Clinical
- [ ] 🟠 Appointment lifecycle: Requested → Confirmed → Completed / Cancelled
- [ ] 🟠 Prescriptions as their own object (drug, dose, duration, refills, expiry)
- [ ] 🟡 Medical history timeline per patient
- [ ] 🟡 Lab role: order tests and upload results
- [ ] 🟡 Referral flow: refer a patient to another doctor and grant access in one step
- [ ] 🟡 Vaccination records / verifiable certificates (QR)
- [ ] 🟡 Doctor availability and conflict-free scheduling
- [ ] 🟡 Reminders (email/SMS/push) for follow-ups and medication
- [ ] 🟢 Map data to **HL7 FHIR** resources; use ICD-10 / SNOMED CT codes

### Insurance and payments
- [ ] 🟢 Insurer role with scoped, auditable claim access
- [ ] 🟢 On-chain claim submission and status
- [ ] 🟢 Stablecoin payments for consultations / escrow

### AI and analytics
- [ ] 🟡 Dashboard powered by indexed events (real data, fast)
- [ ] 🟡 AI summary of a patient's history for the doctor (runs on locally decrypted data, with consent)
- [ ] 🟢 Anomaly detection on access patterns (one doctor opening hundreds of records)
- [ ] 🟢 Anonymized aggregate analytics for research

---

## 8. Phase 6 — Tooling, migration, DevOps

- [ ] 🟠 Move contracts to **Hardhat** (or Foundry): compile, test, deploy, verify, gas reports. Replaces `compile.js` / `deploy.js` and deprecated `truffle-hdwallet-provider@0.0.3` / `ganache-cli`.
- [ ] 🟠 Upgrade frontend: Next.js 14 (App Router) + TypeScript + Tailwind/shadcn; **wagmi + viem + RainbowKit** instead of raw web3.js.
- [ ] 🟠 CI (GitHub Actions): lint → compile → test → Slither → deploy to Sepolia on tag → frontend to Vercel.
- [ ] 🟠 Run **Slither** and **Mythril** before any public deployment; fix findings.
- [ ] 🟡 Deploy to a cheaper L2 (Base / Polygon / Arbitrum) or a permissioned chain (Hyperledger Besu) for a hospital consortium.
- [ ] 🟡 Verify the contract on Etherscan; keep per-network `deployments.json`.
- [ ] 🟡 Gas optimization: pack structs, `bytes32` / `uint64`, avoid unbounded arrays.
- [ ] 🟡 Indexer: The Graph subgraph, or a small Node + Postgres service listening to events.
- [ ] 🟢 Upgradeability (UUPS proxy) once the design stabilizes.

---

## 9. Phase 7 — Documentation and compliance

- [ ] 🟠 Proper README: overview, architecture diagram, setup, env vars, deploy steps, screenshots.
- [ ] 🟠 **Threat model**: who are the attackers, what is public, what is encrypted, what happens on key loss.
- [ ] 🟡 Compliance notes: HIPAA, GDPR, India DPDP Act. Right to erasure vs. immutability is solved by keeping personal data off-chain; only hashes stay on-chain.
- [ ] 🟡 Consent and privacy policy text shown in the UI.
- [ ] 🟡 Demo video + sample test accounts for reviewers.
- [ ] 🟢 If you publish this: a short paper section comparing your design to MedRec-style systems and quantifying gas cost and latency.

---

## 10. Suggested order of work

| Week | Focus | Done when |
|---|---|---|
| Day 1 | Phase 0 | No secrets in repo, `.env` works, new Infura key in use |
| Week 1 | Phase 1 (1.1–1.8) + Phase 3 tests | Appointments don't overwrite, consent enforced, doctor verification works, new tests pass |
| Week 2 | Phase 2 fixes | Real errors shown, dashboard correct, no public patient list |
| Week 3 | Phase 4 | No readable patient data on-chain; encrypted IPFS flow working end to end |
| Week 4 | Phase 6 migration | Hardhat + wagmi/viem + CI green |
| Ongoing | Phase 5 features | Pick by value: audit log, emergency access, prescriptions, hospital entity |

**Weekend quick wins:** rotate secrets → fix appointments → require consent on write → add events → hide public patient list → admin approval for doctors.

---

## 11. Target structure after the upgrade

```
blockchain-hospital-record/
├── contracts/            # Record.sol (0.8.x) or modules
├── test/                 # Hardhat tests (positive + negative)
├── scripts/              # deploy.ts, verify.ts
├── deployments/          # sepolia.json, base.json ...
├── frontend/
│   ├── app/              # Next.js 14 pages (role-based)
│   ├── components/
│   ├── lib/              # wagmi config, crypto.ts, ipfs.ts
│   └── hooks/
├── indexer/              # subgraph or event listener
├── .env.example
├── hardhat.config.ts
└── README.md
```

---

## 12. Definition of done

- [ ] No secrets anywhere in the repo or history
- [ ] No readable patient data on-chain; only hashes, CIDs, roles and consent
- [ ] Doctors are verified by an admin before they can write records
- [ ] A patient can have many appointments, none overwritten
- [ ] Every read/grant/revoke is visible in the patient's audit log
- [ ] Negative tests pass; Slither shows no high/medium findings
- [ ] Clear error messages in the UI; no `alert()` popups
- [ ] README and threat model are complete
