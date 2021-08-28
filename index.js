require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();
var jwt = require('jsonwebtoken');
var cors = require('cors')

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

let cookieCheckClient;
let cookieCheckAdmin;
let secretKeyJWT;
let secretKeyJWTAdmin;

app.use(cookieParser());

const { Pool } = require('pg');

const corsOptions = {
  origin: true,
  credentials: true,
}

app.use(cors(corsOptions))

///////////////////////////////////////////////////////
// CONFIG DATABASE
//////////////////////////////////////////////////////

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

///////////////////////////////////////////////////////////
// POST METHOD TO FIND THE ADM AND COMPARE WITH THE LOG IN
//////////////////////////////////////////////////////////

app.post('/loginadmin', jsonParser, function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const querySelect = `
  SELECT 
    id,
	  email, 
    password,
    delete_date
  FROM 
	  public.admin 
  WHERE 
	  email = $1
    AND 
    delete_date::timestamp is  null;`;

  const querySelectAdmin = [`${email}`]

  pool // CONNECTING TO THE DATABASE
    .query(querySelect, querySelectAdmin) // SEND THE QUERY TO THE DATABASE
    .then(function LoginConfirmation(results) {
      console.log(results)
      if (results.rowCount === 1) { // VERIFY IF HAS AN USER WITH THE EMAIL SENT
        if (results.rows[0].delete_date === null) { // VERIFY IF THE USER WAS DELETED
          bcrypt.compare(password, results.rows[0].password, function (err, result) { // VERIFY IF BOTH PASSWORDS MATCH
            if (result === true) {
              const idTokenAdmin = `${(new Date()).getTime()}:${email}:admin`; // CREATE A TOKEN
              const hashIdToken = crypto.createHash('sha256').update(idTokenAdmin).digest('base64'); // CRYPTOGRAPHY THE TOKEN
              secretKeyJWTAdmin = hashIdToken;
              jwt.sign({ class: 'admin', id: results.rows[0].id }, secretKeyJWTAdmin, { algorithm: 'HS256' }, function (err, token) {
                cookieCheckAdmin = token;
                res.cookie(`idTokenAdmin`, token, { httpOnly: true }); // CREATE A COOKIE WITH THE TOKEN
                res.send("Connected");
              })
            } else {
              res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
              res.status(500).send("Login not found");
            }
          })
        }
      } else {
        res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
        res.status(500).send("Login not found");
      };
    })
    .catch(e => console.log(e))
    .finally(() => pool.end())
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE THE ADMIN 
//////////////////////////////////////////////////////////

app.post('/signinadmin', jsonParser, function (req, res) {
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

  const response = require('./admin/insert.js')(password, email, first_name, last_name, document, address, city, state, zip_code, phone_ddd, phone_number, creation_date);
  response.then(function (result) {
    if (result === 1) {
      res.send("Admin signed with success");
    } else {
      res.status(500).send("Admin already signed")
    }
    // console.log(result);
  })
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE ADMIN
//////////////////////////////////////////////////////////

app.post('/adminupdate', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    jwt.verify(cookie, secretKeyJWTAdmin, function (err, decoded) {
      const user_id = decoded.id;
      const address = req.body.address;
      const update_date = req.body.update_date;

      const response = require('./admin/update.js')(address, update_date, user_id);
      response.then(function (result) {
        if (result === 1) {
          res.send("Admin updated with success");
        } else {
          res.status(500).send("Admin update failed")
        }
        console.log(result);
      })
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE ADMIN 
//////////////////////////////////////////////////////////

app.post('/admindelete', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    jwt.verify(cookie, secretKeyJWTAdmin, function (err, decoded) {
      const user_id = decoded.id;
      const delete_date = req.body.delete_date;
      const update_date = req.body.update_date;

      const response = require('./admin/delete.js')(update_date, delete_date, user_id);
      response.then(function (result) {
        if (result === 1) {
          res.send("Admin deleted with success");
        } else {
          res.status(500).send("Admin delete failed")
        }
        console.log(result);
      })
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO FIND THE USER AND COMPARE WITH THE LOG IN
//////////////////////////////////////////////////////////

app.post('/login', jsonParser, function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const querySelect = `
  SELECT 
    id,
	  email, 
    password,
    delete_date
  FROM 
	  public.clients 
  WHERE 
	  email = $1
  AND 
    delete_date::timestamp is  null;`;

  const querySelectUser = [`${email}`]

  pool // CONNECTING TO THE DATABASE
    .query(querySelect, querySelectUser) // SEND THE QUERY TO THE DATABASE
    .then(function LoginConfirmation(results) {
      if (results.rowCount === 1) { // VERIFY IF HAS AN USER WITH THE EMAIL SENT
        if (results.rows[0].delete_date === null) { // VERIFY IF THE USER WAS DELETED
          bcrypt.compare(password, results.rows[0].password, function (err, result) { // VERIFY IF BOTH PASSWORDS MATCH
            if (result === true) {
              const idToken = `${(new Date()).getTime()}:${email}`; // CREATE A TOKEN
              const hashIdToken = crypto.createHash('sha256').update(idToken).digest('base64'); // CRYPTOGRAPHY THE TOKEN
              secretKeyJWT = hashIdToken;
              jwt.sign({ id: results.rows[0].id }, secretKeyJWT, { algorithm: 'HS256' }, function (err, token) {
                cookieCheckClient = token
                res.cookie(`idToken`, token, { httpOnly: true }); // CREATE A COOKIE WITH THE TOKEN
                res.send(token);
              })
            } else {
              res.clearCookie(`idToken`); // CLEAR THE COOKIE
              res.status(500).send("Login not found");
            }
          })
        }
      } else {
        res.clearCookie(`idToken`); // CLEAR THE COOKIE
        res.status(500).send("Login not found");
      };
    })
});


///////////////////////////////////////////////////////////
// POST METHOD TO CREATE THE USER 
//////////////////////////////////////////////////////////

app.post('/signin', jsonParser, function (req, res) {
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
  response.then(function (result) {
    if (result === 1) {
      res.send("User signed with success");
    } else {
      res.status(500).send("User already signed")
    }
    // console.log(result);
  })
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE USER
//////////////////////////////////////////////////////////

app.post('/userupdate', jsonParser, function (req, res) {
  const cookie = req.cookies[`idToken`];
  if (cookie && cookie === cookieCheckClient) {
    jwt.verify(cookie, secretKeyJWT, function (err, decoded) {
      const user_id = decoded.id;
      const address = req.body.address;
      const update_date = req.body.update_date;

      const response = require('./clients/update.js')(address, update_date, user_id);
      response.then(function (result) {
        if (result === 1) {
          res.send("User updated with success");
        } else {
          res.status(500).send("User update failed")
        }
        console.log(result);
      })
    })
  } else {
    res.clearCookie(`idToken`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});


///////////////////////////////////////////////////////////
// POST METHOD TO DELETE USER 
//////////////////////////////////////////////////////////

app.post('/userdelete', jsonParser, function (req, res) {
  const cookie = req.cookies[`idToken`];
  if (cookie && cookie === cookieCheckClient) {
    jwt.verify(cookie, secretKeyJWT, function (err, decoded) {
      const user_id = decoded.id;
      const delete_date = req.body.delete_date;
      const update_date = req.body.update_date;

      const response = require('./clients/delete.js')(update_date, delete_date, user_id);
      response.then(function (result) {
        if (result === 1) {
          res.send("User deleted with success");
        } else {
          res.status(500).send("User delete failed")
        }
        console.log(result);
      })
    })
  } else {
    res.clearCookie(`idToken`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PRODUCT'S GROUP 
//////////////////////////////////////////////////////////

app.post('/productgroup', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const product_type = req.body.product_type;
    const creation_date = req.body.creation_date;

    const response = require('./group/insert.js')(product_type, creation_date);
    response.then(function (result) {
      if (result === 1) {
        res.send("Group signed with success");
      } else {
        res.status(500).send("Group already signed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT'S GROUP
//////////////////////////////////////////////////////////

app.post('/productgroupupdate', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const group_id = req.body.group_id;
    const product_type = req.body.product_type;
    const update_date = req.body.update_date;

    const response = require('./group/update.js')(product_type, update_date, group_id);
    response.then(function (result) {
      if (result === 1) {
        res.send("Product's group updated with success");
      } else {
        res.status(500).send("Product's group update failed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PRODUCT'S GROUP
//////////////////////////////////////////////////////////

app.post('/productgroupdelete', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const group_id = req.body.group_id;
    const delete_date = req.body.delete_date;
    const update_date = req.body.update_date;

    const response = require('./group/delete.js')(update_date, delete_date, group_id);
    response.then(function (result) {
      if (result === 1) {
        res.send("Product's group deleted with success");
      } else {
        res.status(500).send("Product's group delete failed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// GET METHOD TO GET ALL PRODUCT 
//////////////////////////////////////////////////////////

app.get('/getproducts', jsonParser, function (req, res) {
  const querySelect = `
  SELECT 
    id,
	  label, 
    product_name,
    product_price,
    product_quantity
  FROM 
	  public.products 
  WHERE 
    delete_date::timestamp is  null;`;
  pool
    .query(querySelect)
    .then(result => {
      console.log(result.rows)
      res.send(JSON.stringify(result.rows))
    })
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/product', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const group_id = req.body.group_id;
    const label = req.body.label;
    const product_name = req.body.product_name;
    const product_quantity = req.body.product_quantity;
    const product_price = req.body.product_price;
    const creation_date = req.body.creation_date;

    const response = require('./products/insert.js')(group_id, label, product_name, product_quantity, product_price, creation_date);
    response.then(function (result) {
      if (result === 1) {
        res.send("Product signed with success");
      } else {
        res.status(500).send("Product already signed")
      }
      // console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});


///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productupdate', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const product_id = req.body.product_id;
    const group_id = req.body.group_id; // THE ROW YOU WANT TO CHANGE
    const update_date = req.body.update_date;

    const response = require('./products/update.js')(group_id, update_date, product_id);

    response.then(function (result) {
      if (result === 1) {
        res.send("Product updated with success");
      } else {
        res.status(500).send("Product update failed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PRODUCT 
//////////////////////////////////////////////////////////

app.post('/productdelete', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const product_id = req.body.product_id;
    const delete_date = req.body.delete_date;
    const update_date = req.body.update_date;

    const response = require('./products/delete.js')(update_date, delete_date, product_id);
    response.then(function (result) {
      if (result === 1) {
        res.send("Product deleted with success");
      } else {
        res.status(500).send("Product delete failed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE PAYMENT METHOD 
//////////////////////////////////////////////////////////

app.post('/payment', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const method_type = req.body.method_type;
    const installments_accept = req.body.installments_accept;
    const creation_date = req.body.creation_date;

    const response = require('./pay_method/insert.js')(method_type, installments_accept, creation_date);
    response.then(function (result) {
      if (result === 1) {
        res.send("Payment method signed with success");
      } else {
        res.status(500).send("Payment method already signed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE PAYMENT 
//////////////////////////////////////////////////////////

app.post('/paymentupdate', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const method_id = req.body.method_id;
    const method_type = req.body.method_type; // THE ROW YOU WANT TO CHANGE
    const update_date = req.body.update_date;

    const response = require('./pay_method/update.js')(method_type, update_date, method_id);
    response.then(function (result) {
      if (result === 1) {
        res.send("Payment updated with success");
      } else {
        res.status(500).send("Payment update failed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO DELETE PAYMENT 
//////////////////////////////////////////////////////////

app.post('/paymentdelete', jsonParser, function (req, res) {
  const cookie = req.cookies[`idTokenAdmin`];
  if (cookie && cookie === cookieCheckAdmin) {
    const method_id = req.body.method_id;
    const delete_date = req.body.delete_date;
    const update_date = req.body.update_date;

    const response = require('./pay_method/delete.js')(update_date, delete_date, method_id);
    response.then(function (result) {
      if (result === 1) {
        res.send("Payment deleted with success");
      } else {
        res.status(500).send("Payment delete failed")
      }
      console.log(result);
    })
  } else {
    res.clearCookie(`idTokenAdmin`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO CREATE SALES 
//////////////////////////////////////////////////////////

app.post('/sale', jsonParser, function (req, res) {
  const cookie = req.cookies[`idToken`];
  if (cookie && cookie === cookieCheckClient) {
    jwt.verify(cookie, secretKeyJWT, function (err, decoded) {
      const client_id = decoded.id;
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
      response.then(function (result) {
        if (result === 1) {
          res.send("Sale signed with success");
        } else {
          res.status(500).send("Sale failed")
        }
        console.log(result);
      })
    })
  } else {
    res.clearCookie(`idToken`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

///////////////////////////////////////////////////////////
// POST METHOD TO UPDATE SALES 
//////////////////////////////////////////////////////////

app.post('/saleupdate', jsonParser, function (req, res) {
  const cookie = req.cookies[`idToken`];
  if (cookie && cookie === cookieCheckClient) {
    jwt.verify(cookie, secretKeyJWT, function (err, decoded) {
      const client_id = decoded.id;
      const confirmation = req.body.confirmation;
      const update_date = req.body.update_date;
      const sale_header_id = req.body.sale_header_id;

      const response = require('./sale/update.js')(sale_header_id, client_id, update_date, confirmation);
      response.then(function (result) {
        if (result === 1) {
          res.send("Sale updated with success");
        } else {
          res.status(500).send("Sale update failed")
        }
        console.log(result);
      })
    })
  } else {
    res.clearCookie(`idToken`); // CLEAR THE COOKIE
    res.status(500).send("Something went wrong");
  }
});

app.listen(8080);
