# Copy-Paste Commands for Deployment

## 🟢 Step 1: GitHub Push (Run This First)

After creating repo at https://github.com/new (with these settings):
- Name: `gold-price-tracker`
- Visibility: PUBLIC
- Initialize: Do NOT initialize with README

Run this command:

```bash
cd /Users/abhishek/dev/gold && git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git && git branch -M main && git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Expected output**: 
```
Enumerating objects...
Writing objects: 100%
...
Main -> main
```

---

## 🟢 Step 2: Render Backend Setup

1. Go to https://render.com/signup
2. Sign up with GitHub
3. Go to dashboard → "+ New" → "Web Service"
4. Select your `gold-price-tracker` repository
5. Fill in these values:

| Field | Value |
|-------|-------|
| Name | `gold-tracker-api` |
| Runtime | `Node` |
| Root Directory | `./apps/api` |
| Build Command | `npm install && npm run build --workspace=@gold-tracker/api` |
| Start Command | `npm run start --workspace=@gold-tracker/api` |

6. Add Environment Variables:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `CORS_ORIGINS` = `https://gold-tracker-web.vercel.app`

7. Click **Create Web Service**
8. Wait 2-3 minutes for deploy to complete
9. **SAVE YOUR RENDER URL** - looks like `https://gold-tracker-api.onrender.com`

---

## 🟢 Step 3: Vercel Frontend Setup

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Select `gold-price-tracker` repository
5. Configure:
   - **Root Directory**: `./apps/web`
   - **Framework**: Should auto-detect as "Next.js"

6. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://gold-tracker-api.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://gold-tracker-api.onrender.com
   ```
   
   Replace `gold-tracker-api.onrender.com` with your ACTUAL Render URL from Step 2!

7. Click **Deploy**
8. Wait 30-60 seconds
9. Click **Visit** when complete

---

## ✅ Done!

You now have:
- **Website**: Your Vercel URL (something like `gold-tracker-web.vercel.app`)
- **API**: Your Render URL (something like `gold-tracker-api.onrender.com`)

Both are live and connected. Visit your Vercel URL to see gold prices! 🎉

---

## 🔗 Quick Reference

| What | How | URL |
|------|-----|-----|
| Create GitHub Repo | https://github.com/new | - |
| GitHub Account | https://github.com/signup | - |
| Deploy Backend | https://render.com/signup | `https://render.com/dashboard` |
| Deploy Frontend | https://vercel.com/signup | `https://vercel.com/dashboard` |
| See Your Prices | Your Vercel URL | `https://gold-tracker-web-...vercel.app` |

---

## ⚠️ Remember

1. **Step 1 (GitHub)**: Must complete before steps 2 & 3
2. **Step 2 (Render)**: Takes 2-3 minutes, SAVE the URL you get
3. **Step 3 (Vercel)**: Use the Render URL from step 2 in environment variables
4. **All services**: FREE forever (unless you upgrade)

Questions? Check DEPLOY_NOW.md for detailed troubleshooting.
