require('dotenv').config()

var express = require('express');
var app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser');


app.use(cookieParser());


const { Pool } = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = async function (new_password, update_date, user_id) {
  const queryUpdateUser = `
  UPDATE public.clients
  SET
    password = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;

  let bcryptPassword = await bcrypt.hash(new_password, saltRounds).then(function (hash) { // CRYPTOGRAPHY THE PASSWORD
    return [`${hash}`, `${update_date}`, `${user_id}`];
  })

  return pool // CONNECTING TO THE DATABASE
    .query(queryUpdateUser, bcryptPassword) // SEND THE QUERY TO THE DATABASE
    .then(function UpdateUser(results) {
      console.log(results);
      if (results.rowCount === 1) { // CHECK IF THE USER WAS UPDATED
        return (1);
      } else {
        return (0);
      }
    })
    .catch(e => console.log(e))
}

