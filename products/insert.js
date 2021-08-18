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

module.exports = function(group_id, label, product_name, product_quantity, product_price, creation_date, group_id){
  const queryInsertProduct = `
  INSERT INTO public.products( 
    group_id, 
    label,
    product_name,
    product_quantity,
    product_price,
    creation_date)
  SELECT
    $1, $2, $3, $4, $5, $6
  WHERE EXISTS (
  SELECT 1 FROM public.product_group WHERE id = $7
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.products WHERE product_name = $8
  );`;
    
  const queryInsertProductValue = [`${group_id}`, `${label}`, `${product_name}`, `${product_quantity}`, `${product_price}`, `${creation_date}`, `${group_id}`, `${product_name}`];

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryInsertProduct, queryInsertProductValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        if(results.rowCount === 1){ // CHECK IF THE NEW PRODUCT WAS SIGNED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};