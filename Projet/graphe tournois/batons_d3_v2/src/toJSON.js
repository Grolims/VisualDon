const fs = require('fs')
const d3 = require('d3')

const file = fs.readFileSync('GeneralEsporData.csv', 'utf-8')

const { parse } = d3.dsvFormat(';')

console.log(
  parse(file)
    .map(d => ({
      jeux: d.Game,
      tournois: Number(d.TotalTournaments)
    }))
)