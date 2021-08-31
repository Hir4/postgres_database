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

module.exports = function(update_date, delete_date, method_id){
  const queryDeletePayment = `
  UPDATE public.pay_method
  SET
    update_date = $1,
    delete_date = $2
  WHERE 
    id = $3
  `;
    
  const queryDeletePaymentValue = [`${update_date}`, `${delete_date}`, `${method_id}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryDeletePayment, queryDeletePaymentValue) // SEND THE QUERY TO THE DATABASE
    .then(function DeleteUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PAYMENT WAS DELETE
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
};