var express = require('express');
var app = express();

const cookieParser = require('cookie-parser');

app.use(cookieParser());


const {Client} = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const client = new Client({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "postgres"
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

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryInsertPayment, queryInsertPaymentValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        if(results.rowCount === 1){ // CHECK IF THE NEW PAYMENT METHOD WAS SIGNED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};