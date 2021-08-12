var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();
const crypto = require('crypto');
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

///////////////////////////////////////////////////////////
// GET METHOD TO FIND THE USER AND COMPARE WITH THE LOG IN
//////////////////////////////////////////////////////////

app.post('/login', jsonParser, async function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const querySelect = `
  SELECT 
	  email, 
    password,
    delete_date
  FROM 
	  public.clients 
  WHERE 
	  email = $1  
	  AND password = $2;`;

  const querySelectUser = [`${email}`, `${password}`]

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(querySelect, querySelectUser))
    .then(function LoginConfirmation(results){
      console.log(results)
      if(results.rowCount === 1){
        if(results.rows[0].delete_date === null){
          const idToken = `${(new Date()).getTime()}:${email}`;
          const hashIdToken = crypto.createHash('sha256').update(idToken).digest('base64');
          res.cookie(`idToken`, hashIdToken, { httpOnly: true });
          res.send("Connected");
          console.log(hashIdToken);
        }
      } else {
        res.clearCookie(`idToken`);
        res.send("Login not found");
      };
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});

app.listen(8080);
