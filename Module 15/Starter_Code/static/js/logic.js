//Fetching data in a GeoJson format

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function (data){
    console.log(data);
    createFeatures(data.features);
});

// Error handling for data fetching
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    // Handle error, display message to user etc.
  }
}

//Creating a function to determine the maker color by depth.
function chooseColor(depth) {
    const depthRanges = [
      { depth: 10, color: '#00ff00' }, // green
      { depth: 30, color: '#adff2f' }, // green-yellow
      { depth: 50, color: '#ffff00' }, // yellow
      { depth: 70, color: '#ffa500' }, // orange
      { depth: 90, color: '#ff0000' }, // red
    ];
  
    for (const range of depthRanges) {
      if (depth < range.depth) {
        return range.color;
      }
    }
    return '#000000'; // black
  }


// Function to determine marker size
function markerSize(magnitude) {
    return magnitude ? magnitude * 4 : 1;
  }

//Creating function to create features
function createFeatures(data) {
    const earthquakes = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
      },
      pointToLayer: function (feature, latLng) {
        const magnitude = feature.properties.mag;
        const depth = feature.geometry.coordinates[2];
        return L.circleMarker(latLng, {
          radius: markerSize(magnitude),
          fillColor: chooseColor(depth),
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.75
                });
            }
        });
        //Create map function to use our earthquakes layer
        createMap(earthquakes);
    }
    function createMap(earthquakes) {
        // Create the tile layer
        let scale = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

    //Creating the map
    let myMap = L.map('map', {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [scale, earthquakes]
    });

    //Adding legend
    let legend = L.control({position: 'bottomright'});
    legend.onAdd=function(){
        let div = L.DomUtil.create('div', 'info legend'),
        //Creating the depths set up our legend
        depths = [0, 10, 30, 50, 70, 90];
        div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";

        for (let i = 0; i < depths.length; i++){
            div.innerHTML +=
            '<i style="background:' + chooseColor(depths[i] + 1) + '"></i> ' + depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    }
    legend.addTo(myMap)
};