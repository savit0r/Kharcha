# Contributing to Spendora

Thank you for your interest in contributing! 🎉 This document will help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## How to Contribute

You can contribute in many ways:

- 🐛 **Bug reports** — open an issue using the Bug Report template
- 💡 **Feature requests** — open an issue using the Feature Request template
- 🔧 **Code contributions** — fork, branch, and open a PR
- 📝 **Documentation** — fix typos, improve setup guides
- 🌍 **Translations** — help make Spendora multilingual

---

## Development Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL (or a free [Neon](https://neon.tech) DB)
- npm >= 9
- Expo CLI (`npm i -g expo-cli`) for mobile

### Clone and Install

```bash
git clone https://github.com/tusharDevelops/Kharcha.git
cd Kharcha/spendora
```

#### Backend
```bash
cd backend
cp .env.example .env       # fill in your credentials
npm install
npm run dev
```

#### Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

#### Mobile
```bash
cd ../mobile
npm install
npx expo start
```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `master` | Stable production code |
| `feature/your-feature` | New features |
| `fix/issue-description` | Bug fixes |
| `docs/what-you-changed` | Documentation only |

Always branch off `master`:
```bash
git checkout master
git pull origin master
git checkout -b feature/your-awesome-feature
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add budget alerts
fix: resolve PDF export crash on Android
docs: update mobile setup guide
refactor: simplify entry grouping logic
chore: upgrade expo SDK to 54
```

---

## Pull Request Process

1. Fork the repository and create your branch from `master`
2. Make your changes with clear, focused commits
3. Ensure the app runs without errors on both web and mobile
4. Update `README.md` if you changed any setup steps
5. Open a PR against `master` with a clear description
6. Wait for review — we aim to respond within 48 hours

### PR Checklist
- [ ] My code follows the existing style
- [ ] I have tested on web (frontend) **and/or** mobile (Expo Go)
- [ ] No sensitive credentials are committed (no `.env` files)
- [ ] The PR description clearly explains what changed and why

---

## Questions?

Open a [Discussion](https://github.com/tusharDevelops/Kharcha/discussions) or [Issue](https://github.com/tusharDevelops/Kharcha/issues).
