// Global variables
let map = null;
let activeLayer = null;
let sidebarOpen = true;

// Configuration
const config = {
  geoServerUrl: 'http://localhost:8080/geoserver/SIP_DesaRepaking',
  mapCenter: [-7.229837, 110.626618],
  mapZoom: 15,
  layers: {
    batasdesa: {
      title: 'Batas Desa',
      layerName: 'SIP_DesaRepaking:batasdesa',
      description: 'Batas administratif wilayah desa',
      icon: 'fas fa-border-all',
    },
    bidangdesa: {
      title: 'Bidang Tanah',
      layerName: 'SIP_DesaRepaking:bidangdesa',
      description: 'Informasi kepemilikan tanah',
      icon: 'fas fa-home',
    },
    jalandesa: {
      title: 'Jalan Desa',
      layerName: 'SIP_DesaRepaking:jalandesa',
      description: 'Jaringan infrastruktur jalan',
      icon: 'fas fa-road',
    },
    pldesa: {
      title: 'Penggunaan Lahan',
      layerName: 'SIP_DesaRepaking:pldesa',
      description: 'Klasifikasi pemanfaatan lahan',
      icon: 'fas fa-seedling',
    },
    sungaidesa: {
      title: 'Sungai Desa',
      layerName: 'SIP_DesaRepaking:sungaidesa',
      description: 'Sistem hidrologi desa',
      icon: 'fas fa-water',
    },
  },
};

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
  initializeEventListeners();
  animateStatistics();
});

function initializeEventListeners() {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Layer selection
  document
    .getElementById('layerForm')
    .addEventListener('change', handleLayerChange);

  // Layer options styling
  document.querySelectorAll('.layer-option').forEach((option) => {
    option.addEventListener('click', function () {
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
      handleLayerChange({ target: radio });
    });
  });
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const loginBtn = document.querySelector('.btn-login');
  const loading = document.getElementById('loginLoading');

  if (!username || !password) {
    alert('Mohon lengkapi username dan password!');
    return;
  }

  loginBtn.disabled = true;
  loading.style.display = 'inline-block';

  // Simulate login
  setTimeout(() => {
    loginBtn.disabled = false;
    loading.style.display = 'none';
    showMapInterface();
  }, 1500);
}

function showMapInterface() {
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('mainLayout').classList.remove('hidden');
  document.getElementById('statusBar').style.display = 'flex';

  // Initialize map after interface is shown
  setTimeout(() => {
    initializeMap();
  }, 100);
}

function initializeMap() {
  if (map) return;

  // Create map
  map = L.map('map').setView(config.mapCenter, config.mapZoom);

  // Add base layer
  L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  }).addTo(map);

  // Map events
  map.on('click', handleMapClick);
  map.on('mousemove', updateMouseCoordinates);

  // Load default layer
  loadLayer('batasdesa');
  document.getElementById('layer-batasdesa').checked = true;
  updateLayerSelection('batasdesa');
}

function handleLayerChange(e) {
  if (e.target.name === 'layer') {
    loadLayer(e.target.value);
    updateLayerSelection(e.target.value);
  }
}

function loadLayer(layerKey) {
  const layerInfo = config.layers[layerKey];
  if (!layerInfo) return;

  // Remove existing layer
  if (activeLayer) {
    map.removeLayer(activeLayer);
  }

  // Add new WMS layer
  activeLayer = L.tileLayer
    .wms(config.geoServerUrl + '/wms', {
      layers: layerInfo.layerName,
      format: 'image/png',
      transparent: true,
      attribution: 'SINTARA.id',
    })
    .addTo(map);

  // Update legend
  updateLegend(layerInfo.layerName);

  // Update status
  document.getElementById('currentLayer').textContent = layerInfo.title;

  // Load WFS for interaction
  loadWFSLayer(layerInfo);
}

function loadWFSLayer(layerInfo) {
  const wfsUrl = `${config.geoServerUrl}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerInfo.layerName}&outputFormat=application/json`;

  fetch(wfsUrl)
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        style: {
          color: '#0f4c75',
          weight: 2,
          fillOpacity: 0.1,
          opacity: 0.7,
        },
        onEachFeature: function (feature, layer) {
          layer.on('click', function () {
            showFeatureInfo(feature.properties, layerInfo.title);
          });
        },
      }).addTo(map);
    })
    .catch((error) => {
      console.warn('WFS data tidak dapat dimuat:', error);
    });
}

function handleMapClick(e) {
  if (!activeLayer) return;

  const layerName = activeLayer.wmsParams.layers;
  const point = map.latLngToContainerPoint(e.latlng);
  const size = map.getSize();
  const bounds = map.getBounds();
  const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

  $.ajax({
    url: config.geoServerUrl + '/wms',
    data: {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetFeatureInfo',
      layers: layerName,
      query_layers: layerName,
      info_format: 'application/json',
      feature_count: 5,
      srs: 'EPSG:4326',
      bbox: bbox,
      width: size.x,
      height: size.y,
      x: Math.round(point.x),
      y: Math.round(point.y),
    },
    success: function (result) {
      if (result && result.features && result.features.length > 0) {
        const layerInfo = Object.values(config.layers).find(
          (l) => l.layerName === layerName
        );
        showFeatureInfo(
          result.features[0].properties,
          layerInfo?.title || 'Layer'
        );
      } else {
        hideFeatureInfo();
      }
    },
    error: function () {
      console.error('Gagal mengambil informasi fitur');
    },
  });
}

function showFeatureInfo(properties, layerTitle) {
  const panel = document.getElementById('infoPanel');
  const content = document.getElementById('infoPanelContent');

  let html = `<table class="info-table">`;
  for (const [key, value] of Object.entries(properties)) {
    html += `
      <tr>
        <th>${key}</th>
        <td>${value || '-'}</td>
      </tr>
    `;
  }
  html += `</table>`;

  content.innerHTML = html;
  panel.classList.add('active');
}

function hideFeatureInfo() {
  document.getElementById('infoPanel').classList.remove('active');
}

function updateLegend(layerName) {
  const legendUrl = `${config.geoServerUrl}/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${layerName}`;
  document.getElementById(
    'legendContent'
  ).innerHTML = `<img src="${legendUrl}" alt="Legend" onerror="this.style.display='none'">`;
}

function updateLayerSelection(layerKey) {
  document.querySelectorAll('.layer-option').forEach((option) => {
    option.classList.remove('active');
  });

  const selectedOption = document
    .querySelector(`#layer-${layerKey}`)
    .closest('.layer-option');
  selectedOption.classList.add('active');
}

function updateMouseCoordinates(e) {
  const coords = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
  document.getElementById('mouseCoords').textContent = coords;
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebarOpen = !sidebarOpen;

  if (sidebarOpen) {
    sidebar.classList.remove('active');
  } else {
    sidebar.classList.add('active');
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function resetMapView() {
  if (map) {
    map.setView(config.mapCenter, config.mapZoom);
  }
}

function showLoginModal() {
  // Implementation for login modal
  console.log('Show login modal');
}

function scrollToFooter() {
  document.getElementById('footer').scrollIntoView({
    behavior: 'smooth',
  });
}

function animateStatistics() {
  // Animate counter numbers
  const stats = [
    { id: 'statBidang', target: 1245, suffix: '' },
    { id: 'statLuas', target: 850, suffix: '' },
    { id: 'statKepala', target: 3678, suffix: '' },
  ];

  stats.forEach((stat) => {
    animateCounter(stat.id, stat.target, stat.suffix);
  });
}

function animateCounter(elementId, target, suffix) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 50);
}
