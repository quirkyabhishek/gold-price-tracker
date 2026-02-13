#!/bin/bash
set -e

echo "🔨 Building Next.js app for gold-price-tracker..."
cd /vercel/path0/apps/web

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building Next.js..."
npm run build

echo "✅ Build complete!"
