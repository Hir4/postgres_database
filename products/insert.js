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

module.exports = function (group_id, label, product_name, product_quantity, product_price, creation_date) {
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

  return pool
    .query(queryInsertProduct, queryInsertProductValue)
    .then(function InsertProduct(results) {
      console.log(results);
      if (results.rowCount === 1) { // CHECK IF THE PRODUCT WAS UPDATED
        return (1)
      } else {
        return (0)
      }
    })
    .catch(err => console.error('Error executing query', err.stack))
    .finally(() => pool.end())
};