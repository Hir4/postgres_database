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

module.exports = function(method_type, update_date, method_id){
  const queryUpdatePayment = `
  UPDATE public.pay_method
  SET
    method_type = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdatePaymentValue = [`${method_type}`, `${update_date}`, `${method_id}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryUpdatePayment, queryUpdatePaymentValue) // SEND THE QUERY TO THE DATABASE
    .then(function UpdatePayment(results){ 
        if(results.rowCount === 1){ // CHECK IF THE PAYMENT WAS UPDATED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
};