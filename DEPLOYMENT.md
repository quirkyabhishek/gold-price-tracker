# Gold Price Tracker - Deployment Guide

## Quick Deployment Overview

This app consists of:
- **Frontend**: Next.js (React) - Deploy to Vercel
- **Backend**: Express.js API - Deploy to Render

## Step-by-Step Deployment

### 1. Deploy Backend (Express API) to Render

#### Prerequisites:
- GitHub account (push code to GitHub first)
- Render account (free)

#### Steps:

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git
   git branch -M main
   git push -u origin main
   ```

2. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select the repo: `gold-price-tracker`

4. **Configure Service:**
   - **Name**: `gold-tracker-api`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build --workspace=@gold-tracker/api`
   - **Start Command**: `npm run start --workspace=@gold-tracker/api`
   - **Root Directory**: `./apps/api`

5. **Environment Variables:**
   - Add in Render dashboard:
     ```
     PORT=3001
     CORS_ORIGINS=https://gold-tracker-web.vercel.app
     NODE_ENV=production
     ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Get URL: `https://gold-tracker-api.onrender.com`

---

### 2. Deploy Frontend (Next.js) to Vercel

#### Steps:

1. **Vercel Setup:**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Import project

2. **Select Repository:**
   - Select `gold-price-tracker`

3. **Configure Project:**
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./apps/web`
   - **Build Command**: `npm run build --workspace=@gold-tracker/web`
   - **Output Directory**: `.next`

4. **Environment Variables:**
   - Add in Vercel dashboard:
     ```
     NEXT_PUBLIC_API_URL=https://gold-tracker-api.onrender.com/api
     NEXT_PUBLIC_SOCKET_URL=https://gold-tracker-api.onrender.com
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Get URL: `https://gold-tracker-web.vercel.app`

---

## ✅ Final URLs

| Service | URL |
|---------|-----|
| **Website** | `https://gold-tracker-web.vercel.app` |
| **API** | `https://gold-tracker-api.onrender.com` |
| **Health Check** | `https://gold-tracker-api.onrender.com/health` |

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| **Vercel** (Frontend) | **FREE** ✅ |
| **Render** (Backend) | **FREE** ✅ (with limitations) |
| **Total** | **FREE** ✨ |

### Render Free Tier Limitations:
- Free instances sleep after 15 mins of inactivity
- First request will take 10-30 seconds (cold start)
- Suitable for demo/personal use

---

## Troubleshooting

### Cold Start Issue
If API takes long on first request:
- Upgrade to Render paid tier ($7/month for always-on)
- Or keep free tier and accept cold start delay

### CORS Issues
If frontend can't reach API:
1. Check `CORS_ORIGINS` env variable in Render
2. Ensure it matches your Vercel frontend URL
3. Restart Render service

### Bhima Rates Not Fetching
- This is expected on free hosting (Cloudflare WAF blocks)
- App will use fallback rates: 22K ₹13,818/g, 24K ₹15,580/g
- Other jewelers (IBJA, Kalyan, PNG) will work fine

---

## Next Steps

1. **Push to GitHub** (if not already)
2. **Create Render account** and deploy backend
3. **Create Vercel account** and deploy frontend
4. **Test** at your custom URLs
5. **Optionally upgrade** for better performance

---

## Alternative Platforms

If you prefer different hosting:

| Platform | Frontend | Backend | Free | Custom URL |
|----------|----------|---------|------|-----------|
| **Vercel** | ✅ | ❌ | ✅ | ✅ |
| **Netlify** | ✅ | ⚠️ | ✅ | ✅ |
| **Render** | ⚠️ | ✅ | ✅ | ✅ |
| **Railway** | ✅ | ✅ | ⚠️ | ✅ |
| **Fly.io** | ✅ | ✅ | ⚠️ | ✅ |

