import L from 'leaflet'
import arbres from './arbres.json'
import batiments from './batiments.json'
import fontaine from './fontaines.json'
import pharma from './pharmacies.json'


const map = L.map('map').setView([47.366617, 7.34524], 12)

console.log(pharma)

//map.setView(new L.LatLng(47.366617, 7.34524), 14);



L.tileLayer(
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
  }).addTo(map)

/*const icon = L.icon({
  iconUrl: 'http://heig-datavis-2021.surge.sh/carte-leaflet/images/marker-icon.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})*/

const icon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Pharmacy_Green_Cross2.png',
  iconSize: [40, 40],
  iconAnchor: [25, 50],
})

pharma.map(d => {
  const [lon, lat] = d.geometry.coordinates
  L.marker([lat, lon], { icon }).addTo(map)
})



/*
L.geoJSON(
  bar,
  {
    style: feature =>
      feature.properties['name'] === 'Centre Saint-Roch'
        ? { color: 'indianred' }
        : { color: 'steelblue' },
    onEachFeature: (feature, layer) =>
      layer.bindPopup(feature.properties.name || feature.properties['addr:street'] || feature.properties.uid)
      
  },
).addTo(map)*/