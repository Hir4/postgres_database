//DNAO DEVOLVER 200 QUANDO DER ERRO
//SEPARAR POR ARQUIVOS AS QUERY

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();


const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
// POST METHOD TO FIND THE USER AND COMPARE WITH THE LOG IN
//////////////////////////////////////////////////////////

app.post('/login', jsonParser, function(req, res) {
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
	  email = $1;`;

  const querySelectUser = [`${email}`]

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(querySelect, querySelectUser)) // SEND THE QUERY TO THE DATABASE
    .then(function LoginConfirmation(results){ 
      console.log(results)
      if(results.rowCount === 1){ // VERIFY IF HAS AN USER WITH THE EMAIL SENT
        if(results.rows[0].delete_date === null){ // VERIFY IF THE USER WAS DELETED
          bcrypt.compare(password, results.rows[0].password, function (err, result) { // VERIFY IF BOTH PASSWORDS MATCH
            if(result === true){
              const idToken = `${(new Date()).getTime()}:${email}`; // CREATE A TOKEN
              const hashIdToken = crypto.createHash('sha256').update(idToken).digest('base64'); // CRYPTOGRAPHY THE TOKEN
              res.cookie(`idToken`, hashIdToken, { httpOnly: true }); // CREATE A COOKIE WITH THE TOKEN
              res.send("Connected");
              console.log(hashIdToken);
            } else {
              res.clearCookie(`idToken`); // CLEAR THE COOKIE
              res.send("Login not found");
            }
          })
        }
      } else {
        res.clearCookie(`idToken`); // CLEAR THE COOKIE
        res.send("Login not found");
      };
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});


///////////////////////////////////////////////////////////
// POST METHOD TO CREATE THE USER 
//////////////////////////////////////////////////////////

app.post('/signin', jsonParser, function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const document = req.body.document;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const zip_code = req.body.zip_code;
  const phone_ddd = req.body.phone_ddd;
  const phone_number = req.body.phone_number;
  const creation_date = req.body.creation_date;

  const response = require('./clients/insert.js')(password, email, first_name, last_name, document, address, city, state, zip_code, phone_ddd, phone_number, creation_date);
  response.then(function(result){
    if(result === 1){
      res.send("User signed with success");
    } else {
      res.send("User already signed")
    }
    console.log(result);
  })
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE USER
//////////////////////////////////////////////////////////

app.post('/userupdate', jsonParser, function(req, res) {
  const user_id = req.body.user_id; 
  const address = req.body.address;
  const update_date = req.body.update_date;

  const response = require('./clients/update.js')(address, update_date, user_id);
  response.then(function(result){
    if(result === 1){
      res.send("User updated with success");
    } else {
      res.send("User update failed")
    }
    console.log(result);
  })
});


///////////////////////////////////////////////////////////
// POST METHOD TO DELETE USER 
//////////////////////////////////////////////////////////

app.post('/userdelete', jsonParser, function(req, res) {
  const user_id = req.body.user_id; 
  const delete_date = req.body.delete_date;
  const update_date = req.body.update_date;

  const response = require('./clients/delete.js')(update_date, delete_date, user_id);
  response.then(function(result){
    if(result === 1){
      res.send("User deleted with success");
    } else {
      res.send("User delete failed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PRODUCT'S GROUP 
//////////////////////////////////////////////////////////

app.post('/productgroup', jsonParser, function(req, res) {
  const product_type = req.body.product_type;
  const creation_date = req.body.creation_date;

  const response = require('./group/insert.js')(product_type, creation_date);
  response.then(function(result){
    if(result === 1){
      res.send("Group signed with success");
    } else {
      res.send("Group already signed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT'S GROUP
//////////////////////////////////////////////////////////

app.post('/productgroupupdate', jsonParser, function(req, res) {
  const group_id = req.body.group_id; 
  const product_type = req.body.product_type;
  const update_date = req.body.update_date;

  const response = require('./group/update.js')(product_type, update_date, group_id);
  response.then(function(result){
    if(result === 1){
      res.send("Product's group updated with success");
    } else {
      res.send("Product's group update failed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PRODUCT'S GROUP
//////////////////////////////////////////////////////////

app.post('/productgroupdelete', jsonParser, function(req, res) {
  const group_id = req.body.group_id; 
  const delete_date = req.body.delete_date;
  const update_date = req.body.update_date;

  const response = require('./group/delete.js')(update_date, delete_date, group_id);
  response.then(function(result){
    if(result === 1){
      res.send("Product's group deleted with success");
    } else {
      res.send("Product's group delete failed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/product', jsonParser, function(req, res) {
  const group_id = req.body.group_id;
  const label = req.body.label;
  const product_name = req.body.product_name;
  const product_quantity = req.body.product_quantity;
  const product_price = req.body.product_price;
  const creation_date = req.body.creation_date;

  const response = require('./products/insert.js')(group_id, label, product_name, product_quantity, product_price, creation_date);
  response.then(function(result){
    if(result === 1){
      res.send("Product signed with success");
    } else {
      res.send("Product already signed")
    }
    console.log(result);
  })
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productupdate', jsonParser, function(req, res) {
  const product_id = req.body.product_id; 
  const group_id = req.body.group_id; // THE ROW YOU WANT TO CHANGE
  const update_date = req.body.update_date;

  const response = require('./products/update.js')(group_id, label, update_date, product_id);
  response.then(function(result){
    if(result === 1){
      res.send("Product updated with success");
    } else {
      res.send("Product update failed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productdelete', jsonParser, function(req, res) {
  const product_id = req.body.product_id; 
  const delete_date = req.body.delete_date;
  const update_date = req.body.update_date;

  const response = require('./products/delete.js')(update_date, delete_date, product_id);
  response.then(function(result){
    if(result === 1){
      res.send("Product deleted with success");
    } else {
      res.send("Product delete failed")
    }
    console.log(result);
  })
});

app.listen(8080);
