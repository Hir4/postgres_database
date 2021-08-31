require('dotenv').config()

var express = require('express');
var app = express();
const cookieParser = require('cookie-parser');


app.use(cookieParser());


const {Pool} = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = function(address, update_date, user_id){
  const queryUpdateAdmin = `
  UPDATE public.admin
  SET
    address = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdateAdminValue = [`${address}`, `${update_date}`, `${user_id}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryUpdateAdmin, queryUpdateAdminValue) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE USER WAS UPDATED
          return(1);
        } else {
          return(0);
        }
    }) 
    .catch(e => console.log(e))
}
  
  