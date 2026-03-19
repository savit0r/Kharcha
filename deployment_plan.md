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

## 📱 Phase 6: Mobile App (Making it a Real App)
Currently, you use the "Expo Go" app and a QR code. But if you turn off your computer, that QR code stops working. Phase 6 shows you how to create a **Standalone App** (an `.apk` file) that works 24/7.

### Step 1: Tell the app where the Internet is
Your app currently looks for your "Computer's IP". Now that your backend is on the internet (Render), we must tell the app to go there.
1. Open `spendora/mobile/src/api.js`.
2. Change the `API_BASE_URL` to your **Render URL**:
   ```javascript
   // Tell the app to talk to the live server on the internet
   export const API_BASE_URL = 'https://spendora-api.onrender.com/api';
   ```

### Step 2: Set up the "Build Tool" (EAS)
Building an app is hard, so we use a service called **EAS** (Expo Application Services). They do the heavy lifting for you on their powerful servers.
1. Open your terminal (Command Prompt or PowerShell).
2. Type this to install the tool:
   ```bash
   npm install -g eas-cli
   ```
3. Type this to log in (use your Expo account):
   ```bash
   eas login
   ```

### Step 3: Start the Build
Run this command to tell EAS to make an Android App file (`.apk`):
```bash
eas build -p android --profile preview
```
*   **What happens now?**:
    *   Your code is uploaded to the Expo servers.
    *   They start "cooking" your app (this takes 10-15 minutes).
    *   **Don't close your terminal!** Just wait.

### Step 4: Download & Install
1. When the build is finished, the terminal will show a **Download Link**.
2. Open that link on your phone.
3. Download the file (it will end in `.apk`).
4. Install it! (Your phone might ask "Allow install from unknown sources?" — click **Allow**).

### Step 5: Pushing Updates (Magic! ✨)
What if you find a bug or want to change a color tomorrow? You **don't** need to make a new APK! You can push an "Over-the-Air" (OTA) update.
1. Make your changes in the code.
2. Open your terminal in the `mobile` folder.
3. Run this command:
   ```bash
   eas update --message "Fixing a typo"
   ```
4. **Result**: The next time users open your app, it will automatically download the new version in the background. They don't have to download anything from a website!

> [!NOTE]
> **When do I need a new APK?**: You only need a new build (Step 3) if you install a **new library** (e.g., `npm install some-new-package`). For simple code or UI changes, Step 5 is all you need.

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
