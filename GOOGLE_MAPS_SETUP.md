# Google Maps Static API Setup Guide

This guide will help you set up Google Maps Static API for displaying map thumbnails in the hotspots section.

## Step 1: Get a Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it "Birds of Israel" (or any name you prefer)
   - Click "Create"

3. **Enable the Maps Static API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Maps Static API"
   - Click on "Maps Static API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Your API key will be displayed
   - **Important**: Copy this key - you'll need it in the next step

5. **Restrict the API Key (Recommended for Security)**
   - Click "Restrict Key" (or edit the key)
   - Under "API restrictions", select "Restrict key"
   - Choose "Maps Static API" from the list
   - Under "Application restrictions", you can:
     - Select "HTTP referrers" and add your GitHub Pages URL: `https://dagroove1980.github.io/*`
     - Or leave it unrestricted for testing (less secure)
   - Click "Save"

## Step 2: Add API Key to Your Project

1. **Open `config.js`**
   - Add your Google Maps API key:
   ```javascript
   window.GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
   ```

2. **Save and push to GitHub**
   ```bash
   git add config.js
   git commit -m "Add Google Maps API key"
   git push
   ```

## Step 3: Test

1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Refresh your website
3. Go to the "Hotspots" tab
4. You should now see actual map thumbnails instead of the fallback

## Pricing

- **Free Tier**: Google Maps Static API offers a free tier
- **Free Quota**: $200 credit per month (equivalent to ~28,000 map loads)
- **After Free Tier**: $0.002 per request
- For a personal project, you'll likely stay within the free tier

## Troubleshooting

### Maps Still Not Showing?

1. **Check API Key**: Make sure the key is correct in `config.js`
2. **Check API Restrictions**: Make sure "Maps Static API" is enabled
3. **Check Browser Console**: Open F12 and look for errors
4. **Verify Billing**: Google Cloud requires a billing account (but you get $200 free credit)

### API Key Errors?

- Make sure the API key is not restricted to specific domains (or add your GitHub Pages domain)
- Verify the Maps Static API is enabled in your project
- Check that billing is enabled (required even for free tier)

## Security Note

Your API key will be visible in the browser (since it's in `config.js`). This is normal for client-side map usage. To protect it:

1. Restrict the API key to your domain (GitHub Pages URL)
2. Set API restrictions to only allow "Maps Static API"
3. Monitor usage in Google Cloud Console

---

**Need Help?** Check the [Google Maps Platform Documentation](https://developers.google.com/maps/documentation/maps-static/overview)

