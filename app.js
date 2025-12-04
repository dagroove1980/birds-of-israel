// eBird API Base URL
const EBIRD_API_BASE = 'https://api.ebird.org/v2';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for config.js to load if it exists
    setTimeout(() => {
        // Check if API key is configured
        if (!window.EBIRD_API_KEY) {
            const warning = document.getElementById('api-key-warning');
            if (warning) {
                warning.style.display = 'block';
            }
            // Disable controls
            const refreshBtn = document.getElementById('refreshBtn');
            const searchBtn = document.getElementById('search-btn');
            if (refreshBtn) refreshBtn.disabled = true;
            if (searchBtn) searchBtn.disabled = true;
            
            // Show message in stats
            document.getElementById('totalObservations').textContent = 'N/A';
            document.getElementById('totalSpecies').textContent = 'N/A';
            document.getElementById('totalChecklists').textContent = 'N/A';
            document.getElementById('totalHotspots').textContent = 'N/A';
            return;
        }
        
        initializeTabs();
        loadData();
        
        document.getElementById('refreshBtn').addEventListener('click', loadData);
        document.getElementById('days').addEventListener('change', loadData);
        document.getElementById('region').addEventListener('change', loadData);
        document.getElementById('search-btn').addEventListener('click', searchSpecies);
        document.getElementById('species-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchSpecies();
            }
        });
    }, 100); // Small delay to ensure config.js loads
});

// Tab switching
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Load data for the active tab if needed
            if (targetTab === 'species' && !document.getElementById('species-list').hasChildNodes()) {
                loadSpeciesData();
            } else if (targetTab === 'hotspots' && !document.getElementById('hotspots-list').hasChildNodes()) {
                loadHotspots();
            } else if (targetTab === 'gallery' && !document.getElementById('photo-gallery').hasChildNodes()) {
                loadPhotoGallery();
            }
        });
    });
}

// Main data loading function
async function loadData() {
    const region = document.getElementById('region').value;
    const days = document.getElementById('days').value;
    
    try {
        await Promise.all([
            loadRecentObservations(region, days),
            loadSpeciesData(region, days),
            loadHotspots(region),
            updateStats(region, days)
        ]);
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check your API key and try again.');
    }
}

// Load recent observations
async function loadRecentObservations(region = 'IL', days = 3) {
    const container = document.getElementById('recent-observations');
    const loading = document.getElementById('recent-loading');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    try {
        const observations = await fetchEBirdData(`/data/obs/${region}/recent`, { back: days });
        
        loading.style.display = 'none';
        
        if (!observations || observations.length === 0) {
            container.innerHTML = '<div class="error">No recent observations found for this region.</div>';
            return;
        }
        
        // Group by species and get unique observations
        const uniqueSpecies = new Map();
        observations.forEach(obs => {
            const key = obs.speciesCode;
            if (!uniqueSpecies.has(key) || new Date(obs.obsDt) > new Date(uniqueSpecies.get(key).obsDt)) {
                uniqueSpecies.set(key, obs);
            }
        });
        
        const sortedObservations = Array.from(uniqueSpecies.values())
            .sort((a, b) => new Date(b.obsDt) - new Date(a.obsDt))
            .slice(0, 30);
        
        sortedObservations.forEach(obs => {
            const card = createObservationCard(obs);
            container.appendChild(card);
        });
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<div class="error">Error loading observations: ${error.message}</div>`;
    }
}

// Create observation card
function createObservationCard(obs) {
    const card = document.createElement('div');
    card.className = 'observation-card';
    
    const date = new Date(obs.obsDt);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Check if there's a photo for this species
    const photoUrl = window.PHOTO_MAPPING && window.PHOTO_MAPPING[obs.speciesCode];
    const photoSection = photoUrl ? `
        <div class="observation-photo">
            <div class="photo-placeholder" data-instagram-url="${photoUrl}">
                <div class="photo-loading-spinner">Loading photo...</div>
            </div>
        </div>
    ` : '';
    
    card.innerHTML = `
        <h3>${obs.comName}</h3>
        <div class="scientific-name">${obs.sciName}</div>
        ${photoSection}
        <div class="observation-details">
            <div class="detail-item">
                <span class="detail-label">📍 Location:</span>
                <span class="detail-value">${obs.locName || 'Unknown'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">📅 Date:</span>
                <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">🔢 Count:</span>
                <span class="detail-value">${obs.howMany || 'X'}</span>
            </div>
            ${obs.subnational1Name ? `
            <div class="detail-item">
                <span class="detail-label">🗺️ Region:</span>
                <span class="detail-value">${obs.subnational1Name}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    // Load Instagram embed if photo exists
    if (photoUrl) {
        loadInstagramEmbed(card.querySelector('.photo-placeholder'), photoUrl);
    }
    
    return card;
}

// Load species data
async function loadSpeciesData(region = 'IL', days = 30) {
    const container = document.getElementById('species-list');
    const loading = document.getElementById('species-loading');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    try {
        const observations = await fetchEBirdData(`/data/obs/${region}/recent`, { back: days });
        
        loading.style.display = 'none';
        
        if (!observations || observations.length === 0) {
            container.innerHTML = '<div class="error">No species data available.</div>';
            return;
        }
        
        // Count species occurrences
        const speciesCount = new Map();
        observations.forEach(obs => {
            const key = obs.speciesCode;
            speciesCount.set(key, {
                name: obs.comName,
                sciName: obs.sciName,
                count: (speciesCount.get(key)?.count || 0) + 1
            });
        });
        
        const sortedSpecies = Array.from(speciesCount.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 50);
        
        sortedSpecies.forEach(species => {
            const item = document.createElement('div');
            item.className = 'species-item';
            item.innerHTML = `
                <div class="species-info">
                    <h3>${species.name}</h3>
                    <div class="scientific-name">${species.sciName}</div>
                </div>
                <div class="species-count">${species.count}</div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<div class="error">Error loading species data: ${error.message}</div>`;
    }
}

// Convert decimal degrees to degrees/minutes/seconds format
function decimalToDMS(decimal, isLatitude) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    
    let direction;
    if (isLatitude) {
        direction = decimal >= 0 ? 'N' : 'S';
    } else {
        direction = decimal >= 0 ? 'E' : 'W';
    }
    
    return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`;
}

// Create Google Maps link from coordinates
function createGoogleMapsLink(lat, lng) {
    const latDMS = decimalToDMS(lat, true);
    const lngDMS = decimalToDMS(lng, false);
    
    // URL encode the coordinates
    const encodedLat = encodeURIComponent(latDMS);
    const encodedLng = encodeURIComponent(lngDMS);
    
    // Create Google Maps place URL
    return `https://www.google.com/maps/place/${encodedLat}+${encodedLng}/@${lat},${lng},15z/data=!4m4!3m3!8m2!3d${lat}!4d${lng}?entry=ttu`;
}

// Create map thumbnail using OpenStreetMap static map (free, no API key required)
function createMapPreview(lat, lng) {
    // Using OpenStreetMap static map service
    // This creates a map preview image
    const zoom = 15;
    const size = '400x300';
    
    // Try OpenStreetMap static map service
    // Format: center=lat,lng&zoom=level&size=widthxheight&markers=lat,lng,icon
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=${lat},${lng},red-pushpin`;
    
    // Alternative services if the above doesn't work:
    // Option 1: Using Mapbox (requires free API key)
    // return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${size}?access_token=YOUR_MAPBOX_TOKEN`;
    
    // Option 2: Using Google Maps Static API (requires API key)
    // return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=roadmap&markers=color:red|label:H|${lat},${lng}&key=YOUR_GOOGLE_API_KEY`;
}

// Load hotspots
async function loadHotspots(region = 'IL') {
    const container = document.getElementById('hotspots-list');
    const loading = document.getElementById('hotspots-loading');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    try {
        const hotspots = await fetchEBirdData(`/ref/hotspot/${region}`, { fmt: 'json' });
        
        loading.style.display = 'none';
        
        if (!hotspots || hotspots.length === 0) {
            container.innerHTML = '<div class="error">No hotspots found for this region.</div>';
            return;
        }
        
        // Sort by number of species (if available) or by name
        const sortedHotspots = hotspots
            .sort((a, b) => (b.numSpeciesAllTime || 0) - (a.numSpeciesAllTime || 0))
            .slice(0, 30);
        
        sortedHotspots.forEach(hotspot => {
            if (!hotspot.lat || !hotspot.lng) {
                console.log('Skipping hotspot without coordinates:', hotspot.name);
                return; // Skip hotspots without coordinates
            }
            
            console.log('Creating hotspot card for:', hotspot.name, 'at', hotspot.lat, hotspot.lng);
            
            const card = document.createElement('div');
            card.className = 'hotspot-card';
            
            const latestObs = hotspot.latestObsDt 
                ? new Date(hotspot.latestObsDt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })
                : 'Unknown';
            
            // Convert coordinates
            const latDMS = decimalToDMS(hotspot.lat, true);
            const lngDMS = decimalToDMS(hotspot.lng, false);
            const googleMapsLink = createGoogleMapsLink(hotspot.lat, hotspot.lng);
            const mapThumbnail = createMapPreview(hotspot.lat, hotspot.lng);
            
            card.innerHTML = `
                <h3>${hotspot.name}</h3>
                <div class="hotspot-map-container">
                    <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" class="hotspot-map-link" title="Click to open in Google Maps">
                        <img src="${mapThumbnail}" alt="Map of ${hotspot.name}" class="hotspot-map-thumbnail" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f0f0f0\' width=\'400\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' fill=\'%23999\'%3EMap preview%3C/text%3E%3C/svg%3E';">
                        <div class="hotspot-map-overlay">
                            <span class="map-link-text">🗺️ Open in Google Maps</span>
                        </div>
                    </a>
                </div>
                <div class="hotspot-details">
                    <div class="detail-item">
                        <span class="detail-label">📍 Coordinates:</span>
                        <span class="detail-value">${latDMS} ${lngDMS}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🗺️ Google Maps:</span>
                        <span class="detail-value">
                            <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" class="google-maps-link">
                                View on Google Maps →
                            </a>
                        </span>
                    </div>
                    ${hotspot.numSpeciesAllTime ? `
                    <div class="detail-item">
                        <span class="detail-label">🐦 Total Species:</span>
                        <span class="detail-value">${hotspot.numSpeciesAllTime}</span>
                    </div>
                    ` : ''}
                    ${hotspot.latestObsDt ? `
                    <div class="detail-item">
                        <span class="detail-label">📅 Latest Observation:</span>
                        <span class="detail-value">${latestObs}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<div class="error">Error loading hotspots: ${error.message}</div>`;
    }
}

// Search for species
async function searchSpecies() {
    const query = document.getElementById('species-search').value.trim();
    const container = document.getElementById('search-results');
    
    if (!query) {
        container.innerHTML = '<div class="error">Please enter a species name to search.</div>';
        return;
    }
    
    container.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        // Search in Israel region
        const observations = await fetchEBirdData(`/data/obs/IL/recent`, { back: 30 });
        
        const results = observations.filter(obs => 
            obs.comName.toLowerCase().includes(query.toLowerCase()) ||
            obs.sciName.toLowerCase().includes(query.toLowerCase())
        );
        
        if (results.length === 0) {
            container.innerHTML = '<div class="error">No results found for your search.</div>';
            return;
        }
        
        // Group by species
        const uniqueSpecies = new Map();
        results.forEach(obs => {
            const key = obs.speciesCode;
            if (!uniqueSpecies.has(key)) {
                uniqueSpecies.set(key, obs);
            }
        });
        
        container.innerHTML = '';
        uniqueSpecies.forEach(obs => {
            const card = createObservationCard(obs);
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = `<div class="error">Error searching: ${error.message}</div>`;
    }
}

// Update statistics
async function updateStats(region = 'IL', days = 30) {
    try {
        const observations = await fetchEBirdData(`/data/obs/${region}/recent`, { back: days });
        const hotspots = await fetchEBirdData(`/ref/hotspot/${region}`, { fmt: 'json' });
        
        const uniqueSpecies = new Set(observations.map(obs => obs.speciesCode));
        const uniqueChecklists = new Set(observations.map(obs => obs.subId));
        
        document.getElementById('totalObservations').textContent = observations.length.toLocaleString();
        document.getElementById('totalSpecies').textContent = uniqueSpecies.size.toLocaleString();
        document.getElementById('totalChecklists').textContent = uniqueChecklists.size.toLocaleString();
        document.getElementById('totalHotspots').textContent = (hotspots?.length || 0).toLocaleString();
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Fetch data from eBird API
async function fetchEBirdData(endpoint, params = {}) {
    if (!window.EBIRD_API_KEY) {
        throw new Error('eBird API key not configured. Please set EBIRD_API_KEY in config.js');
    }
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${EBIRD_API_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
        headers: {
            'X-eBirdApiToken': window.EBIRD_API_KEY
        }
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your eBird API key.');
        } else if (response.status === 404) {
            throw new Error('Data not found for this region.');
        } else {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
    }
    
    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    // If we got CSV instead of JSON, try to parse it or throw a helpful error
    if (contentType && contentType.includes('text/csv')) {
        throw new Error('API returned CSV format. Please ensure fmt=json parameter is included.');
    }
    
    // Try to parse as JSON
    try {
        return JSON.parse(text);
    } catch (e) {
        // If parsing fails, it might be CSV - show first few characters for debugging
        throw new Error(`Failed to parse JSON response. Response starts with: ${text.substring(0, 50)}...`);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('.stats-grid'));
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Load Instagram oEmbed
async function loadInstagramEmbed(container, instagramUrl) {
    if (!container) {
        console.error('Container not found for Instagram embed');
        return;
    }
    
    try {
        // Use Instagram oEmbed API with CORS proxy or direct call
        // Instagram oEmbed API: https://api.instagram.com/oembed/?url=POST_URL
        const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(instagramUrl)}&omitscript=true`;
        
        console.log('Loading Instagram embed for:', instagramUrl);
        
        const response = await fetch(oembedUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Instagram oEmbed API error:', response.status, response.statusText);
            throw new Error(`Instagram API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Instagram oEmbed data received:', data);
        
        if (!data.html) {
            throw new Error('No HTML in Instagram oEmbed response');
        }
        
        // Replace placeholder content with embed HTML
        container.innerHTML = data.html;
        container.className = 'instagram-embed';
        container.style.maxWidth = '100%';
        container.style.width = '100%';
        
        // Load Instagram's embed script if not already loaded
        if (!window.instgrm) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            script.onload = () => {
                console.log('Instagram embed script loaded');
                if (window.instgrm && window.instgrm.Embeds) {
                    window.instgrm.Embeds.process();
                }
            };
            script.onerror = () => {
                console.error('Failed to load Instagram embed script');
            };
            document.body.appendChild(script);
        } else {
            // Script already loaded, process embeds
            console.log('Instagram script already loaded, processing embeds');
            if (window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }
        
        // Process embeds multiple times to ensure they render
        setTimeout(() => {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }, 500);
        
        setTimeout(() => {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error loading Instagram embed:', error);
        console.error('Instagram URL:', instagramUrl);
        
        // Fallback: Create an iframe embed directly (more reliable)
        // Extract post ID from URL
        const postIdMatch = instagramUrl.match(/\/p\/([^\/\?]+)/);
        if (postIdMatch) {
            const postId = postIdMatch[1];
            const iframeSrc = `https://www.instagram.com/p/${postId}/embed/`;
            
            console.log('Using iframe fallback for post:', postId);
            
            container.innerHTML = `
                <iframe 
                    src="${iframeSrc}" 
                    width="100%" 
                    height="600" 
                    frameborder="0" 
                    scrolling="no" 
                    allowtransparency="true"
                    style="border-radius: 8px; max-width: 100%; display: block;"
                    loading="lazy"
                    title="Instagram post">
                </iframe>
            `;
            container.className = 'instagram-embed';
            container.style.width = '100%';
        } else {
            console.error('Could not extract post ID from URL:', instagramUrl);
            // Final fallback: show link
            container.innerHTML = `
                <div class="instagram-fallback">
                    <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="instagram-link">
                        📸 View Photo on Instagram
                    </a>
                </div>
            `;
        }
    }
}

// Load photo gallery
async function loadPhotoGallery() {
    const container = document.getElementById('photo-gallery');
    const loading = document.getElementById('gallery-loading');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    try {
        // Get recent observations to find species with photos
        const region = document.getElementById('region').value;
        const days = document.getElementById('days').value;
        const observations = await fetchEBirdData(`/data/obs/${region}/recent`, { back: days });
        
        // Group by species and find ones with photos
        const speciesWithPhotos = new Map();
        
        observations.forEach(obs => {
            const photoUrl = window.PHOTO_MAPPING && window.PHOTO_MAPPING[obs.speciesCode];
            if (photoUrl && !speciesWithPhotos.has(obs.speciesCode)) {
                speciesWithPhotos.set(obs.speciesCode, {
                    ...obs,
                    photoUrl: photoUrl
                });
            }
        });
        
        loading.style.display = 'none';
        
        if (speciesWithPhotos.size === 0) {
            container.innerHTML = `
                <div class="gallery-empty">
                    <p>📸 No photos mapped yet.</p>
                    <p>To add your Instagram photos:</p>
                    <ol>
                        <li>Open <code>photo_mapping.js</code></li>
                        <li>Add entries mapping species codes to Instagram post URLs</li>
                        <li>Format: <code>"speciesCode": "https://www.instagram.com/p/POST_ID/"</code></li>
                        <li>Refresh this page</li>
                    </ol>
                    <p><strong>Example:</strong></p>
                    <pre><code>window.PHOTO_MAPPING = {
    "grerhe1": "https://www.instagram.com/p/ABC123XYZ/",
    "comgra1": "https://www.instagram.com/p/DEF456UVW/"
};</code></pre>
                </div>
            `;
            return;
        }
        
        // Display photos
        const photoArray = Array.from(speciesWithPhotos.values());
        photoArray.forEach(species => {
            const photoCard = document.createElement('div');
            photoCard.className = 'photo-card';
            
            photoCard.innerHTML = `
                <div class="photo-card-header">
                    <h3>${species.comName}</h3>
                    <div class="scientific-name">${species.sciName}</div>
                </div>
                <div class="photo-card-content">
                    <div class="photo-embed-container" data-instagram-url="${species.photoUrl}">
                        <div class="photo-loading">Loading photo...</div>
                    </div>
                </div>
            `;
            
            container.appendChild(photoCard);
            
            // Load Instagram embed
            const embedContainer = photoCard.querySelector('.photo-embed-container');
            if (embedContainer) {
                loadInstagramEmbed(embedContainer, species.photoUrl);
            }
        });
        
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<div class="error">Error loading photo gallery: ${error.message}</div>`;
    }
}

