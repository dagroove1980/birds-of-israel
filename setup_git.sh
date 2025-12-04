#!/bin/bash

# Git Setup Script for Birds of Israel Project
# Run this script to configure git and prepare for GitHub

echo "🦅 Birds of Israel - Git Setup"
echo "================================"
echo ""

# Check if git config is set
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    echo "Git user configuration needed."
    echo ""
    read -p "Enter your name (for git commits): " git_name
    read -p "Enter your email (for git commits): " git_email
    
    git config user.name "$git_name"
    git config user.email "$git_email"
    echo "✅ Git configured!"
    echo ""
fi

# Add all files
echo "📦 Adding files to git..."
git add .
echo "✅ Files added!"
echo ""

# Make initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Birds of Israel eBird Explorer - Interactive web app showcasing birdlife in Israel"
echo "✅ Commit created!"
echo ""

echo "🎉 Git repository is ready!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Name it 'birds-of-israel' (or your preferred name)"
echo "3. Don't initialize with README (we already have one)"
echo "4. Then run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/birds-of-israel.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "5. Enable GitHub Pages in repository Settings > Pages"
echo ""

