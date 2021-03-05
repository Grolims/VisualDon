import {
  axisLeft,
  select,
  scaleLinear,
  max,
} from 'd3'

import DATA from './data2';

console.log(DATA);

//const DATA = require('./data2.json')

/*const DATA = [
  { nom: 'Mettembert', potentielToit: 0.4 },
  { nom: 'Beurnev├®sin', potentielToit: 0.56 },
  { nom: 'La Chaux-des-Breuleux', potentielToit: 0.63 },
]*/



const WIDTH = 800
const HEIGHT = 500
const MARGIN = 5
const MARGIN_LEFT = 30
const MARGIN_BOTTOM = 60
const BAR_WIDTH = (WIDTH - MARGIN_LEFT) / DATA.length

const svg = select('body')
  .append('svg')
  .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

const yScale = scaleLinear()
  .domain([0, max(DATA, d => d.potentielToit)])
  .range([HEIGHT - MARGIN_BOTTOM, 0])


const g = svg.append('g')
  .attr('transform', `translate(${MARGIN_LEFT}, 0)`)

g.selectAll('rect')
  .data(DATA)
  .enter()
  .append('rect')
  .attr('x', (d, i) =>  i * BAR_WIDTH)
  .attr('width', BAR_WIDTH - MARGIN)
  .attr('y', d => yScale(d.potentielToit))
  .attr('height', d => HEIGHT - MARGIN_BOTTOM - yScale(d.potentielToit))
  .attr('fill', 'steelblue')

g.selectAll('text')
  .data(DATA)
  .enter()
  .append('text')
  .text(d => d.nom)
  .attr('x', (d, i) =>  i * BAR_WIDTH + BAR_WIDTH / 2)
  .attr('y', HEIGHT - MARGIN_BOTTOM / 2)
  .attr("font-size","10px")
  .attr('text-anchor', 'left')
  .attr('transform', (d, i) => `rotate(90,${i * BAR_WIDTH + BAR_WIDTH },${458})`)


const axisY = axisLeft().scale(yScale)
  .tickFormat(d => `${d}`)
  .ticks(10)

svg.append('g')
  .attr('transform', `translate(${MARGIN_LEFT - 3})`)
  .call(axisY)
