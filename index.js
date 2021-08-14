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

  const queryInsertClient = `
  INSERT INTO public.clients( 
    email, 
    password, 
    first_name, 
    last_name, 
    document, 
    address, 
    city, 
    state, 
    zip_code, 
    phone_ddd, 
    phone_number, 
    creation_date)
  SELECT
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
  WHERE NOT EXISTS (
  SELECT 1 FROM public.clients WHERE email = $13
  );`;
    
  bcrypt.hash(password, saltRounds, function cryptoPassword(err, hash) { // CRYPTOGRAPHY THE PASSWORD
    const queryInsertClientValue = [`${email}`, `${hash}`, `${first_name}`, `${last_name}`, `${document}`, `${address}`, `${city}`, `${state}`, `${zip_code}`, `${phone_ddd}`, `${phone_number}`, `${creation_date}`, `${email}`];

    client.connect() // CONNECTING TO THE DATABASE
      .then(() => client.query(queryInsertClient, queryInsertClientValue)) // SEND THE QUERY TO THE DATABASE
      .then(function SignInUser(results){ 
        if(results.rowCount === 1){ // CHECK IF THE NEW USER WAS SIGNED
          res.send("User signed with success")
        } else {
          res.send("User already signed")
        }
      }) 
      .catch(e => console.log(e))
      .finally(() => client.end())

  });
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE USER
//////////////////////////////////////////////////////////

app.post('/userupdate', jsonParser, function(req, res) {
  const user_id = req.body.user_id; 
  const address = req.body.address;
  const update_date = req.body.update_date;

  const queryUpdateUser = `
  UPDATE public.clients
  SET
    address = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdateUserValue = [`${address}`, `${update_date}`, `${user_id}`];

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryUpdateUser, queryUpdateUserValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE USER WAS UPDATED
          res.send("User updated with success")
        } else {
          res.send("User update failed")
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});



///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PRODUCT'S GROUP 
//////////////////////////////////////////////////////////

app.post('/productgroup', jsonParser, function(req, res) {
  const product_type = req.body.product_type;
  const creation_date = req.body.creation_date;

  const queryInsertGroup = `
  INSERT INTO public.product_group( 
    product_type, 
    creation_date)
  SELECT
    $1, $2
  WHERE NOT EXISTS (
  SELECT 1 FROM public.product_group WHERE product_type = $3
  );`;
    
  const queryInsertGroupValue = [`${product_type}`, `${creation_date}`, `${product_type}`];

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryInsertGroup, queryInsertGroupValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){
      if(results.rowCount === 1){ // CHECK IF THE NEW GROUP WAS SIGNED
        res.send("Group signed with success")
      } else {
        res.send("Group already signed")
      }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT'S GROUP
//////////////////////////////////////////////////////////

app.post('/productgroupupdate', jsonParser, function(req, res) {
  const group_id = req.body.group_id; 
  const product_type = req.body.product_type;
  const update_date = req.body.update_date;

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

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryUpdateProductGroup, queryUpdateProductGroupValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT'S GROUP WAS UPDATED
          res.send("Product's group updated with success")
        } else {
          res.send("Product's group update failed")
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PRODUCT'S GROUP
//////////////////////////////////////////////////////////

app.post('/productgroupdelete', jsonParser, function(req, res) {
  const group_id = req.body.group_id; 
  const delete_date = req.body.delete_date;
  const update_date = req.body.update_date;

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

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryDeleteProductGroup, queryDeleteProductGroupValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT'S GROUP WAS DELETED
          res.send("Product's group deleted with success")
        } else {
          res.send("Product's group delete failed")
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
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

  const queryInsertProduct = `
  INSERT INTO public.products( 
    group_id, 
    label,
    product_name,
    product_quantity,
    product_price,
    creation_date)
  SELECT
    $1, $2, $3, $4, $5, $6
  WHERE EXISTS (
  SELECT 1 FROM public.product_group WHERE id = $7
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.products WHERE product_name = $8
  );`;
    
  const queryInsertProductValue = [`${group_id}`, `${label}`, `${product_name}`, `${product_quantity}`, `${product_price}`, `${creation_date}`, `${group_id}`, `${product_name}`];

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryInsertProduct, queryInsertProductValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        if(results.rowCount === 1){ // CHECK IF THE NEW PRODUCT WAS SIGNED
          res.send("Product signed with success")
        } else {
          res.send("Product already signed")
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productupdate', jsonParser, function(req, res) {
  const product_id = req.body.product_id; 
  const group_id = req.body.group_id; // THE ROW YOU WANT TO CHANGE
  const update_date = req.body.update_date;

  const queryUpdateProduct = `
  UPDATE public.products
  SET
    group_id = $1,
    update_date = $2
  WHERE 
    id = $3 
  AND 
    delete_date::timestamp is  null
  `;
    
  const queryUpdateProductValue = [`${group_id}`, `${update_date}`, `${product_id}`];

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryUpdateProduct, queryUpdateProductValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT WAS UPDATED
          res.send("Product updated with success")
        } else {
          res.send("Product update failed")
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productdelete', jsonParser, function(req, res) {
  const product_id = req.body.product_id; 
  const delete_date = req.body.delete_date;
  const update_date = req.body.update_date;

  const queryDeleteProduct = `
  UPDATE public.products
  SET
    update_date = $1,
    delete_date = $2
  WHERE 
    id = $3
  `;
    
  const queryDeleteProductValue = [`${update_date}`, `${delete_date}`, `${product_id}`];

  client.connect() // CONNECTING TO THE DATABASE
    .then(() => client.query(queryDeleteProduct, queryDeleteProductValue)) // SEND THE QUERY TO THE DATABASE
    .then(function SignInUser(results){ 
        console.log(results);
        if(results.rowCount === 1){ // CHECK IF THE PRODUCT WAS DELETE
          res.send("Product deleted with success")
        } else {
          res.send("Product delete failed")
        }
    }) 
    .catch(e => console.log(e))
    .finally(() => client.end())
});

app.listen(8080);
