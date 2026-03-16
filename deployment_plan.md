# 🚀 Spendora: Zero to Hero Deployment Guide

Welcome! This guide is designed for beginners. We will deploy Spendora using 100% free services. Follow these steps exactly, and you'll have your app live in no time.

---

## 📋 Preparation Checklist
1. A GitHub account with your code pushed to `feature/spendora-mvp`.
2. A credit/debit card (for verification only; services are free).
3. 30 minutes of focused time.

---

## 🏁 Phase 1: The Database (Neon)
Think of this as the "brain" where all your expenses are stored.

1. Sign up at [neon.tech](https://neon.tech).
2. Click **Create Project**. Name it `spendora-db`.
3. You will see a **Connection String**. It looks like this:
   `postgres://alex:abcd123@ep-cool-water-1234.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **👉 ACTION**: Copy this and save it as `DATABASE_URL` in a notepad.

---

## ⚡ Phase 2: The Fast Storage (Upstash Redis)
This handles backend background tasks like sending OTP emails.

1. Sign up at [upstash.com](https://upstash.com).
2. Click **Create Database**. Name it `spendora-redis`.
3. Scroll down to the **Node.js** tab.
4. Look for the `REDIS_URL`. It looks like:
   `redis://default:you-secret-code@cool-dog-123.upstash.io:6379`
5. **👉 ACTION**: Copy this and save it as `REDIS_URL` in your notepad.

---

## ⚙️ Phase 3: The Backend (Render)
This is the engine that runs your Node.js code.

1. Sign up at [render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub account and select your `Kharcha` repository.
4. **Crucial Settings**:
   - **Name**: `spendora-api`
   - **Root Directory**: `spendora/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Scroll down to **Environment Variables** and add these:
   - `DATABASE_URL` = (Your Neon URL)
   - `REDIS_URL` = (Your Upstash URL)
   - `JWT_SECRET` = (Type any random 32 characters, e.g., `my-super-secret-key-123-456-789`)
   - `JWT_REFRESH_SECRET` = (Type another random string)
   - `PORT` = `3000`
   - `CLIENT_URL` = (Keep empty for now, we will update this later).
6. Click **Create Web Service**.
7. **👉 ACTION**: Once deployed, copy the URL at the top (e.g., `https://spendora-api.onrender.com`).

---

## 💻 Phase 4: The Website (Vercel)
This is what users see in their browsers.

1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your `Kharcha` repository.
4. **Edit Settings**:
   - **Root Directory**: `spendora/frontend`
   - **Framework Preset**: Vite (should be auto-detected).
5. **Environment Variables**:
   - Add `VITE_API_URL`
   - Value: `https://your-render-url.onrender.com/api` (Replace with YOUR URL from Phase 3).
6. Click **Deploy**.
7. **👉 ACTION**: Copy your new website URL (e.g., `https://spendora-app.vercel.app`).

---

## 🔄 Phase 5: Connect Everything (The Final Link)
Now we must tell the Backend that it's okay to talk to your Website.

1. Go back to your **Render** dashboard.
2. Select your `spendora-api`.
3. Go to **Environment**.
4. Edit `CLIENT_URL` and paste your **Vercel URL** (e.g., `https://spendora-app.vercel.app`).
5. Save changes. Render will restart automatically.

---

## 📱 Phase 6: Mobile App (EAS Build)
To give the app to your friends as an APK:

1. Open your terminal on your computer.
2. Go to the mobile folder: `cd spendora/mobile`
3. Update `src/api.js`: Change the `API_BASE_URL` to your Render URL:
   ```javascript
   export const API_BASE_URL = 'https://spendora-api.onrender.com/api';
   ```
4. Run these commands:
   ```bash
   npm install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```
5. Wait 10 minutes. EAS will give you a link to download the `.apk` file!

---

## 🆘 Troubleshooting for Beginners
- **Q: My website says "Network Error"!**
  - *Check*: Did you add `/api` at the end of `VITE_API_URL` in Vercel?
  - *Check*: Did you set `CLIENT_URL` in Render to your Vercel URL?
- **Q: Render looks stuck at "Deploying".**
  - *Note*: Render is slow on the free tier. It can take 5-7 minutes to start the first time.
- **Q: I can't log in!**
  - *Check*: Is your `DATABASE_URL` correct? Check the logs in Render to see if there are database errors.

**You are now a Deployment Pro! 🎉**
