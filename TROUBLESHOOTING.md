# GitHub Pages Troubleshooting

## Issue: 404 Error on GitHub Pages

### Step 1: Verify GitHub Pages is Enabled

1. Go to your repository: https://github.com/dagroove1980/birds-of-israel
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, make sure:
   - **Branch**: `main` is selected
   - **Folder**: `/ (root)` is selected
5. Click **Save**
6. Wait 1-2 minutes for GitHub to build

### Step 2: Check Build Status

1. Go to **Actions** tab in your repository
2. Look for any failed builds
3. If there are errors, they'll be shown there

### Step 3: Verify Files Are Pushed

Your repository should have these files at the root:
- ✅ index.html
- ✅ styles.css
- ✅ app.js
- ✅ config.js.example
- ✅ README.md

### Step 4: Check the URL

Your site should be at:
**https://dagroove1980.github.io/birds-of-israel/**

Note: It might take 1-5 minutes after enabling Pages for the site to appear.

### Step 5: API Key Issue

⚠️ **Important**: The `config.js` file is in `.gitignore` (for security), so it won't be on GitHub Pages.

**For GitHub Pages to work, you have two options:**

#### Option A: Make API Key Optional (Recommended for Public Sites)
The app will show a message asking users to add their own API key.

#### Option B: Add API Key to Repository (Less Secure)
If you want the site to work immediately, you can:
1. Remove `config.js` from `.gitignore` temporarily
2. Push it (your API key will be visible in the repository)
3. **Not recommended for public repos!**

---

## Still Not Working?

1. Check the repository URL is correct
2. Make sure the repository is **Public** (required for free GitHub Pages)
3. Wait 5-10 minutes and refresh
4. Check browser console for errors (F12)

