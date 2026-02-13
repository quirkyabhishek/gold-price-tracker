#!/bin/bash

# Gold Price Tracker - Automated Deployment Script
# This script will help you deploy to Render and Vercel

echo "🚀 Gold Price Tracker - Deployment Setup"
echo "========================================="
echo ""

# Check if GitHub remote is set
if git remote get-url origin 2>/dev/null | grep -q "github.com"; then
    GITHUB_URL=$(git remote get-url origin)
    echo "✅ GitHub remote found: $GITHUB_URL"
else
    echo "❌ GitHub remote not configured yet"
    echo ""
    echo "To set up GitHub:"
    echo "1. Go to https://github.com/new"
    echo "2. Create repo: gold-price-tracker (PUBLIC)"
    echo "3. Run this command (replace YOUR_USERNAME):"
    echo ""
    echo "   cd /Users/abhishek/dev/gold"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/gold-price-tracker.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi

echo ""
echo "🔄 Pushing code to GitHub..."
git push -u origin main --force 2>&1 | grep -E "Branch|fatal|error|✓|→"

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
    echo ""
    echo "📊 Git Status:"
    echo "  Repository: $GITHUB_URL"
    echo "  Branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "  Commits: $(git rev-list --count HEAD)"
    echo ""
    echo "🎯 Next steps:"
    echo ""
    echo "STEP 1: Deploy Backend to Render"
    echo "  1. Go to: https://render.com/register"
    echo "  2. Sign up with GitHub"
    echo "  3. Create Web Service"
    echo "  4. Select: gold-price-tracker repository"
    echo "  5. Configure:"
    echo "     - Name: gold-tracker-api"
    echo "     - Root Directory: ./apps/api"
    echo "     - Build Command: npm install && npm run build --workspace=@gold-tracker/api"
    echo "     - Start Command: npm run start --workspace=@gold-tracker/api"
    echo "  6. Environment Variables:"
    echo "     - PORT=3001"
    echo "     - NODE_ENV=production"
    echo "     - CORS_ORIGINS=https://gold-tracker-web.vercel.app"
    echo "  7. Deploy (wait 2-3 minutes)"
    echo "  8. Copy your Render URL when ready"
    echo ""
    echo "STEP 2: Deploy Frontend to Vercel"
    echo "  1. Go to: https://vercel.com/signup"
    echo "  2. Sign up with GitHub"
    echo "  3. Import: gold-price-tracker repository"
    echo "  4. Root Directory: ./apps/web"
    echo "  5. Environment Variables (use Render URL from Step 1):"
    echo "     - NEXT_PUBLIC_API_URL=https://YOUR-RENDER-URL.onrender.com/api"
    echo "     - NEXT_PUBLIC_SOCKET_URL=https://YOUR-RENDER-URL.onrender.com"
    echo "  6. Deploy (wait 30-60 seconds)"
    echo ""
    echo "🎉 Result: Your website is LIVE!"
    echo "   Website: https://gold-tracker-web.vercel.app"
    echo "   API: https://gold-tracker-api.onrender.com"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your GitHub URL and try again"
    exit 1
fi
