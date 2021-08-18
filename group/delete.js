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

module.exports = function(update_date, delete_date, group_id){
  const queryDeleteProductGroup = `
  UPDATE public.product_group
  SET
    update_date = $1,
    delete_date = $2
  WHERE 
    id = $3
  AND 
  NOT EXISTS (SELECT 1 FROM public.products WHERE group_id = $4 AND delete_date::timestamp is  null);
  `;
    
  const queryDeleteProductGroupValue = [`${update_date}`, `${delete_date}`, `${group_id}`, `${group_id}`];

  return client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryDeleteProductGroup, queryDeleteProductGroupValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT'S GROUP WAS DELETED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
};