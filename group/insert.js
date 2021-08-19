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

  return pool // CONNECTING TO THE DATABASE
    .query(queryInsertGroup, queryInsertGroupValue) // SEND THE QUERY TO THE DATABASE
    .then(function InsertGroup(results){
      if(results.rowCount === 1){ // CHECK IF THE NEW GROUP WAS SIGNED
        return(1)
      } else {
        return(0)
      }
    }) 
    .catch(e => console.log(e))
    .finally(() => pool.end())
};