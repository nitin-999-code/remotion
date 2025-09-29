#!/bin/bash

echo "🚀 Deploying Remotion Captioning Demo to Vercel..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📤 Deploying to Vercel..."
    
    # Deploy to Vercel
    npx vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "Your app should now be accessible on Vercel."
    else
        echo "❌ Deployment failed. Please check the error messages above."
    fi
else
    echo "❌ Build failed. Please fix the errors and try again."
fi
