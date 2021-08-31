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

module.exports = function (sale_header_id, client_id, update_date, confirmation) {
  const queryUpdateSale = `
   UPDATE public.sale_header
  SET
    confirmation = $1,
    update_date = $2
  WHERE 
    id = $3
  AND
    client_id = $4
  AND 
    delete_date::timestamp is  null
  `;

  const queryUpdateSaleValue = [`${confirmation}`, `${update_date}`, `${sale_header_id}`, `${client_id}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryUpdateSale, queryUpdateSaleValue) // SEND THE QUERY TO THE DATABASE
    .then(function UpdateSale(results){ 
        if(results.rowCount === 1){ // CHECK IF THE NEW SALE WAS SIGNED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
};