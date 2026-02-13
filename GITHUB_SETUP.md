# GitHub Setup & Initial Push Guide

This guide will help you push the Gold Price Tracker to GitHub and set up automatic deployment.

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the **"+"** icon → **"New repository"**
3. Name it: `gold-price-tracker`
4. Description: `Real-time gold price tracker with rates from multiple jewellers`
5. Choose **Public** (required for free Vercel deployment)
6. Click **"Create repository"**

## Step 2: Initialize & Push Code

In your terminal, from the project root (`/Users/abhishek/dev/gold`):

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Gold price tracker with Express API and Next.js frontend"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git

# Rename branch to main (if currently on master)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

## Step 3: Verify Push

Go to your repository on GitHub and confirm all files are there:
- `/apps/api/` - backend code
- `/apps/web/` - frontend code
- `/package.json`, `tsconfig.base.json`, `turbo.json` - monorepo config
- `.env.example` - environment variable template
- `DEPLOYMENT.md` - deployment guide

## Step 4: Set Up Secrets for CI/CD (Optional)

If you want automatic deployment on every push to main:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:
   - `VERCEL_TOKEN` - Get from [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Your Vercel account ID
   - `VERCEL_PROJECT_ID` - After creating Vercel project
   - `RENDER_SERVICE_ID` - After creating Render service
   - `RENDER_DEPLOY_KEY` - From Render service settings

**Note:** This is optional. Manual deployment (next steps) is simpler for first-time setup.

## Next Steps

Once GitHub push is complete:

1. **Deploy Backend to Render**: Follow `DEPLOYMENT.md` → "Deploy Backend"
2. **Deploy Frontend to Vercel**: Follow `DEPLOYMENT.md` → "Deploy Frontend"
3. **Access Live App**: Visit `https://gold-tracker-web.vercel.app`

---

## Troubleshooting

### "fatal: not a git repository"
```bash
git init
git add .
git commit -m "Initial commit"
```

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git
```

### "Updates were rejected because the remote contains work"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Files not showing on GitHub
Check that `.gitignore` isn't excluding important files:
```bash
git status  # See what's being tracked
```

---

## Deployment Services Explained

| Service | Purpose | Free Tier | URL Format |
|---------|---------|-----------|-----------|
| **Vercel** | Frontend hosting (Next.js) | Yes, unlimited | `https://gold-tracker-web.vercel.app` |
| **Render** | Backend API hosting (Express) | Yes, with 15min sleep | `https://gold-tracker-api.onrender.com` |

Both services integrate directly with GitHub, so pushing updates automatically triggers redeployments.
