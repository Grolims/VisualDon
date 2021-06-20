//preparer les tournois 

const fs = require('fs')
const d3 = require('d3')

const file2 = fs.readFileSync('HistoricalEsportData.csv', 'utf-8')

//const { parse } = d3.dsvFormat(';')
const { parse } = d3.dsvFormat(',')



const data2 =(
  parse(file2)

    .map(d => ({
      date:d.Date.substring(5),
      jeu: d.Game,
      totaldesGains:d.Earnings,
      player:d.Players,
    }))
)


fs.writeFileSync("barrace.json",JSON.stringify(data2,null,2), "utf-8")