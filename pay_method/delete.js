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

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryDeletePayment, queryDeletePaymentValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT WAS DELETE
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};