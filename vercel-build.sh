#!/bin/bash
set -e

echo "Building for Vercel..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies at root
echo "Installing root dependencies..."
npm install --legacy-peer-deps

# Build the web app
echo "Building web app..."
cd apps/web
npm run build

echo "Build successful!"
