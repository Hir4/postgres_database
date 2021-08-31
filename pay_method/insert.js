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

module.exports = function(method_type, installments_accept, creation_date){
  const queryInsertPayment = `
  INSERT INTO public.pay_method( 
    method_type, 
    installments_accept,
    creation_date)
  SELECT
    $1, $2, $3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.pay_method WHERE method_type = $4
  );`;
    
  const queryInsertPaymentValue = [`${method_type}`, `${installments_accept}`, `${creation_date}`, `${method_type}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryInsertPayment, queryInsertPaymentValue) // SEND THE QUERY TO THE DATABASE
    .then(function InsertPayment(results){ 
        if(results.rowCount === 1){ // CHECK IF THE NEW PAYMENT METHOD WAS SIGNED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
};