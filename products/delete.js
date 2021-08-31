require('dotenv').config()

var express = require('express');
var app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser());

const { Pool } = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = function(update_date, delete_date, product_id){
  const queryDeleteProduct = `
  UPDATE public.products
  SET
    update_date = $1,
    delete_date = $2
  WHERE 
    id = $3
  `;
    
  const queryDeleteProductValue = [`${update_date}`, `${delete_date}`, `${product_id}`];

  return pool
    .query(queryDeleteProduct, queryDeleteProductValue)
    .then(function DeleteProduct(results) {
      if (results.rowCount === 1) { // CHECK IF THE PRODUCT WAS UPDATED
        return (1)
      } else {
        return (0)
      }
    })
    .catch(err => console.error('Error executing query', err.stack))
};