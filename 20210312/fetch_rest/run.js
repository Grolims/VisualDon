const R = require('ramda')
const fetch = require('node-fetch')

const URL_USERS = 'https://jsonplaceholder.typicode.com/users'
const URL_POSTS = 'https://jsonplaceholder.typicode.com/posts'



async function getData(url)
{
    let response = await fetch(url);
    let data = response.json();
    return data;
}


async function main()
{
    let usersData = await getData(URL_USERS);
    let postSData = await getData (URL_POSTS);

   usersData.forEach(element => {
        console.log(R.path(['username',],element));
        console.log(R.path(['address','city'],element));
        console.log(R.path(['company','name'],element));
       
        console.log(getTitre(element,postSData)); 
    });

    /*postSData.forEach(element => {
        console.log(R.path(['title'],element));
        
    });*/

  function getTitre (user,posts)
  {
    let tab = []
    let id = R.path(['id'],user);

   
   posts.find((post) => {
       if(R.path(["userId"],post) == id)
       {tab.push(R.path(["title"],post)) 
    }
  
   })

   return tab;
  }


     
}



main();
