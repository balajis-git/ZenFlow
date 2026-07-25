# ZenFlow Production Deployment Guide

This guide outlines the production deployment procedure for **ZenFlow** on Vercel (Frontend), Render (Backend API), and MongoDB Atlas (Cloud Database).

---

## 🗄️ 1. MongoDB Atlas Setup

1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free Tier or M10 Dedicated).
3. Under **Database Access**, create a Database User with read/write privileges.
4. Under **Network Access**, add `0.0.0.0/0` to allow access from Render/Vercel server IPs.
5. Copy your connection URI string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/zenflow?retryWrites=true&w=majority`

---

## 🚀 2. Backend Deployment (Render)

1. Connect your repository to [Render Web Services](https://render.com).
2. Set Root Directory to `backend`.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Configure **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-frontend.vercel.app
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zenflow?retryWrites=true&w=majority
   JWT_SECRET=your_production_secure_jwt_secret_key_32bytes
   JWT_REFRESH_SECRET=your_production_secure_refresh_secret_key_32bytes
   ```

---

## ⚡ 3. Frontend Deployment (Vercel)

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set **Framework Preset**: `Vite`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Deploy the project. Vercel will auto-assign your production URL (`https://zenflow.vercel.app`).

---

## 🔒 4. Production Security & Optimization Checklist

- [x] SSL / HTTPS enabled automatically by Vercel & Render
- [x] CORS restricted to `CLIENT_URL`
- [x] Express Helmet security headers enabled
- [x] Express Rate Limiter configured for API protection
- [x] Password hashing via `bcrypt` (salt rounds: 10)
- [x] HTTP-only secure cookies for JWT refresh token rotation
