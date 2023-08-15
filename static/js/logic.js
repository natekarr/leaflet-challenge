// URL to the GeoJSON data
const geoJSONUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a Leaflet map centered on a specific location
const map = L.map('map').setView([0, 0], 2);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to determine marker size based on earthquake magnitude
function getMarkerSize(magnitude) {
    return Math.sqrt(magnitude) * 5;
}

// Function to determine marker color based on earthquake depth
function getMarkerColor(depth) {
    const colors = ['#00FF00', '#32CD32', '#FFFF00', '#FFA500', '#FF4500', '#FF0000'];
    const breakpoints = [-10, 10, 30, 50, 70, 90];
    
    let colorIndex = 0;
    for (let i = 0; i < breakpoints.length; i++) {
      if (depth <= breakpoints[i]) {
        colorIndex = i;
        break;
      }
    }
    
    return colors[colorIndex];
  }

// Fetch GeoJSON data
fetch(geoJSONUrl)
  .then(response => response.json())
  .then(data => {
    // Create markers for each earthquake
    L.geoJSON(data.features, {
      pointToLayer: (feature, latlng) => {
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        const markerSize = getMarkerSize(magnitude);
        const markerColor = getMarkerColor(depth);

        // Create a circle marker
        return L.circleMarker(latlng, {
          radius: markerSize,
          fillColor: markerColor,
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).bindPopup(`<strong>Location:</strong> ${feature.properties.place}<br><strong>Magnitude:</strong> ${magnitude}<br><strong>Depth:</strong> ${depth}`);
      }
    }).addTo(map);

    // Create a legend
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<h4>Depth</h4>'; // Title
        const depths = [-10, 10, 30, 50, 70, 90];
        const labels = [];
      
        for (let i = 0; i < depths.length; i++) {
          const colorSquare = `<span class="color-square" style="background: ${getMarkerColor((depths[i] + depths[i - 1]) / 2)};"></span>`;
          labels.push(
            colorSquare +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+'));
        }
      
        div.innerHTML += labels.join('<br>');
        return div;
      };

    legend.addTo(map);
  })
  .catch(error => console.error("Error fetching data:", error));