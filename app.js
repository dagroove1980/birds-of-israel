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
            <a href="${photoUrl}" target="_blank" rel="noopener noreferrer">
                <div class="photo-placeholder" data-instagram-url="${photoUrl}">
                    📸 View Photo on Instagram
                </div>
            </a>
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
            const card = document.createElement('div');
            card.className = 'hotspot-card';
            
            const latestObs = hotspot.latestObsDt 
                ? new Date(hotspot.latestObsDt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })
                : 'Unknown';
            
            card.innerHTML = `
                <h3>${hotspot.name}</h3>
                <div class="hotspot-details">
                    <div class="detail-item">
                        <span class="detail-label">📍 Location:</span>
                        <span class="detail-value">${hotspot.lat}, ${hotspot.lng}</span>
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
    try {
        // Use Instagram oEmbed API
        const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(instagramUrl)}&omitscript=true`;
        const response = await fetch(oembedUrl);
        
        if (!response.ok) {
            throw new Error('Failed to load Instagram embed');
        }
        
        const data = await response.json();
        
        // Create embed container
        const embedDiv = document.createElement('div');
        embedDiv.className = 'instagram-embed';
        embedDiv.innerHTML = data.html;
        embedDiv.style.maxWidth = '100%';
        
        // Replace placeholder
        container.parentElement.replaceChild(embedDiv, container);
        
        // Load Instagram's embed script if not already loaded
        if (!window.instgrm) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        } else {
            window.instgrm.Embeds.process();
        }
    } catch (error) {
        console.error('Error loading Instagram embed:', error);
        // Fallback: show link
        container.innerHTML = `<a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="instagram-link">📸 View on Instagram</a>`;
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
            loadInstagramEmbed(embedContainer, species.photoUrl);
        });
        
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<div class="error">Error loading photo gallery: ${error.message}</div>`;
    }
}

