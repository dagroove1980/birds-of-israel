#!/bin/bash

# Push to GitHub Script
echo "🚀 Pushing Birds of Israel to GitHub"
echo "====================================="
echo ""

# Check if remote exists
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already exists"
    git remote -v
    echo ""
    read -p "Do you want to push to this remote? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Cancelled."
        exit 0
    fi
else
    echo "No remote configured yet."
    echo ""
    echo "Please provide your GitHub repository URL."
    echo "Example: https://github.com/yourusername/birds-of-israel.git"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Remote added: $repo_url"
    echo ""
fi

# Check current branch
current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin "$current_branch"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to Settings > Pages"
    echo "3. Under 'Source', select:"
    echo "   - Branch: $current_branch"
    echo "   - Folder: / (root)"
    echo "4. Click Save"
    echo "5. Wait 1-2 minutes for GitHub to build your site"
    echo ""
    echo "Your site will be available at:"
    echo "https://$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^/]*\)\.git/\1.github.io\/\2/')"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Is your GitHub repository created?"
    echo "2. Is the repository URL correct?"
    echo "3. Do you have push permissions?"
    echo "4. Are you authenticated with GitHub?"
fi

