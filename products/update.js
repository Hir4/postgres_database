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

module.exports = function (group_id, update_date, product_id) {
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

  return pool
    .query(queryUpdateProduct, queryUpdateProductValue)
    .then(function UpdateProduct(results) {
      if (results.rowCount === 1) { // CHECK IF THE PRODUCT WAS UPDATED
        return (1)
      } else {
        return (0)
      }
    })
    .catch(err => console.error('Error executing query', err.stack))
};