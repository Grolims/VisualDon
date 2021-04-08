import {
  axisLeft,
  select,
  scaleLinear,
  scaleOrdinal,
  pie,
  arc,
  max,
} from 'd3'

console.log("*");


let data = [
  { nom: "Lausanne", population: 138905 },
  { nom: "Yverdon-les-Bains", population: 30143 },
  { nom: "Montreux", population: 26574 },
  { nom: "Renens", population: 21036 },
  { nom: "Nyon", population: 20533 },
  { nom: "Vevey", population: 19827 }
];

let width = 400;
let height = 400;


let svg = select('.pie-chart')
    .attr("width", width)
    .attr("height", height);    

let radius = 200;

var g = svg.append("g")
                   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
  
let ordScale = scaleOrdinal()
    .domain(data)
    .range(['#ffd384','#94ebcd','#fbaccc','#d3e0ea','#fa7f72',"#d35400"]);


let camenbert = pie().value(function(d) { 
      return d.population; 
  });

let arcD3 = g.selectAll("arc")
         .data(camenbert(data))
         .enter();

let path = arc()
         .outerRadius(radius)
         .innerRadius(0);

arcD3.append("path")
.attr("d", path)
.attr("fill", function(d) { return ordScale(d.data.nom); });

var label = arc()
                      .outerRadius(radius)
                      .innerRadius(0);
            
        arcD3.append("text")
           .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
            })
           .text(function(d) { return d.data.nom; })
           .style("font-family", "arial")
           .style("font-size", 15);