1. Pourquoi doit-on projeter des données cartographiques?

   afin de représenter une sphère par ex la terre sur une surface plate une carte par ex

2. Qu'est ce qu'Open street map?

   Une carte du monde sous licence libre crée par tous le monde

3. Quelles fonctions D3 sont spécifiques à la cartographie?

   d3.geoPath 
   chemin.projection(projection)
   
   et différentes projections de la terre sur différents plan par exemple :
   geoOrthographic()
   

4. À quoi sert le format topojson? En quoi est-il différent du geojson?

il sert à représenter des carte, il est un extension du format GeoJson en plus compact car il fonctionne avec un regroupement de point en arc, 
il prend donc moins de place que le geojson

5. À quoi sert `turf`? Décrivez ce que font trois fonctions de cette libraire

librairies pour faire des analyses géospatial

Distance : Calcule la distance entre deux points
Desination: Prend un point et calcule l'emplacement d'un point de destination en fonction d'une distance 
Circle : Prend un point et calcule le polygone circulaire en fonction d'un rayon en degrés



