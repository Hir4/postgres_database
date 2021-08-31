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

  return pool // CONNECTING TO THE DATABASE
    .query(queryDeleteProductGroup, queryDeleteProductGroupValue) // SEND THE QUERY TO THE DATABASE
    .then(function DeleteGroup(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT'S GROUP WAS DELETED
          return(1)
        } else {
          return(0)
        }
    }) 
    .catch(e => console.log(e))
};