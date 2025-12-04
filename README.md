# 🦅 Birds of Israel - eBird Explorer

A beautiful, interactive web application that showcases the fascinating birdlife of Israel using data from the eBird API. Explore recent sightings, discover top species, find hotspots, and search for specific birds.

![Birds of Israel](https://img.shields.io/badge/Birds-Israel-green) ![eBird API](https://img.shields.io/badge/API-eBird-blue)

## ✨ Features

- **Recent Sightings**: View the latest bird observations across Israel
- **Top Species**: See the most commonly observed bird species
- **Hotspots**: Discover the best birding locations in Israel
- **📸 Photo Gallery**: Browse Instagram photos of birds matched to species
- **Species Search**: Search for specific birds by common or scientific name
- **Statistics Dashboard**: Real-time stats on observations, species, checklists, and hotspots
- **Regional Filtering**: Explore different regions of Israel (Jerusalem, Tel Aviv, Haifa, etc.)
- **Time Range Selection**: Filter observations by time period (1-30 days)
- **Instagram Integration**: Link your Instagram bird photos to species
- **Beautiful UI**: Modern, responsive design with smooth animations

## 🚀 Quick Start

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- An eBird API key ([Get one here](https://ebird.org/api/keygen))

### Installation

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/birds-of-israel.git
   cd birds-of-israel
   ```

2. **Set up your API key**
   ```bash
   cp config.js.example config.js
   ```
   
   Then edit `config.js` and replace `YOUR_API_KEY_HERE` with your actual eBird API key:
   ```javascript
   window.EBIRD_API_KEY = 'your-actual-api-key-here';
   ```

3. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local web server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     
     # Then visit http://localhost:8000
     ```

## 📖 Usage

1. **Select a region**: Choose from different regions of Israel using the dropdown
2. **Choose time range**: Select how many days back you want to see observations
3. **Click "Refresh Data"**: Load the latest bird data
4. **Explore tabs**:
   - **Recent Sightings**: See the latest observations
   - **Top Species**: View most commonly seen birds
   - **Hotspots**: Discover birding locations
   - **Search Species**: Search for specific birds

## 🗺️ Available Regions

- **IL**: All of Israel
- **IL-JM**: Jerusalem
- **IL-TA**: Tel Aviv
- **IL-HA**: Haifa
- **IL-Z**: Northern District
- **IL-D**: Southern District

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, pure JS for API calls and DOM manipulation
- **eBird API 2.0**: Bird observation data

### API Endpoints Used

- `/data/obs/{region}/recent` - Recent observations
- `/ref/hotspot/{region}` - Hotspot information
- `/ref/region/info/{regionCode}` - Region information

### Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 API Key Setup

1. Visit [eBird API Key Generator](https://ebird.org/api/keygen)
2. Sign in with your eBird account (or create one)
3. Generate an API key
4. Copy the key to `config.js`

**Important**: Never commit `config.js` to version control! It's already in `.gitignore`.

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #2c5f41;
    --secondary-color: #4a8c6a;
    --accent-color: #6bb88a;
    /* ... */
}
```

### Adding More Regions

Edit the region dropdown in `index.html`:

```html
<option value="IL-XX">Your Region</option>
```

Then ensure the region code is valid according to eBird's region codes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **eBird**: For providing the amazing API and bird observation data
- **Cornell Lab of Ornithology**: For maintaining eBird
- **Birdwatchers of Israel**: For contributing observations

## 🔗 Links

- [eBird Website](https://ebird.org)
- [eBird API Documentation](https://documenter.getpostman.com/view/664302/S1Lwx3Ga)
- [Get eBird API Key](https://ebird.org/api/keygen)

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ for bird enthusiasts in Israel**

