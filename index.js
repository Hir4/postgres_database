require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();


const crypto = require('crypto');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');


app.use(cookieParser());

const {Pool} = require('pg');

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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

  pool // CONNECTING TO THE DATABASE
    .query(querySelect, querySelectUser) // SEND THE QUERY TO THE DATABASE
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
    .finally(() => pool.end())
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
    // console.log(result);
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
    // console.log(result);
  })
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productupdate', jsonParser, function(req, res) {
  const product_id = req.body.product_id; 
  const group_id = req.body.group_id; // THE ROW YOU WANT TO CHANGE
  const update_date = req.body.update_date;

  const response = require('./products/update.js')(group_id, update_date, product_id);
  
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

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PAYMENT METHOD 
//////////////////////////////////////////////////////////

app.post('/payment', jsonParser, function(req, res) {
  const method_type = req.body.method_type;
  const installments_accept = req.body.installments_accept;
  const creation_date = req.body.creation_date;

  const response = require('./pay_method/insert.js')(method_type, installments_accept, creation_date);
  response.then(function(result){
    if(result === 1){
      res.send("Payment method signed with success");
    } else {
      res.send("Payment method already signed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PAYMENT 
//////////////////////////////////////////////////////////

app.post('/paymentupdate', jsonParser, function(req, res) {
  const method_id = req.body.method_id; 
  const method_type = req.body.method_type; // THE ROW YOU WANT TO CHANGE
  const update_date = req.body.update_date;

  const response = require('./pay_method/update.js')(method_type, update_date, method_id);
  response.then(function(result){
    if(result === 1){
      res.send("Payment updated with success");
    } else {
      res.send("Payment update failed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PAYMENT 
//////////////////////////////////////////////////////////

app.post('/paymentdelete', jsonParser, function(req, res) {
  const method_id = req.body.method_id; 
  const delete_date = req.body.delete_date;
  const update_date = req.body.update_date;

  const response = require('./pay_method/delete.js')(update_date, delete_date, method_id);
  response.then(function(result){
    if(result === 1){
      res.send("Payment deleted with success");
    } else {
      res.send("Payment delete failed")
    }
    console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE SALES 
//////////////////////////////////////////////////////////

app.post('/sale', jsonParser, function(req, res) {
  const client_id = req.body.client_id;
  const total_bought = req.body.total_bought;
  const due_date = req.body.due_date;
  const shipping = req.body.shipping;
  const delivery_time = req.body.delivery_time;
  const confirmation = req.body.confirmation;
  const creation_date = req.body.creation_date;
  const pay_method = req.body.pay_method;
  const line_id = req.body.line_id;
  const product_id = req.body.product_id;
  const product_quantity = req.body.product_quantity;

  const response = require('./sale/insert.js')(client_id, total_bought, due_date, shipping, delivery_time, confirmation, creation_date, pay_method, line_id, product_id, product_quantity);
  response.then(function(result){
    // if(result === 1){
    //   res.send("Sale signed with success");
    // } else {
    //   res.send("Sale failed")
    // }
    console.log(result);
  })
});

app.listen(8080);
