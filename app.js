// --- Map init ---
const map = L.map('map', { zoomControl:true }).setView([25.033, 121.565], 12);

// OSM tiles (free). Fine for light usage. Heavy traffic: use your own tile provider.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Offset map down because of the topbar overlay
setTimeout(() => map.invalidateSize(), 200);

// --- Layers ---
const stationLayer = L.layerGroup().addTo(map);
const spotLayer = L.layerGroup().addTo(map);
const lineLayer = L.layerGroup().addTo(map);

let stationMarkers = new Map();
let spotMarkers = new Map();

let activeCategories = new Set(); // empty = show all
let selectedStation = null;
let selectedCircle = null;

// --- Helpers ---
function haversineMeters(lat1, lon1, lat2, lon2){
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat1))*Math.cos(toRad(lat2)) *
    Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function googleDirectionsLink(lat, lng){
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

// --- Draw lines (sample) ---
MRT_LINES.forEach(line=>{
  L.polyline(line.path, { color: line.color, weight: 5, opacity: 0.8 })
    .bindPopup(`<b>${escapeHtml(line.name)}</b>`)
    .addTo(lineLayer);
});

// --- Draw stations ---
TPE_STATIONS.forEach(st => {
  const mk = L.circleMarker([st.lat, st.lng], {
    radius: 6,
    color: "#000",
    weight: 2,
    fillColor: "#fff",
    fillOpacity: 1
  })
  .bindPopup(`<b>${escapeHtml(st.name)}</b><br><span style="color:#9aa3b2">MRT Station</span>`)
  .on("click", () => selectStation(st.id));

  mk.addTo(stationLayer);
  stationMarkers.set(st.id, mk);
});

// --- Draw spots ---
function spotIcon(category){
  // Simple colored dot by category (no external assets)
  // (Leaflet default markers are fine, but circles are cleaner here.)
  return null;
}

TPE_SPOTS.forEach(sp => {
  const mk = L.circleMarker([sp.lat, sp.lng], {
    radius: 7,
    color: "#1d2330",
    weight: 2,
    fillColor: "#3bd671",
    fillOpacity: 0.85
  })
  .bindPopup(`<b>${escapeHtml(sp.name)}</b><br><span style="color:#9aa3b2">${escapeHtml(sp.category)}</span><br><a target="_blank" rel="noopener" href="${googleDirectionsLink(sp.lat, sp.lng)}">Directions</a>`);

  mk.addTo(spotLayer);
  spotMarkers.set(sp.id, mk);
});

// --- Filters UI ---
const filtersEl = document.getElementById("filters");
const categories = Array.from(new Set(TPE_SPOTS.map(s=>s.category))).sort();

function renderFilters(){
  filtersEl.innerHTML = "";
  categories.forEach(cat=>{
    const pill = document.createElement("div");
    pill.className = "pill " + (activeCategories.has(cat) ? "on" : "");
    pill.textContent = cat;
    pill.onclick = () => {
      if (activeCategories.has(cat)) activeCategories.delete(cat);
      else activeCategories.add(cat);
      renderFilters();
      applySpotVisibility();
      refreshPanelList(); // if station selected
    };
    filtersEl.appendChild(pill);
  });
}
renderFilters();

// --- Spot visibility based on filter + search ---
let searchTerm = "";

function matchesSearch(name){
  if (!searchTerm) return true;
  return name.toLowerCase().includes(searchTerm.toLowerCase());
}

function categoryAllowed(cat){
  return activeCategories.size === 0 || activeCategories.has(cat);
}

function applySpotVisibility(){
  TPE_SPOTS.forEach(sp=>{
    const mk = spotMarkers.get(sp.id);
    const show = categoryAllowed(sp.category) && matchesSearch(sp.name);
    if (show){
      if (!spotLayer.hasLayer(mk)) spotLayer.addLayer(mk);
    } else {
      if (spotLayer.hasLayer(mk)) spotLayer.removeLayer(mk);
    }
  });
}
applySpotVisibility();

// --- Search ---
const searchEl = document.getElementById("search");
searchEl.addEventListener("input", (e)=>{
  searchTerm = e.target.value.trim();
  applySpotVisibility();

  // Also dim/hide stations when searching
  TPE_STATIONS.forEach(st=>{
    const mk = stationMarkers.get(st.id);
    const show = matchesSearch(st.name);
    mk.setStyle({ fillOpacity: show ? 1 : 0.15, opacity: show ? 1 : 0.2 });
  });

  // If user types an exact station name-ish, auto-pan to best match
  if (searchTerm.length >= 3){
    const bestStation = TPE_STATIONS.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const bestSpot = TPE_SPOTS.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (bestSpot){
      map.setView([bestSpot.lat, bestSpot.lng], 15);
      spotMarkers.get(bestSpot.id).openPopup();
    } else if (bestStation){
      map.setView([bestStation.lat, bestStation.lng], 15);
      stationMarkers.get(bestStation.id).openPopup();
    }
  }

  refreshPanelList();
});

// --- Nearby radius ---
const nearRadiusEl = document.getElementById("nearRadius");
nearRadiusEl.addEventListener("change", ()=>{
  if (selectedStation) {
    drawNearbyCircle();
    refreshPanelList();
  }
});

function getRadius(){
  return parseInt(nearRadiusEl.value, 10) || 1200;
}

// --- Side panel ---
const sidepanel = document.getElementById("sidepanel");
const panelTitle = document.getElementById("panelTitle");
const panelSub = document.getElementById("panelSub");
const listEl = document.getElementById("list");
document.getElementById("closePanel").onclick = ()=> sidepanel.classList.remove("open");

function openPanel(){
  sidepanel.classList.add("open");
}

// --- Station selection ---
function selectStation(stationId){
  selectedStation = TPE_STATIONS.find(s => s.id === stationId) || null;
  if (!selectedStation) return;

  // Highlight selected station
  stationMarkers.forEach((mk, id)=>{
    mk.setStyle({
      radius: id === stationId ? 9 : 6,
      fillColor: id === stationId ? "#ffef9a" : "#fff"
    });
  });

  map.setView([selectedStation.lat, selectedStation.lng], 15);
  drawNearbyCircle();
  refreshPanelList();
  openPanel();
}

function drawNearbyCircle(){
  if (selectedCircle) map.removeLayer(selectedCircle);
  if (!selectedStation) return;
  selectedCircle = L.circle([selectedStation.lat, selectedStation.lng], {
    radius: getRadius(),
    color: "#3bd671",
    weight: 2,
    fillOpacity: 0.08
  }).addTo(map);
}

// --- Build list of nearby spots ---
function refreshPanelList(){
  if (!selectedStation){
    panelTitle.textContent = "No station selected";
    panelSub.textContent = "Tip: click a station marker.";
    listEl.innerHTML = "";
    return;
  }

  panelTitle.textContent = selectedStation.name;
  panelSub.textContent = `Showing spots within ${getRadius()}m (filtered).`;

  const radius = getRadius();

  const nearby = TPE_SPOTS
    .filter(sp => categoryAllowed(sp.category) && matchesSearch(sp.name))
    .map(sp => {
      const d = haversineMeters(selectedStation.lat, selectedStation.lng, sp.lat, sp.lng);
      return { ...sp, dist: d };
    })
    .filter(sp => sp.dist <= radius)
    .sort((a,b)=> a.dist - b.dist);

  if (nearby.length === 0){
    listEl.innerHTML = `<div class="item"><div class="name">No matches nearby.</div><div class="meta">Try a bigger radius or toggle categories.</div></div>`;
    return;
  }

  listEl.innerHTML = "";
  nearby.forEach(sp=>{
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="name">${escapeHtml(sp.name)}</div>
      <div class="meta">${escapeHtml(sp.category)} • ${(sp.dist/1000).toFixed(2)} km</div>
      <div class="actions">
        <a class="btn" href="#" data-spot="${sp.id}">View on map</a>
        <a class="btn" target="_blank" rel="noopener" href="${googleDirectionsLink(sp.lat, sp.lng)}">Directions</a>
      </div>
    `;
    listEl.appendChild(div);
  });

  // bind view on map clicks
  listEl.querySelectorAll('a[data-spot]').forEach(a=>{
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      const id = a.getAttribute("data-spot");
      const sp = TPE_SPOTS.find(s=>s.id===id);
      if (!sp) return;
      map.setView([sp.lat, sp.lng], 16);
      const mk = spotMarkers.get(id);
      if (mk) mk.openPopup();
    });
  });
}

// --- Reset ---
document.getElementById("resetBtn").onclick = ()=>{
  searchEl.value = "";
  searchTerm = "";
  activeCategories.clear();
  renderFilters();

  // reset station styles
  stationMarkers.forEach(mk=>{
    mk.setStyle({ radius:6, fillColor:"#fff", fillOpacity:1, opacity:1 });
  });

  // show all spots
  applySpotVisibility();

  selectedStation = null;
  if (selectedCircle) map.removeLayer(selectedCircle);
  selectedCircle = null;

  sidepanel.classList.remove("open");
  refreshPanelList();
  map.setView([25.033, 121.565], 12);
};
