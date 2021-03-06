var cl = (el, className) => Array.from(el.querySelectorAll(className)

cl(temp1, 'div.thumbnail')
  .map(el => {
    let product = el.querySelector("a.title").textContent
    let price = el.querySelector("h4.price").textContent
    let rating = el.querySelector("div.ratings > p:not(.pull-right)").dataset.rating

    return {
      produit: product,
      prix: price,
      etoiles: rating,
    }
})
