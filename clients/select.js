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

module.exports = function (id) {
  const querySelectClientInfo = `
    SELECT
      first_name,
      document,
      email,
      address,
      city,
      state,
      zip_code,
      phone_ddd,
      phone_number
    FROM 
      public.clients
    WHERE
      id = $1;`;

      const querySelectClientInfoValue = [`${id}`]

  return pool // CONNECTING TO THE DATABASE
    .query(querySelectClientInfo, querySelectClientInfoValue) // SEND THE QUERY TO THE DATABASE
    .then(res =>{
      return res.rows
    })
    .catch(e => console.log(e))
};