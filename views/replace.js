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

module.exports = function (client_id) {
  const queryReplaceViewSale = `
    CREATE OR REPLACE VIEW view_sale 
      AS SELECT  
        client_id, 
        first_name,
        product_name,
        img_path,
        sale.creation_date, 
        total_bought, 
        payment.method_type
      FROM 
        public.sale_header AS sale
      INNER JOIN public.clients AS client
        ON sale.client_id = client.id
        AND client.id = ${client_id}
      INNER JOIN public.sale_itens AS sale_itens
        ON sale_itens.sale_header_id = sale.id
      INNER JOIN public.products AS products
        ON products.id = sale_itens.product_id
      INNER JOIN public.pay_method AS payment
        ON payment.id = pay_method
      WHERE 
        sale.creation_date 
        BETWEEN (NOW() - INTERVAL '30 DAYS') 
        AND NOW();`;

  return pool // CONNECTING TO THE DATABASE
    .query(queryReplaceViewSale) // SEND THE QUERY TO THE DATABASE
    .catch(e => console.log(e))
};