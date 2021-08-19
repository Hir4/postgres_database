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

module.exports = function(product_type, update_date, group_id){
  const queryUpdateProductGroup = `
  UPDATE public.product_group
  SET
    product_type = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdateProductGroupValue = [`${product_type}`, `${update_date}`, `${group_id}`];

  return pool // CONNECTING TO THE DATABASE
    .query(queryUpdateProductGroup, queryUpdateProductGroupValue) // SEND THE QUERY TO THE DATABASE
    .then(function UpdateGroup(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT'S GROUP WAS UPDATED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => pool.end())
};