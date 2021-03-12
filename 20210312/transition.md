Comment fonctionnent les transitions en D3 et en svelte? 

D3: lorsque qu'un événement change par exemple l'ors d'un click on peut lancer la transition de notre svg avec la fonction .transition() et ensuite spécifier la durée de celle-ci avec .duration() et le nouvelle emplacement ou vas se trouver notre svg avec .attr()

Svelte: avec svelte on utilise un peu le même système que dans d3 dès qu'un évènement change on modifie la valeur d'un variable "key" par exemple qui contrairement à D3 est réactive. et pour chaque données on passe notre clé et un incrément à un composant  par exemple "Baton" qui est un rectangle avec un libellé. Pour faire la transition on utilise une méthode de svellte : tweened() qui s'applique sur chaque bâtons.

