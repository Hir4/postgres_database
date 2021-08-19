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

module.exports = function (client_id, total_bought, due_date, shipping, delivery_time, confirmation, creation_date, pay_method, line_id, product_id, product_quantity) {
  const queryInsertSale = `
  WITH sale_header AS (
    INSERT INTO public.sale_header( 
      client_id, 
      total_bought,
      due_date,
      shipping,
      delivery_time,
      confirmation,
      creation_date,
      pay_method)
    SELECT
      $1, $2, $3, $4, $5, $6, $7, $8
    WHERE $9 = public.clients.id 
      AND  public.clients.delete_date::timestamp is  null
      AND $10 = public.pay_method.id
      AND public.pay_method.delete_date::timestamp is  null
    RETURNING id_sale_header
  )
  INSERT INTO public.sale_itens(
      sale_header_id,
      line_id,
      product_id,
      product_quantity)
    SELECT
      id_sale_header, $11, $12, $13 FROM sale_header
    WHERE public.sale_itens.sale_header_id = public.sale_header.id
      AND product_id = public.products.id
      AND public.products.delete_date::timestamp is  null;`;

  const queryInsertSaleValue = [`${client_id}`, `${total_bought}`, `${due_date}`, `${shipping}`, `${delivery_time}`, `${confirmation}`, `${creation_date}`, `${pay_method}`, `${client_id}`, `${pay_method}`, `${line_id}`, `${product_id}`, `${product_quantity}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryInsertSale, queryInsertSaleValue) // SEND THE QUERY TO THE DATABASE
    .then(function SignInSale(results){ 
      console.log(results)
        // if(results.rowCount === 1){ // CHECK IF THE NEW SALE WAS SIGNED
        //   return(1)
        // } else {
        //   return(0)
        // }
    }) 
    .catch(e => console.log(e))
    .finally(() => pool.end())
};