# Spendora Free Deployment Plan

This plan uses 100% free-tier services that are reliable and "always-on" (with minimal cold-starts).

## 🌍 Services Overview

| Component | Provider | Why? |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Best-in-class performance for Vite/React and free forever. |
| **Backend** | [Render](https://render.com) | Reliable free tier for Node.js. *Note: Spins down after inactivity.* |
| **Database** | [Neon](https://neon.tech) | Excellent serverless PostgreSQL with a generous free tier. |
| **Redis** | [Upstash](https://upstash.com) | Serverless Redis with a free tier perfect for BullMQ. |
| **Media** | [Cloudinary](https://cloudinary.com) | Free storage for receipt images and profile pictures. |

---

## 🛠️ Step-by-Step Setup

### 1. Database (Neon)
1. Sign up at [neon.tech](https://neon.tech).
2. Create a new project called `spendora`.
3. Copy the **Connection String** (it will look like `postgres://user:pass@host/db`).
   - *Save this for your Backend Environment Variables.*

### 2. Redis (Upstash)
1. Sign up at [upstash.com](https://upstash.com).
2. Create a "Redis" database in a region close to your database.
3. Copy the **REDIS_URL** (e.g., `redis://default:pass@host:port`).
   - *Save this for your Backend Environment Variables.*

### 3. Backend (Render)
1. Sign up at [render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository and select the `feature/spendora-mvp` branch.
4. Settings:
   - **Root Directory**: `spendora/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**: Add all keys from your `.env` file (DATABASE_URL, REDIS_URL, JWT_SECRET, etc.).
6. Once deployed, copy your Render URL (e.g., `https://spendora-api.onrender.com`).

### 4. Frontend (Vercel)
1. Sign up at [vercel.com](https://vercel.com).
2. Click **New Project** and import your GitHub repo.
3. Settings:
   - **Root Directory**: `spendora/frontend`
   - **Framework Preset**: Vite
4. **Environment Variables**:
   - `VITE_API_URL`: Set this to your **Render URL** + `/api` (e.g., `https://spendora-api.onrender.com/api`).
5. Click **Deploy**.

---

## 🔗 URL & Environment Management

When moving from local development to production, your app needs to know where to find the backend.

### Backend (`.env` on Render)
- `CLIENT_URL`: Set this to your frontend URL (e.g., `https://spendora.vercel.app`). This is critical for **CORS** and **Auth Cookies** to work.

### Frontend (`.env` on Vercel)
- `VITE_API_URL`: Set this to your backend URL (e.g., `https://spendora-api.onrender.com/api`).

### Mobile (`src/api.js`)
In production, your mobile app needs to point to the live server instead of your computer's IP. Update `mobile/src/api.js`:
```javascript
// Production URL
export const API_BASE_URL = 'https://spendora-api.onrender.com/api';
```

---

## 📱 Mobile Deployment (Standalone Apps)

To distribute your app to others without using the Expo Go QR code, you need to create a **Standalone Build** (APK for Android or IPA for iOS) using **EAS (Expo Application Services)**.

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login & Configure
```bash
eas login
eas build:configure
```

### 3. Create a Build
- **For Android (APK)**:
  ```bash
  eas build --platform android --profile preview
  ```
  *(The `preview` profile generates an installable `.apk` file instead of an `.aab` for the Play Store).*
- **For iOS**:
  ```bash
  eas build --platform ios
  ```

### 4. Over-the-Air (OTA) Updates
One of the best features of Expo is **EAS Update**. If you fix a bug or change a color, you can push the update without making users download a new app:
```bash
eas update --message "Fixed mobile layout responsiveness"
```

---

## ⚠️ Important Notes

> [!IMPORTANT]
> **Cold Starts**: Render's free tier "sleeps" after 15 minutes of inactivity. The first request after a break might take 30-50 seconds to respond as it wakes up.

> [!TIP]
> **Persistent Login**: Since we use HTTP-only cookies, ensure that your `api.js` (Mobile) and `apiFetch` (Web) both have `credentials: 'include'` set to maintain the session across restarts.
