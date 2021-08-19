var express = require('express');
var app = express();
const cookieParser = require('cookie-parser');


app.use(cookieParser());


const {Client} = require('pg');

require('dotenv').config()

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const client = new Client({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "postgres"
});

module.exports = function(address, update_date, user_id){
  const queryUpdateUser = `
  UPDATE public.clients
  SET
    address = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdateUserValue = [`${address}`, `${update_date}`, `${user_id}`];

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryUpdateUser, queryUpdateUserValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE USER WAS UPDATED
          client.end();
          return(1);
        } else {
          client.end();
          return(0);
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
}
  
  