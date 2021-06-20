import {
  axisLeft,
  select,
  scaleLinear,
  scaleTime,
  max,
  scaleOrdinal,
  scaleSequential,
  axisRight,
  axisBottom,
} from 'd3'

import d3color, { schemePastel1, schemeSet1,interpolateViridis } from 'd3-scale-chromatic';

import slider2 from "d3-simple-slider"
import DATA from "./JeuxParAnne.json"
import DATA2 from "./TotParAnne.json"



//donne de depart à 1998
const donneStart = DATA["1998"];
const colors = schemePastel1
// mise en place graphe

const WIDTH = 1000
const HEIGHT = 500
const MARGIN = 5
const MARGIN_LEFT = 50
const MARGIN_BOTTOM = 50
const BAR_WIDTH = (WIDTH - MARGIN_LEFT) / 5


  const svg = select("#chart")
  .append('svg')
  .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

  ///


const yScale = scaleLinear()
  .domain([0, max(donneStart, d => d.Earnings)])
  .range([HEIGHT - MARGIN_BOTTOM, 0])



const g = svg.append('g')
  .attr('transform', `translate(${MARGIN_LEFT}, 0)`)

  const rect = g.selectAll('rect')
  .data(donneStart)
  .enter()
  
  .append('rect')
  .attr('x', (d, i) =>  i * BAR_WIDTH)
  .attr('width', BAR_WIDTH - MARGIN)
  .attr('y', d => yScale(d.Earnings))
  .attr('height', d => HEIGHT - MARGIN_BOTTOM - yScale(d.Earnings))
  .attr('fill', function(d,i){return colors[i]})


const text = g.selectAll('text')
  .data(donneStart)
  .enter()
  .append('text')
  .text(d => d.Name)
  .attr('x', (d, i) =>  i * BAR_WIDTH + BAR_WIDTH / 2)
  .attr('y', HEIGHT - MARGIN_BOTTOM / 2)
  .attr("font-size","10px")

  .attr('text-anchor', 'middle')

const axisY = axisLeft().scale(yScale)
  .tickFormat(d => `${d / 1000}k`)
  .ticks(10)




const axis = svg.append('g')
  .attr('transform', `translate(${MARGIN_LEFT - 3})`)
  .call(axisY)



// gestion slider
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
var textEplicatif = document.getElementById("textExplicatif")

output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
  
}

// event slider gestion move
slider.addEventListener("input", e => {
  
  const a = e.target.value;
  const donnee = DATA[a];
  console.log(a);

  // texte eplicatif pour anne X
  if (a ===  "1998")
  {
      textEplicatif.textContent = "Prémices de l’eSport moderne avec les jeux de tires à la première personne « FPS » comme Quake et création de la Cyber athlète Professional League « CPL » une association pionnière dans l’organisation de tournois de jeux vidéos et plus particulièrement sur les FPS comme Quake et Cunter Strike";
  }else if (a ===  "1999")
  {
    textEplicatif.textContent = "Sortie de Brood War, l’extension du jeu de stratégie en temps réel (RTS) de star Craft";
  } else if (a ===  "2000")
  {
    textEplicatif.textContent = "Sortie de célèbre FPS Counter Strike par l’éditeur valve qui est le jeu qui vas provoquer l’émergence de l’eSport dans le monde car il regroupe toutes les caractéristiques d’un sport traditionnel tel que le travail d’équiper la coopération, les réflexes mais surtout l’égalité des chances car il demande peux de ressources matérielles et possède un principe de jeux simple et prenant mais difficile à maitriser. "
    "Il est encore aujourd’hui le jeu multijoueur en ligne de référence ";
  } else if (a === "2001") 
  {
    textEplicatif.textContent = "Domination des FPS mais surtout de Cunter-Strike dans les différents tournois. Sortie ";
  }else if (a === "2005") 
  {
    textEplicatif.textContent = "Apparition du jeux Painkiller un FPS avec un gameplay similaire à son grand frère Quake et il fera son unique apparition dans ce classement du au choix de ce dernier par la CPL avec un tournois international dont le cahsprizes était de 510,000.00$";
  }else{
    textEplicatif.textContent = "";
  }
  

  yScale.domain([0, max(donnee, d => d.Earnings)])

  rect.data(donnee)
  .transition()
  .attr('y', d => yScale(d.Earnings))
  .attr('height', d => HEIGHT - MARGIN_BOTTOM - yScale(d.Earnings))

  text.data(donnee)
  .text(d => d.Name)

  axis
    .transition()
    .call(axisY)

 
});




////-------------------------------------------- second graph ---------------------

const BAR_WIDTH2 = (WIDTH - MARGIN_LEFT) / 24

const svg2 = select("#chart2")
.append('svg')
.attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

///


const yScale2 = scaleLinear()
.domain([0, max(DATA2, d => d.Earnings)])
.range([HEIGHT - MARGIN_BOTTOM, 0])


const g2 = svg2.append('g')
.attr('transform', `translate(${MARGIN_LEFT}, 0)`)


const rect2 = g2.selectAll('rect')
.data(DATA2)
.enter()
.append('rect')
.attr('x', (d, i) =>  i * BAR_WIDTH2)
.attr('width', BAR_WIDTH2 - MARGIN)
.attr('y', d => yScale2(d.Earnings))
.attr('height', d => HEIGHT - MARGIN_BOTTOM - yScale2(d.Earnings))
.attr('fill', function(d,i){return colors[i]})


const text2 = g2.selectAll('text')
.data(DATA2)
.enter()
.append('text')
.text(d => d.Annee)
.attr('x', (d, i) =>  i * BAR_WIDTH2 + BAR_WIDTH2 / 2)
.attr('y', HEIGHT - MARGIN_BOTTOM / 2)
.attr("font-size","10px")

.attr('text-anchor', 'middle')

const axisY2 = axisLeft().scale(yScale2)
.tickFormat(d => `${d / 1000}k`)
.ticks(5)

const axis2 = svg2.append('g')
.attr('transform', `translate(${MARGIN_LEFT - 3})`)
.call(axisY2)

//graph(DATA2004);
/*graph(DATA200);
graph(DATA1998);*/


