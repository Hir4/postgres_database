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

module.exports = function () {
  const querySelectViewSale = `
    SELECT * FROM view_sale`;

  return pool // CONNECTING TO THE DATABASE
    .query(querySelectViewSale) // SEND THE QUERY TO THE DATABASE
    .then(res =>{
      return res.rows
    })
    .catch(e => console.log(e))
};