# GitHub Setup Guide

This guide will help you set up this project on GitHub and deploy it using GitHub Pages.

## 📦 Initial Setup

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it `birds-of-israel` (or your preferred name)
5. Choose "Public" (required for free GitHub Pages)
6. **Don't** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### 2. Initialize Git and Push to GitHub

Open your terminal in the project directory and run:

```bash
# Initialize git repository
git init

# Add all files (config.js will be ignored by .gitignore)
git add .

# Make your first commit
git commit -m "Initial commit: Birds of Israel eBird Explorer"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/birds-of-israel.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🌐 Deploy to GitHub Pages

### Option 1: Using GitHub Pages (Recommended)

1. Go to your repository on GitHub
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait a few minutes for GitHub to build your site
7. Your site will be available at: `https://YOUR_USERNAME.github.io/birds-of-israel/`

### Option 2: Using a Custom Domain

1. Follow steps 1-4 from Option 1
2. In the **Custom domain** field, enter your domain
3. Follow GitHub's instructions for DNS configuration

## ⚠️ Important: API Key Configuration

Since `config.js` is in `.gitignore`, it won't be pushed to GitHub. For GitHub Pages deployment, you have a few options:

### Option A: Client-Side Configuration (Simple but less secure)

1. Create a `config.js` file in your repository (not in .gitignore)
2. Add a placeholder API key or instructions
3. Users will need to fork and add their own key

**Note**: This exposes the API key in the browser, but eBird API keys are meant for client-side use.

### Option B: Environment Variables (More secure, requires build step)

1. Use GitHub Actions to inject the API key during build
2. Store the API key as a GitHub Secret
3. Requires a build process (webpack, etc.)

### Option C: User Instructions (Recommended for public repos)

Keep `config.js` in `.gitignore` and add clear instructions in the README for users to:
1. Copy `config.js.example` to `config.js`
2. Add their own API key
3. Run locally or deploy to their own hosting

## 🔄 Updating Your Site

After making changes:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

GitHub Pages will automatically rebuild your site (may take a few minutes).

## 📝 Repository Settings

### Recommended Settings:

1. **Description**: "Interactive web app exploring birdlife in Israel using eBird API data"
2. **Topics**: Add tags like: `birds`, `israel`, `ebird`, `javascript`, `web-app`, `ornithology`
3. **Website**: Add your GitHub Pages URL
4. **Enable Issues**: For bug reports and feature requests
5. **Enable Discussions**: For community engagement

## 🎨 Adding a GitHub Profile Badge

Add this to your README.md to show the project on your GitHub profile:

```markdown
[![Birds of Israel](https://github-readme-stats.vercel.app/api/pin/?username=YOUR_USERNAME&repo=birds-of-israel)](https://github.com/YOUR_USERNAME/birds-of-israel)
```

## 🚀 Continuous Deployment

GitHub Pages automatically deploys on every push to the `main` branch. No additional configuration needed!

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions for Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

---

Happy birding! 🦅

