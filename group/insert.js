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

module.exports = function(product_type, creation_date){
  const queryInsertGroup = `
  INSERT INTO public.product_group( 
    product_type, 
    creation_date)
  SELECT
    $1, $2
  WHERE NOT EXISTS (
  SELECT 1 FROM public.product_group WHERE product_type = $3
  );`;
    
  const queryInsertGroupValue = [`${product_type}`, `${creation_date}`, `${product_type}`];

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryInsertGroup, queryInsertGroupValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){
      if(results.rowCount === 1){ // CHECK IF THE NEW GROUP WAS SIGNED
        return(1)
      } else {
        return(0)
      }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};