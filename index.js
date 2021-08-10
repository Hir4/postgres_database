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

let querySelect = "SELECT * FROM public.employee;";

///////////////////////////////////////////////////////
// INSERT NEW EMPLOYEE
//////////////////////////////////////////////////////

let queryInsert = `
  INSERT INTO public.employee
    (email, 
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
  VALUES
    ($1,
     $2,
     $3,
     $4,
     $5,
     $6,
     $7,
     $8,
     $9,
     $10,
     $11,
     $12); `;

let queryInsertEmployeeValue = ['luka@gmail.com','123','Luka','Maia','11111111111','Pq. Aquático','São Sebastião','SP','11111111','11','111111111', 'NOW()'];

console.log(querySelect);

///////////////////////////////////////////////////////
// SOFT DELETE EMPLOYEE
//////////////////////////////////////////////////////

let querySoftDelete = `
  UPDATE public.employee
  SET
    update_date = $1,
    delete_date = $2 
  WHERE
    public.employee.id = 2`;

let querySoftDeleteEmployeeValue = ['NOW()', 'NOW()'];

console.log(querySoftDelete);

///////////////////////////////////////////////////////
// CONNECTING TO THE DATABASE
//////////////////////////////////////////////////////

client.connect()
.then(() => console.log("Connected"))
.then(() => client.query(querySoftDelete, querySoftDeleteEmployeeValue))
.then(results => console.table(results.rows))
.catch(e => console.log(e))
.finally(() => client.end())
