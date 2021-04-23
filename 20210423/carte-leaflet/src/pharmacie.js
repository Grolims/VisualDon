const data = require('./test.json')
const fs = require('fs')

const result = data.features
  .filter(d => d.type === 'Feature' && d.properties.amenity === 'pharmacy')
  .map(d => d)


fs.writeFileSync('pharmacies.json', JSON.stringify(result), 'utf-8')