# Deployment Guide for ApiReg

This guide will help you deploy your ApiReg application to **Vercel** (frontend) and **Render** (backend).

---

## Prerequisites

1. **GitHub Repository** - Your code must be pushed to GitHub ✅
2. **MongoDB Database** - Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
3. **GitHub Account** - Connected to Vercel and Render

---

## Step 1: Prepare Your Environment Variables

### 1.1 Create MongoDB Atlas Database (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up
2. Create a free cluster (M0)
3. Create a database user (username/password)
4. Click "Connect" → "Connect your application"
5. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/apireg?retryWrites=true&w=majority
   ```

### 1.2 Set Backend Environment Variables
Create a `.env` file in the `backend/` folder with:
```env
# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Server
PORT=5000

# Email (optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@apireg.com

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

---

## Step 2: Deploy Backend to Render

### Option A: Deploy via render.yaml (Recommended)

1. Create a file named `render.yaml` in the root of your project:

```yaml
services:
  - type: web
    name: api-reg-backend
    env: node
    region: Oregon
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: EMAIL_HOST
        sync: false
      - key: EMAIL_PORT
        sync: false
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: ADMIN_EMAIL
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
```

2. Push to GitHub
3. Go to [Render Dashboard](https://dashboard.render.com)
4. Click "New" → "Blueprint"
5. Select your GitHub repo and connect

### Option B: Deploy Manually

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `api-reg-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables (see Step 1.2)
6. Click "Deploy"

### Get Your Backend URL
After deployment, Render will provide a URL like:
```
https://api-reg-backend.onrender.com
```

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite` (or Other)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` or `vite build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://api-reg-backend.onrender.com/api
   ```
6. Click "Deploy"

### Get Your Frontend URL
After deployment, Vercel will provide a URL like:
```
https://api-reg.vercel.app
```

---

## Step 4: Update Environment Variables

After deploying both, make sure:

1. **Backend** has `FRONTEND_URL` set to your Vercel URL
2. **Frontend** has `VITE_API_URL` set to your Render backend URL

---

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try logging in
3. If you get errors, check:
   - CORS settings in backend
   - Environment variables are correctly set
   - Network tab in browser console

---

## Troubleshooting

### CORS Errors
If you get CORS errors, update your backend CORS configuration in `server.js`:
```javascript
app.use(cors({
  origin: ["https://your-frontend.vercel.app"],
  credentials: true
}));
```

### Connection Refused to MongoDB
- Check your MongoDB Atlas network settings
- Add `0.0.0.0/0` to IP Access List for global access

### Build Failures
- Make sure Node.js version is compatible (18.x recommended)
- Check build logs in Vercel/Render dashboard

---

## Architecture Summary

```
┌─────────────────────────┐      ┌─────────────────────────┐
│      Vercel             │      │      Render             │
│   (Frontend)           │ ──►  │   (Backend)              │
│   React + Vite         │      │   Express + MongoDB     │
│                        │      │                         │
│ https://api-reg        │      │ https://api-reg-backend│
│ .vercel.app            │      │ .onrender.com           │
└─────────────────────────┘      └─────────────────────────┘
```

---

## Quick Commands for Local Testing

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

For additional help, check the logs in Vercel and Render dashboards.

