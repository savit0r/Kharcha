<p align="center">
  <h1 align="center">💸 Spendora</h1>
  <p align="center">
    Open-source cashbook & expense tracker — Web + Mobile
  </p>
  <p align="center">
    <a href="https://github.com/tusharDevelops/Kharcha/blob/master/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
    </a>
    <a href="https://github.com/tusharDevelops/Kharcha/issues">
      <img src="https://img.shields.io/github/issues/tusharDevelops/Kharcha" alt="Issues" />
    </a>
    <a href="https://github.com/tusharDevelops/Kharcha/pulls">
      <img src="https://img.shields.io/github/issues-pr/tusharDevelops/Kharcha" alt="PRs" />
    </a>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  </p>
</p>

---

**Spendora** is a full-stack, open-source cashbook and expense tracking application. It lets you manage multiple cashbooks, track cash in/out, manage a party ledger, set budgets, and generate professional reports — all in one place, across **web and mobile**.

## ✨ Features

### 📒 Cashbooks
- Create multiple cashbooks (e.g. Office, Personal, Trip)
- Add Cash In / Cash Out entries with remarks, date, payment mode
- Search and filter entries by type
- Date-grouped entry view with daily totals
- Rename and delete books

### 📊 Reports & Export
- Generate reports: All Entries · Day-wise Summary · Payment Mode Summary
- Export as **PDF**, **Excel (.xlsx)**, or **CSV**
- Branded PDF with summary header and striped table

### 🤝 Party Ledger
- Track money given to / received from anyone (customers, suppliers, friends)
- Running balance per person — see who owes whom at a glance
- Full credit/debit history per party

### 🏠 Dashboard
- Unified net balance across all cashbooks
- 6-month cash flow bar chart
- Recent activity feed

### 👤 Account
- Register, login (password or OTP email)
- Activity log, profile details
- Session-based authentication

### 📱 Mobile (React Native / Expo)
- Full feature parity with web — all cashbook, ledger, and report features
- Offline-friendly UI with pull-to-refresh
- Native share sheet for PDF/Excel/CSV
- Works on Android and iOS via Expo Go

---

## 🗂️ Project Structure

```
spendora/
├── backend/          # Node.js + Express + PostgreSQL API
├── frontend/         # React + Vite web app
└── mobile/           # React Native + Expo mobile app
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express 5, PostgreSQL, JWT, Nodemailer, BullMQ |
| **Frontend** | React 18, Vite, React Router, jsPDF, XLSX, Sonner |
| **Mobile** | React Native, Expo SDK 54, React Navigation, XLSX, expo-print |
| **Database** | PostgreSQL (self-hosted or [Neon](https://neon.tech) free tier) |
| **Email (OTP)** | Nodemailer + any SMTP provider |
| **File uploads** | Cloudinary (optional) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18 and npm >= 9
- **PostgreSQL** database ([Neon](https://neon.tech) has a free tier)
- **Expo Go** app on your phone (for mobile development)

### 1 · Clone the repo

```bash
git clone https://github.com/tusharDevelops/Kharcha.git
cd Kharcha/spendora
```

### 2 · Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL, JWT secrets, and SMTP credentials
npm install
npm run dev
# API runs on http://localhost:3000
```

<details>
<summary>📋 Required environment variables</summary>

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `SMTP_HOST` | SMTP server for OTP emails |
| `SMTP_USER` | SMTP login email |
| `SMTP_PASS` | SMTP password |
| `CLIENT_URL` | Frontend URL for CORS (default: `http://localhost:5173`) |

See [`.env.example`](backend/.env.example) for all options.
</details>

### 3 · Frontend Setup

```bash
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api  (already set)
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4 · Mobile Setup

```bash
cd ../mobile
npm install
# Edit src/api.js — set BASE_URL to your machine's LAN IP
# e.g. http://192.168.1.10:3000/api
npx expo start --clear
# Scan the QR code with Expo Go
```

> **Tip:** On Android emulator use `http://10.0.2.2:3000/api`. On iOS simulator use `http://localhost:3000/api`.

---

## 📦 Database

Spendora uses PostgreSQL. You need to create the tables before running.

The schema includes:
- `users` — authentication
- `cashbooks` — book records  
- `entries` — cash in/out transactions
- `customers` — party ledger contacts
- `ledger_entries` — credit/debit per party
- `categories`, `budgets` — budgeting features
- `activity_logs` — audit trail
- `transactions` — general transaction log

> Schema SQL migration scripts are in `backend/models/`. Apply them in order.

---

## 🤝 Contributing

We love contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

**Good first issues** are labeled [`good first issue`](https://github.com/tusharDevelops/Kharcha/issues?q=label%3A%22good+first+issue%22) on GitHub.

---

## 🔒 Security

Found a vulnerability? Please read our [Security Policy](SECURITY.md) and report it responsibly — **do not create a public issue**.

---

## 📄 License

Spendora is open source software licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Expo](https://expo.dev) — React Native toolchain
- [Neon](https://neon.tech) — Free serverless PostgreSQL
- [SheetJS (xlsx)](https://sheetjs.com) — Excel generation
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation (web)
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) — Mobile charts

---

<p align="center">Made with ❤️ · <a href="https://github.com/tusharDevelops/Kharcha">github.com/tusharDevelops/Kharcha</a></p>
