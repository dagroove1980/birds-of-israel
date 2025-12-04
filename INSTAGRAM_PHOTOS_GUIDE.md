# 📸 Instagram Photos Integration Guide

This guide explains how to add your Instagram bird photos to the Birds of Israel website.

## How It Works

The app matches your Instagram photos to bird species using a mapping file. When a bird species appears in recent observations, if you've linked a photo to that species, it will automatically display.

## Quick Start

### Step 1: Get Instagram Post URLs

1. Open Instagram and find the post with your bird photo
2. Click the three dots (⋯) on the post
3. Select "Copy link" or "Copy post URL"
4. You'll get a URL like: `https://www.instagram.com/p/ABC123XYZ/`

### Step 2: Find the Species Code

1. Open the Birds of Israel website
2. Go to "Recent Sightings" or "Top Species" tab
3. Open your browser's Developer Console (F12 or right-click → Inspect)
4. Hover over a bird species card
5. In the console, you can see the `speciesCode` for each bird
6. Or check the observation data - species codes are like: `grerhe1`, `comgra1`, etc.

**Alternative method:**
- Look at the eBird website for the species
- The URL often contains the species code
- Or use the scientific name to find it

### Step 3: Add to Photo Mapping

1. Open `photo_mapping.js` in your editor
2. Add entries in this format:

```javascript
window.PHOTO_MAPPING = {
    "grerhe1": "https://www.instagram.com/p/ABC123XYZ/",
    "comgra1": "https://www.instagram.com/p/DEF456UVW/",
    "eursta1": "https://www.instagram.com/p/GHI789RST/"
};
```

3. Save the file
4. Refresh the website

## Features

### 📸 Photo Gallery Tab
- Browse all your bird photos in one place
- Photos are automatically matched to species from recent observations
- Click any photo to view it on Instagram

### 🐦 Photos in Observation Cards
- When viewing "Recent Sightings", photos appear automatically
- Photos are embedded directly from Instagram
- Click to view full post on Instagram

## Example Mapping

Here's a complete example:

```javascript
window.PHOTO_MAPPING = {
    // Great White Pelican
    "grerhe1": "https://www.instagram.com/p/CxYzAbC123/",
    
    // Common Grackle
    "comgra1": "https://www.instagram.com/p/CxYzAbC456/",
    
    // European Starling
    "eursta1": "https://www.instagram.com/p/CxYzAbC789/",
    
    // Add more as you photograph more species!
};
```

## Tips

1. **Batch Add Photos**: You can add multiple photos at once - just add all the mappings to the object
2. **Update Regularly**: Add new photos as you take them
3. **Species Codes**: If you're not sure of a species code, check the browser console or eBird website
4. **Multiple Photos**: Currently, one photo per species is supported. The most recent observation will show the photo.

## Troubleshooting

### Photos Not Showing?

1. **Check the URL format**: Must be a full Instagram post URL
   - ✅ Correct: `https://www.instagram.com/p/ABC123XYZ/`
   - ❌ Wrong: `https://instagram.com/p/ABC123XYZ` (missing www)
   - ❌ Wrong: `instagram.com/p/ABC123XYZ/` (missing https)

2. **Verify species code**: Make sure the species code matches exactly (case-sensitive)

3. **Check browser console**: Open Developer Tools (F12) and look for errors

4. **Refresh the page**: After updating `photo_mapping.js`, refresh the browser

### Instagram Embed Not Loading?

- Instagram embeds require the post to be public
- Some posts may take a moment to load
- If embeds fail, a link to Instagram will be shown instead

## Advanced: Finding Species Codes Programmatically

If you want to find species codes automatically, you can:

1. Open browser console on the website
2. Run this to see all species codes from recent observations:

```javascript
// This will log all species codes
const observations = await fetch('https://api.ebird.org/v2/data/obs/IL/recent?back=7', {
    headers: { 'X-eBirdApiToken': window.EBIRD_API_KEY }
}).then(r => r.json());

const speciesCodes = [...new Set(observations.map(o => o.speciesCode))];
console.log('Species codes:', speciesCodes);
```

## Need Help?

- Check the browser console for errors
- Verify your Instagram URLs are public posts
- Make sure species codes match exactly
- Refresh the page after making changes

Happy birding and photographing! 🦅📸

