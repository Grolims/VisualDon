télécharger les données http://www.uvek-gis.admin.ch/BFE/ogd/52/Solarenergiepotenziale_Gemeinden_Daecher_und_Fassaden.json

Créer un script pour filtrer les données 
par exemple ici sélectionner toute les villes du canton du jura et leur potentiel solaire pour la toitureN

`const jura = d => d.Canton === 'Jura';`

`const resultat = data`

 `.filter(jura)`

 `.map(d => ({ nom: d.MunicipalityName, potentielToit: d.Scenario2_RoofsOnly_PotentialSolarHeat_GWh }))`

 et sauver le résultat dans un fichier json : data.json





