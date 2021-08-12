var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();

const {Client} = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const client = new Client({
  user: "postgres",
  password: "*Hideki2021",
  host: "localhost",
  port: 5432,
  database: "postgres"
});

///////////////////////////////////////////////////////
// GET METHOD TO FIND THE USER AND COMPARE WITH THE LOG IN
//////////////////////////////////////////////////////

app.post('/login', jsonParser, async function(req, res) {
  let email = req.body.email;
  let password = req.body.password;

  let querySelect = `
  SELECT 
	  email, 
    password
  FROM 
	  public.clients 
  WHERE 
	  email = $1  
	  AND password = $2;`;

  console.log(querySelect);

  let querySelectUser = [`${email}`, `${password}`]
  
  console.log(querySelectUser);

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => console.log("Connected"))
    .then(() => client.query(querySelect, querySelectUser))
    .then(function LoginConfirmation(results){
      if(results.rowCount = 1){
        res.send("Connected");
      } else {
        res.send("Login not found");
      };
      console.log(results.rows);
    }) 
      // console.table(results.rows))
    .catch(e => console.log(e))
    .finally(() => client.end())
});

app.listen(8080);
