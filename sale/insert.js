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
  WITH ins AS
	(INSERT INTO PUBLIC.SALE_HEADER(
		CLIENT_ID,
		TOTAL_BOUGHT,
		DUE_DATE,
		SHIPPING,
		DELIVERY_TIME,
		CONFIRMATION,
		CREATION_DATE,
		PAY_METHOD)
	 VALUES(
	 $1, $2, $3, $4, $5, $6, $7, $8)
	 RETURNING id AS id_sale_header)
	 INSERT INTO public.sale_itens(
		sale_header_id,
		line_id,
		product_id,
		product_quantity
	 )
	 SELECT id_sale_header, $9, $10, $11
	 FROM ins;`;

  const queryInsertSaleValue = [`${client_id}`, `${total_bought}`, `${due_date}`, `${shipping}`, `${delivery_time}`, `${confirmation}`, `${creation_date}`, `${pay_method}`, `${line_id}`, `${product_id}`, `${product_quantity}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryInsertSale, queryInsertSaleValue) // SEND THE QUERY TO THE DATABASE
    .then(function SignInSale(results){ 
      console.log(results)
        if(results.rowCount === 1){ // CHECK IF THE NEW SALE WAS SIGNED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => pool.end())
};