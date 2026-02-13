# 🚀 Complete Deployment Guide - Gold Price Tracker

## Status
- ✅ Code committed locally
- ⏳ Waiting: Push to GitHub
- ⏳ Waiting: Deploy to hosting

---

## 🟢 STEP 1: GitHub Setup (2 minutes)

### 1.1 Create GitHub Repo
1. Go to **https://github.com/new**
2. Fill in:
   - Repository name: `gold-price-tracker`
   - Description: `Real-time gold price tracker`
   - Visibility: **PUBLIC** ⭐ (Important!)
3. Click **Create repository**

### 1.2 Push Your Code
```bash
cd /Users/abhishek/dev/gold
git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git
git branch -M main
git push -u origin main
```

✅ **Done!** Your code is now on GitHub. Proceed to Step 2.

---

## 🟢 STEP 2: Deploy Backend to Render (3 minutes)

### 2.1 Create Render Account
1. Go to **https://render.com**
2. Click **Sign up with GitHub**
3. Authorize Render to access your GitHub account
4. Click **Continue**

### 2.2 Create Web Service
1. In Render dashboard, click **+ New**
2. Select **Web Service**
3. Connect repository:
   - Search for `gold-price-tracker`
   - Click **Connect**
4. Fill in:
   - **Name**: `gold-tracker-api`
   - **Root Directory**: `./apps/api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build --workspace=@gold-tracker/api`
   - **Start Command**: `npm run start --workspace=@gold-tracker/api`
5. Scroll down, click **Advanced** (optional but helps):
   - **Instance Type**: Free

### 2.3 Add Environment Variables
In the same form, find **Environment** section and add:

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://gold-tracker-web.vercel.app` |

Click **Create Web Service**

### 2.4 Wait for Deployment
- Watch the deploy logs
- When you see "Server running on http://localhost:3001" ✅
- Copy your URL from the top (looks like `https://gold-tracker-api.onrender.com`)
- **Save this URL** - you need it for Vercel!

⏱️ **Time**: 2-3 minutes for first deploy

---

## 🟢 STEP 3: Deploy Frontend to Vercel (3 minutes)

### 3.1 Create Vercel Account
1. Go to **https://vercel.com/signup**
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub
4. Complete setup

### 3.2 Import Project
1. In Vercel dashboard, click **Add New**
2. Select **Project**
3. Search for `gold-price-tracker` repository
4. Click **Import**

### 3.3 Configure Deployment
In the **Import Project** form:

1. **Root Directory**: Select `./apps/web`

2. **Environment Variables** - Add these:
   ```
   NEXT_PUBLIC_API_URL=https://gold-tracker-api.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://gold-tracker-api.onrender.com
   ```
   
   ⭐ **Replace** `gold-tracker-api.onrender.com` with your actual Render URL from Step 2!

3. Click **Deploy**

### 3.4 Wait for Deployment
- Vercel deploys much faster than Render (usually 30-60 seconds)
- When deployment completes, you get your URL
- Click **Visit** to see your live site!

⏱️ **Time**: 1-2 minutes

---

## ✅ STEP 4: Verify Everything Works

### Test 1: Website Loads
- Open your Vercel URL
- Should see gold price cards
- Should show prices from all jewellers

### Test 2: Prices Display
- IBJA, Kalyan, PNG, Yahoo Finance should show ✅ (live rates)
- Bhima shows fallback (expected - Cloudflare blocks automated requests)

### Test 3: Real-time Updates
- Open browser DevTools (F12)
- Go to Console
- Should see WebSocket connected message
- Watch prices update every 1-2 minutes

---

## 🎯 Final URLs

After all 3 steps, you have:

**🌐 Website**: `https://YOUR-VERCEL-URL.vercel.app`
- Share this with friends!
- Real-time gold prices
- No backend URL needed (hidden behind the scenes)

**🔌 API** (optional viewing): `https://YOUR-RENDER-URL.onrender.com/api/prices/spot`
- Shows raw JSON of current prices
- Used by website internally

---

## ⚠️ Important Notes

### Cold Start Delays
Render free tier puts the API to sleep after 15 minutes of inactivity.
- First request after sleep: 10-30 seconds delay
- Subsequent requests: instant
- **Solution**: Keep website open or upgrade to paid ($7/month)

### Bhima Rates Show Fallback
Bhima Jewellers uses Cloudflare WAF which blocks automated requests.
- Free hosting IPs are recognized as automated
- Hardcoded fallback rates are actual values from their site
- All other rates fetch live data ✅

### Prices Not Updating?
1. Check browser console (F12)
2. Make sure Render API is running (might be sleeping)
3. Visit `https://gold-tracker-api.onrender.com/api/prices/spot` to wake it up
4. Reload website

---

## 🔧 Troubleshooting

### "Vercel build fails"
- Usually: Node version mismatch
- **Fix**: Add to Vercel env vars: `NODE_VERSION=20`
- Redeploy

### "WebSocket not connecting"
- Check NEXT_PUBLIC_SOCKET_URL is correct
- Make sure Render API is running
- Check browser console for specific error

### "Render deploy keeps failing"
- Check build logs in Render dashboard
- Common: Missing dependencies
- Try in terminal: `npm run build --workspace=@gold-tracker/api`

### "Prices show as 0"
- Wait 30 seconds (first load fetches prices)
- Reload page
- Check API is responding: Visit `/api/prices/spot` endpoint

---

## 📊 Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel** | Unlimited | $0/month |
| **Render** | 1 free tier service | $0/month (or $7/month for paid) |
| **Total** | | **$0/month** 🎉 |

Both services allow free custom domain upgrades at registry cost (~$10-15/year).

---

## 🎓 Next Steps (Optional)

### Custom Domain
1. Buy domain (Namecheap, GoDaddy, etc.)
2. **Vercel**: Project Settings → Domains → Add
3. Follow DNS instructions
4. Website now at `yoursite.com` instead of `.vercel.app`

### Paid Tier (if needed)
- **Render**: $7/month removes cold start sleep
- **Vercel**: Usually stays free, but custom domains are $10-15/year

### Monitoring
- Set up email alerts for deployment failures
- Monitor uptime with Render/Vercel built-in tools
- Check price feed once daily

### GitHub Actions (Automatic Deployment)
Already configured in `.github/workflows/deploy.yml`
- Every push to main automatically redeploys both services
- No manual deployment needed after first setup

---

## ✨ Summary

```
Start → GitHub (2 min) → Render (3 min) → Vercel (3 min) → Live! 🚀
        ═══════════════════════════════════════════════════════════════
                            Total: ~8 minutes
```

---

**Ready to deploy?** Start with Step 1 above!

Any issues? Check the troubleshooting section.
