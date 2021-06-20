import bb, { bar, line, pie, bubble} from 'billboard.js';

import data from './JeuxBaston.json';
import data2 from './JeuxMoba.json';

import data3 from './TotParAnne.json'





const DATA = [
  { nom: 'Lausanne', population: 138905 },
  { nom: 'Yverdon', population: 30143 },
  { nom: 'Montreux', population: 26574 },
  { nom: 'Renens', population: 21036 },
  { nom: 'Nyon', population: 20533 },
  { nom: 'Vevey', population: 19827 },
]


let noms = data.map(d => d.nom);
let nbr = data.map(d => d.totGain);

let noms2 = data2.map(d => d.nom);
console.log(noms2);
let nbr2 = data2.map(d => d.totGain);
console.log(nbr2);


/*
bb.generate({
  data: {
    json: {
      popp : nbr
    },
    type: bar(),
  },
  bindto: '#graph'
})*/

  bb.generate({
    data: {
      columns: [
        [noms[0],nbr[0]],
        [noms[1],nbr[1]],
        [noms[2],nbr[2]],
        [noms[3],nbr[3]],
      ],
      type: pie()
    },
    bindto: '#graph',
  });

  bb.generate({
    data: {
      columns: [
        [noms2[0],nbr2[0]],
        [noms2[1],nbr2[1]],
        [noms2[2],nbr2[2]],
        [noms2[3],nbr2[3]],
      ],
      type: pie()
    },
    bindto: '#graph2',
  });
        




/*
bb.generate({
  data: {
    json: {

      gain: DATA2.map(({totGain}) => totGain),
    },
    type: bar(),
  },
  bindto: '#graph'
})
*/