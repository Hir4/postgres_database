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

module.exports = function (search) {
  const querySelectSearchProduct = `
  SELECT 
	  * 
  FROM 
	  public.products 
  WHERE 
	  ((LOWER (product_name)
	  LIKE 
		  LOWER('%${search}%'))
  OR
	  (LOWER (label)
	  LIKE 
		  LOWER('${search}')))
  AND
	  delete_date::timestamp is  null;`;

  return pool // CONNECTING TO THE DATABASE
    .query(querySelectSearchProduct) // SEND THE QUERY TO THE DATABASE
    .then(res =>{
      return(res.rows)
    })
    .catch(e => console.log(e))
};