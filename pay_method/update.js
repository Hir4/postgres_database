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

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryUpdatePayment, queryUpdatePaymentValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PAYMENT WAS UPDATED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};