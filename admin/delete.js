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

module.exports = function(update_date, delete_date, user_id){
  const queryDeleteAdmin = `
  UPDATE public.admin
  SET
    update_date = $1,
    delete_date = $2
  WHERE 
    id = $3
  `;
    
  const queryDeleteAdminValue = [`${update_date}`, `${delete_date}`, `${user_id}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryDeleteAdmin, queryDeleteAdminValue) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE USER WAS DELETE
          return(1);
        } else {
          return(0);
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => pool.end())
};