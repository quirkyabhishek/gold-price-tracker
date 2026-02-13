# 🎉 YOUR CODE IS ON GITHUB! NOW DEPLOY IT

## ✅ Status: Code Pushed Successfully!

Your repository is live at:
**https://github.com/quirkyabhishek/gold-price-tracker**

---

## 🚀 NEXT: Deploy Backend to Render (3 minutes)

### Step 1: Sign Up
1. Go to: **https://render.com/register**
2. Click: **"Continue with GitHub"**
3. Authorize Render to access your GitHub account

### Step 2: Create Web Service
1. You'll be in the Dashboard
2. Click: **"+ New"** button (top left)
3. Select: **"Web Service"**

### Step 3: Connect Repository
1. Find and click on: **gold-price-tracker**
2. Click: **"Connect"**

### Step 4: Configure (EXACTLY AS SHOWN)

**Basic Settings:**
```
Name:                    gold-tracker-api
Runtime:                 Node
Root Directory:          ./apps/api
Build Command:           npm install && npm run build --workspace=@gold-tracker/api
Start Command:           npm run start --workspace=@gold-tracker/api
Instance Type:           Free
```

**Environment Variables** (scroll down and click "Advanced"):
```
PORT                     3001
NODE_ENV                 production
CORS_ORIGINS             https://gold-tracker-web.vercel.app
```

### Step 5: Deploy
1. Click: **"Create Web Service"**
2. **Wait 2-3 minutes** for deployment
3. When you see "Server running on http://localhost:3001" ✅
4. **SAVE YOUR RENDER URL** at the top (like: `https://gold-tracker-api.onrender.com`)

---

## 🌐 THEN: Deploy Frontend to Vercel (2 minutes)

### Step 1: Sign Up
1. Go to: **https://vercel.com/signup**
2. Click: **"Continue with GitHub"**
3. Authorize Vercel

### Step 2: Import Project
1. In Vercel Dashboard, click: **"Add New"**
2. Select: **"Project"**
3. Search for: **gold-price-tracker**
4. Click: **"Import"**

### Step 3: Configure

**Root Directory:**
- Click the dropdown
- Select: **./apps/web**

**Environment Variables** (scroll down to "Environment Variables"):
```
NEXT_PUBLIC_API_URL      https://gold-tracker-api.onrender.com/api
NEXT_PUBLIC_SOCKET_URL   https://gold-tracker-api.onrender.com
```

⭐ **IMPORTANT**: Replace `gold-tracker-api.onrender.com` with your ACTUAL Render URL from above!

### Step 4: Deploy
1. Click: **"Deploy"**
2. **Wait 30-60 seconds**
3. When complete, click: **"Visit"** to see your live site!

---

## 🎯 You're LIVE! 

Your website is now running at your Vercel URL!

**Share this link:**
```
https://gold-tracker-web.vercel.app
```

Your API is running at:
```
https://gold-tracker-api.onrender.com
```

---

## ✨ What Your Site Does

- ✅ Shows gold prices from 5 sources (IBJA, Yahoo, Kalyan, PNG, Bhima)
- ✅ Updates every 1-2 minutes automatically
- ✅ Real-time WebSocket updates
- ✅ Works on mobile, tablet, desktop
- ✅ Completely free!

---

## 🧪 Test Your Deployment

After both are deployed:

1. **Visit your website:**
   - Go to your Vercel URL
   - See price cards?
   - Prices showing? ✅

2. **Check API:**
   - Visit: `https://gold-tracker-api.onrender.com/api/prices/spot`
   - See JSON prices? ✅

3. **Test WebSocket:**
   - Open browser DevTools (F12)
   - Go to Console
   - See "Connected to WebSocket"? ✅

---

## 📋 Summary

| What | Status |
|------|--------|
| GitHub | ✅ Done |
| Render Backend | ⏳ Do Now |
| Vercel Frontend | ⏳ Do After Render |
| Website Live | ⏳ Will be done in ~6 minutes |

---

**Time to complete: ~5 minutes**
**Cost: $0**
**Result: Live gold price tracker with custom URL!**

Start with the Render steps above! 🚀
