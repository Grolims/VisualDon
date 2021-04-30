const fs = require('fs')
const d3 = require('d3')

const file = fs.readFileSync('GeneralEsportData.csv', 'utf-8')

const { parse } = d3.dsvFormat(';')



const data =(
  parse(file)

    .map(d => ({
      num:d.TotalEarnings.split(",").map(Number),
      jeux: d.Game,
      tournois:d.TotalEarnings.split(",").map(Number)[3]
    }))
)

fs.writeFileSync("tournois.json",JSON.stringify(data,null,2), "utf-8")