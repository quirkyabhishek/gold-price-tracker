# ⚡ Quick GitHub Setup - Do This Now!

## What You Need (2 minutes setup):

### Step 1: Create GitHub Repository
You need to create this ONCE on GitHub.com website:

1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `gold-price-tracker`
   - **Description**: `Real-time gold price tracker with live rates from Indian jewellers`
   - **Visibility**: Select **PUBLIC** ⭐ (Important for Vercel!)
3. Click **Create repository** button

### Step 2: Copy Your GitHub URL
After creating, GitHub shows you the repository URL. It will be:
```
https://github.com/YOUR_USERNAME/gold-price-tracker.git
```

### Step 3: Run This Command
Replace `YOUR_USERNAME` with your actual GitHub username, then run:

```bash
cd /Users/abhishek/dev/gold && \
git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git && \
git branch -M main && \
git push -u origin main
```

Example (if your username is `john_doe`):
```bash
cd /Users/abhishek/dev/gold && \
git remote add origin https://github.com/john_doe/gold-price-tracker.git && \
git branch -M main && \
git push -u origin main
```

## ✅ Done!

Your code is now on GitHub. See it at:
```
https://github.com/YOUR_USERNAME/gold-price-tracker
```

---

## Next: Deploy to Render + Vercel

Once GitHub push is complete, we deploy:

1. **Backend to Render** (3 minutes)
2. **Frontend to Vercel** (2 minutes)

Then your website is **LIVE**! 🎉
