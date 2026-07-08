const RESERVOIR_COORDS = {
  stanley: [11.8028, 77.8017],
  krs: [12.4381, 76.5724],
  idukki: [9.8456, 76.9736],
  nagarjuna: [16.5739, 79.3125],
  srisailam: [16.0886, 78.9006],
  tungabhadra: [15.2638, 76.3403],
  bhavanisagar: [11.4686, 77.1353],
  vaigai: [10.0544, 77.5806],
  mullaperiyar: [9.5303, 77.1408],
  kabini: [12.0239, 76.3514],
  banasura: [11.6698, 75.9556],
  almatti: [16.3319, 75.8886],
  hemavathi: [12.7844, 76.0503],
  malampuzha: [10.8283, 76.6806],
  sathanur: [12.1808, 78.8472],
  amaravathi: [10.4131, 77.2625]
};

const MAJOR_RESERVOIRS = ['stanley', 'krs', 'idukki', 'nagarjuna', 'srisailam'];
const mapMarkersRegistry = {};
let reservoirMapInstance = null;

function createSvgIcon(id) {
  const isMajor = MAJOR_RESERVOIRS.includes(id);
  const color = isMajor ? '#2563EB' : '#06B6D4'; // Royal Blue for major, Cyan for others
  const size = isMajor ? 32 : 24;
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="13" r="3" fill="#ffffff" />
    </svg>
  `;
  
  return L.divIcon({
    html: svg,
    className: 'custom-map-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4]
  });
}

function initReservoirMap() {
  const container = document.getElementById('reservoirMap');
  if (!container || typeof L === 'undefined') return;

  // Clear previous registry
  for (const k in mapMarkersRegistry) {
    delete mapMarkersRegistry[k];
  }

  // Destroy previous map instance if it exists
  if (reservoirMapInstance) {
    try {
      reservoirMapInstance.remove();
    } catch (e) {
      console.warn('Map removal failed:', e);
    }
    reservoirMapInstance = null;
  }

  // Set up the Leaflet map centered in South India
  reservoirMapInstance = L.map('reservoirMap', {
    zoomControl: true,
    scrollWheelZoom: false // disable scrolling zoom to avoid hijacking page scroll
  }).setView([12.5, 78.0], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(reservoirMapInstance);

  RESERVOIRS.forEach(r => {
    const coords = RESERVOIR_COORDS[r.id];
    
    if (coords) {
      addReservoirMarker(coords, r);
    } else {
      // Fallback geocoding lookup
      const controller = new AbortController();
      imageAbortControllers.set('map_' + r.id, controller);
      
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(r.name + ', India')}&format=json`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (data && data[0]) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            addReservoirMarker([lat, lon], r);
          }
        })
        .catch(() => {})
        .finally(() => {
          imageAbortControllers.delete('map_' + r.id);
        });
    }
  });
  
  // Close suggestions if clicked outside map search container
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.map-search-container')) {
      const suggestionsDiv = document.getElementById('mapSearchSuggestions');
      if (suggestionsDiv) suggestionsDiv.innerHTML = '';
    }
  });
}

function addReservoirMarker(coords, r) {
  if (!reservoirMapInstance) return;

  const customIcon = createSvgIcon(r.id);
  const marker = L.marker(coords, { icon: customIcon }).addTo(reservoirMapInstance);
  
  // Save in global registry for programmatic access (search)
  mapMarkersRegistry[r.id] = marker;

  const popupContent = `
    <div style="font-family:var(--font-body); color:#0f172a; min-width: 170px; padding: 4px;">
      <strong style="font-size:1.0rem; color:#2563EB; font-family:var(--font-display);">${r.name}</strong><br>
      <span style="font-size:0.8rem; color:#475569;"><b>Dam:</b> ${r.dam}</span><br>
      <span style="font-size:0.8rem; color:#475569;"><b>River:</b> ${r.river}</span><br>
      <span style="font-size:0.8rem; color:#475569;"><b>State:</b> ${r.state}</span><br>
      <p style="font-size:0.75rem; line-height: 1.35; margin-top: 6px; border-top:1px solid #e2e8f0; padding-top:4px; font-style:italic;">${r.fact}</p>
      <button class="btn btn-primary" style="margin-top: 6px; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; color:#fff; width:100%; justify-content:center;" onclick="discoverReservoir('${r.id}', '${r.name}')">Discover Fact</button>
    </div>
  `;
  marker.bindPopup(popupContent);
}

function discoverReservoir(id, name) {
  const discovered = stateManager.state.mapDiscovered || [];
  if (!discovered.includes(id)) {
    const updatedList = [...discovered, id];
    stateManager.update({ mapDiscovered: updatedList });
    addXP(10);
    addCoins(5);
    toast(`🗺️ Discovered: ${name}! (+10 XP)`);
  } else {
    toast(`💡 Already discovered: ${name}`);
  }
}

// Map Autocomplete & Search Functions
function onMapSearchInput(e) {
  const query = e.target.value.toLowerCase().trim();
  const suggestionsDiv = document.getElementById('mapSearchSuggestions');
  if (!suggestionsDiv) return;
  
  if (!query) {
    suggestionsDiv.innerHTML = '';
    return;
  }
  
  const matches = RESERVOIRS.filter(r => r.name.toLowerCase().includes(query));
  
  suggestionsDiv.innerHTML = matches.map(r => `
    <div class="map-suggestion-item" onclick="selectMapSuggestion('${r.id}')">
      <strong>${sanitizeHTML(r.name)}</strong> <span style="font-size:0.75rem; color:var(--muted);">(${r.state})</span>
    </div>
  `).join('');
}

function selectMapSuggestion(id) {
  const coords = RESERVOIR_COORDS[id];
  const marker = mapMarkersRegistry[id];
  if (coords && reservoirMapInstance && marker) {
    reservoirMapInstance.setView(coords, 10);
    marker.openPopup();
    
    const input = document.getElementById('mapSearchInput');
    if (input) {
      const res = RESERVOIRS.find(r => r.id === id);
      if (res) input.value = res.name;
    }
    const suggs = document.getElementById('mapSearchSuggestions');
    if (suggs) suggs.innerHTML = '';
  }
}
