const cheerio = require('cheerio');
const fs = require('fs')
const XMLHttRequest = require('xmlhttprequest').XMLHttpRequest
const req = new XMLHttRequest();

const URL = "https://www.webscraper.io/test-sites/e-commerce/allinone/computers/laptops";

req.open('GET', URL, false);
req.send(null);

const $ = cheerio.load(req.responseText);


$.html;

console.log($('.caption h4').text());





//console.log($('a[title="Asus VivoBook X441NA-GA190"]'));

