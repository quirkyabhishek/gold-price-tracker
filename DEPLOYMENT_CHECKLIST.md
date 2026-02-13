# 🚀 Deployment Checklist - Gold Price Tracker

Complete this checklist to successfully deploy your app to production with custom URLs.

---

## ✅ Phase 1: Local Development (COMPLETED)

- [x] Project structure set up (Turborepo monorepo)
- [x] Dependencies installed (`npm install`)
- [x] API server running on port 3001
- [x] Web server running on port 4001
- [x] All price sources working (IBJA, Yahoo, Kalyan, Bhima, PNG)
- [x] WebSocket connections established
- [x] Price updates every 1-30 minutes
- [x] `.gitignore` properly configured
- [x] `.env.example` with all variables documented

**Status**: ✅ READY - App fully functional locally

---

## 📋 Phase 2: GitHub Setup (DO THIS NEXT)

Follow instructions in [GITHUB_SETUP.md](./GITHUB_SETUP.md)

### Steps:
1. **Create GitHub account** (if needed): [github.com/signup](https://github.com/signup)

2. **Create new repository**:
   - Repository name: `gold-price-tracker`
   - Visibility: **Public** (required for free Vercel)
   - Don't initialize with README (we have one)

3. **Push code to GitHub**:
   ```bash
   cd /Users/abhishek/dev/gold
   git init
   git add .
   git commit -m "Initial commit: Gold price tracker"
   git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git
   git branch -M main
   git push -u origin main
   ```

4. **Verify**: Visit GitHub repo and confirm all files present

**Estimated time**: 5-10 minutes
**Status**: ⏳ PENDING - Required before deployment

---

## 🔧 Phase 3: Deploy Backend (Render)

Follow instructions in [DEPLOYMENT.md](./DEPLOYMENT.md) → "Deploy Backend"

### Quick Steps:
1. Sign up at [render.com](https://render.com) with GitHub
2. Create new **Web Service**
3. Connect your `gold-price-tracker` repo
4. Configure:
   - Root Directory: `./apps/api`
   - Build Command: `npm install && npm run build --workspace=@gold-tracker/api`
   - Start Command: `npm run start --workspace=@gold-tracker/api`
   - Environment Variables:
     - `PORT=3001`
     - `CORS_ORIGINS=https://gold-tracker-web.vercel.app` (update after Vercel deployment)
     - `NODE_ENV=production`
5. Deploy and note the URL: `https://gold-tracker-api.onrender.com`

**Important**: Keep this URL for next step
**Estimated time**: 10-15 minutes (first deploy slower)
**Status**: ⏳ PENDING

---

## 🎨 Phase 4: Deploy Frontend (Vercel)

Follow instructions in [DEPLOYMENT.md](./DEPLOYMENT.md) → "Deploy Frontend"

### Quick Steps:
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import `gold-price-tracker` repository
3. Configure:
   - Root Directory: `./apps/web`
   - Framework: Next.js
   - Build Command: `npm run build --workspace=@gold-tracker/web`
   - Environment Variables:
     - `NEXT_PUBLIC_API_URL=https://gold-tracker-api.onrender.com/api` (from Phase 3)
     - `NEXT_PUBLIC_SOCKET_URL=https://gold-tracker-api.onrender.com`
4. Deploy and note the URL: `https://gold-tracker-web.vercel.app`

**Estimated time**: 5-10 minutes
**Status**: ⏳ PENDING

---

## 🧪 Phase 5: Testing & Verification

Once both are deployed:

### Test Frontend
- [ ] Visit `https://gold-tracker-web.vercel.app`
- [ ] Page loads without errors
- [ ] See price cards for all jewellers
- [ ] IBJA, Kalyan, PNG, Yahoo Finance showing live rates ✅
- [ ] Bhima showing fallback rates (expected - Cloudflare blocks) ✅

### Test API
- [ ] Visit `https://gold-tracker-api.onrender.com/api/prices/spot`
- [ ] See JSON response with current prices
- [ ] All jewellers present in response

### Test WebSocket
- [ ] Open DevTools (F12) → Console
- [ ] Should see WebSocket connection messages
- [ ] Prices update in real-time as you watch

### Test Link Between Services
- [ ] Frontend can call API successfully
- [ ] Real-time price updates flowing
- [ ] No CORS errors in browser console

**Status**: ⏳ PENDING

---

## 📱 Phase 6: Optional Enhancements

After successful deployment, consider:

- [ ] **Custom Domain**
  - Vercel: Add domain in project settings ($10-12/year)
  - Render: Upgrade to paid tier for custom domain

- [ ] **Performance Optimization**
  - Monitor Render cold start times (15-30s first request, then instant)
  - Consider Render paid tier ($7/month) if cold starts problematic

- [ ] **Monitoring & Alerts**
  - Set up email alerts for deployment failures
  - Monitor API health endpoint
  - Track price fetch failures

- [ ] **Cloudflare Protection** (Optional)
  - Put Vercel behind Cloudflare for DDoS protection
  - Add caching rules for static assets

**Status**: ⏳ OPTIONAL

---

## 🔗 Final URLs & Sharing

Once Phase 4 complete, your app is live at:

**Website**: `https://gold-tracker-web.vercel.app`
**API**: `https://gold-tracker-api.onrender.com` (not publicly needed, but available for testing)

Share the website URL with friends/family!

---

## 🆘 Troubleshooting

### Common Issues:

**"GitHub not showing up when signing into Vercel/Render"**
- Disconnect & reconnect GitHub auth
- Check GitHub email is verified
- Re-authorize app permissions

**"Build failing on Render/Vercel"**
- Check logs in deployment dashboard
- Common: Node version mismatch - set `NODE_VERSION=20` in env vars
- Run `npm run build` locally to debug

**"Prices not updating"**
- First request might take 30s (Render cold start)
- Check CORS_ORIGINS includes Vercel URL
- Bhima using fallback is expected (Cloudflare blocks automated requests)

**"WebSocket not connecting"**
- Check browser console for errors
- Ensure NEXT_PUBLIC_SOCKET_URL env var set correctly
- Check Render API is running (visit health endpoint)

**"CORS errors in browser"**
- Update Render CORS_ORIGINS with Vercel URL
- Redeploy Render after changing env vars

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

---

## 📊 Progress Tracking

Mark your progress:

```
Phase 1 (Local Dev):      ✅ DONE
Phase 2 (GitHub):         ⏳ TODO
Phase 3 (Render Backend): ⏳ TODO
Phase 4 (Vercel Frontend):⏳ TODO
Phase 5 (Testing):        ⏳ TODO
Phase 6 (Optional):       ⏳ TODO

Total Time Estimate: 45-60 minutes
```

---

## 💡 Key Files Reference

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Main documentation |
| [GITHUB_SETUP.md](./GITHUB_SETUP.md) | GitHub push instructions |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Detailed deployment walkthrough |
| [.env.example](./.env.example) | Environment variables template |
| [vercel.json](./vercel.json) | Vercel build configuration |
| [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) | Optional GitHub Actions CI/CD |

---

## 🎯 Next Step

**You're here**: Reading this checklist
**Next step**: Follow [GITHUB_SETUP.md](./GITHUB_SETUP.md) to push your code to GitHub

Then come back and follow Phase 3 & 4 for deployment.

**Estimated total time to go live**: 45-60 minutes

Good luck! 🚀
