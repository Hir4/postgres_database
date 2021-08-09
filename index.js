const {Client} = require('pg');

const client = new Client({
  user: "postgres",
  password: "",
  host: "localhost",
  port: 5432,
  database: "postgres"
});

let query = "SELECT * FROM public.clients WHERE first_name LIKE 'Rafael%';";

console.log(query);

client.connect()
.then(() => console.log("Connected"))
.then(() => client.query(query))
.then(results => console.table(results.rows))
.catch(e => console.log(e))
.finally(() => client.end())
