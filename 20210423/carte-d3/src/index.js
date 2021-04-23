import {
  geoOrthographic,
  geoPath,
  select,
  timer,
  geoAlbers,
  geoConicConformal,
} from 'd3'

//import collection from './data.json'
import collection from './data2.json'

const WIDTH = 550
const HEIGHT = 550

const svg = select('#map').append('svg')
  .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

const paths = svg.selectAll('path')
  .data(collection.features)
  .enter()
  .append('path')
/*
paths.on('mouseover', e => {
  select(e.target).attr('fill', 'red')
})

paths.on('mouseout', e => {
  select(e.target).attr('fill', 'black')
})
*/

const tick = () => {
 
  const projection = geoConicConformal()
    .center([2.45,46.27])
    .scale(1000)
    .translate([WIDTH/2,HEIGHT /2]);

  const pathCreator = geoPath().projection(projection)
  paths.attr('d', pathCreator)
}

timer(tick)