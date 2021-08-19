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

module.exports = function(update_date, delete_date, user_id){
  const queryDeleteUser = `
  UPDATE public.clients
  SET
    update_date = $1,
    delete_date = $2
  WHERE 
    id = $3
  `;
    
  const queryDeleteUserValue = [`${update_date}`, `${delete_date}`, `${user_id}`];

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryDeleteUser, queryDeleteUserValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE USER WAS DELETE
          return(1);
        } else {
          return(0);
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};