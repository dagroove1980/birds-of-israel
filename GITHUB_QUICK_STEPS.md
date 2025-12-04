# Quick GitHub Setup Steps

## Step 1: Create Repository on GitHub

1. After signing in, go to: **https://github.com/new**
2. **Repository name**: `birds-of-israel` (or any name you prefer)
3. **Description** (optional): "Interactive web app exploring birdlife in Israel using eBird API data"
4. **Visibility**: Choose **Public** (required for free GitHub Pages)
5. **IMPORTANT**: 
   - ❌ Do NOT check "Add a README file"
   - ❌ Do NOT check "Add .gitignore"
   - ❌ Do NOT check "Choose a license"
   - (We already have these files!)
6. Click **"Create repository"**

## Step 2: Copy the Repository URL

After creating, GitHub will show you a page with setup instructions. You'll see a URL like:
```
https://github.com/dagroove1980/birds-of-israel.git
```

Copy this URL - you'll need it in the next step!

## Step 3: Push Your Code

Run these commands in your terminal:

```bash
cd "/Users/david.scebat/Documents/birds of israel"

# Add the GitHub repository (replace with your actual URL)
git remote add origin https://github.com/dagroove1980/birds-of-israel.git

# Make sure you're on main branch
git branch -M main

# Push your code
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: Select **main**
   - Folder: Select **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes

Your site will be live at:
**https://dagroove1980.github.io/birds-of-israel/**

---

**Note**: Your `config.js` file (with API key) is already in `.gitignore`, so it won't be pushed to GitHub. This keeps your API key private! 🔒

