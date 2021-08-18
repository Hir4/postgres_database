var express = require('express');
var app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser());


const {Client} = require('pg');

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

module.exports = function(group_id, update_date, product_id){
  const queryUpdateProduct = `
  UPDATE public.products
  SET
    group_id = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdateProductValue = [`${group_id}`, `${update_date}`, `${product_id}`];

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryUpdateProduct, queryUpdateProductValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT WAS UPDATED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};