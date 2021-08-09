------------------------------------------------------------------------
-- VIEWS
------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_product 
 	AS SELECT  
		products.id, 
		product_type, 
		product_name, 
		group_id, 
		product_price, 
		product_quantity,
		product_price * product_quantity AS total
	FROM 
		public.products AS products
  	INNER JOIN public.product_group AS group_product
		ON products.group_id = group_product.id
	
SELECT * FROM view_product;

DROP VIEW view_product;

CREATE OR REPLACE VIEW view_sale 
 	AS SELECT  
		client_id, 
		first_name, 
		sale.creation_date, 
		total_bought, 
		pay_method, 
		installments
	FROM 
		public.sale_header AS sale
  	INNER JOIN public.clients AS client
		ON sale.client_id = client.id
 	WHERE 
		sale.creation_date 
		BETWEEN (NOW() - INTERVAL '30 DAYS') 
		AND NOW();
	
SELECT * FROM view_sale;

DROP VIEW view_sale;



CREATE OR REPLACE VIEW view_aging_list 
 	 AS SELECT  
		client_id, 
		first_name, 
		due_date,
	CASE
		WHEN 
			sale.due_date
			BETWEEN 
				CURRENT_DATE
			AND
				CURRENT_DATE + INTERVAL '30 DAYS'
			THEN
				'Não quitados'
   		WHEN 
			sale.due_date
			BETWEEN 
				CURRENT_DATE + INTERVAL '30 DAYS'
			AND
				CURRENT_DATE + INTERVAL '59 DAYS'
   			THEN
   				'30 dias'
   		WHEN
			sale.due_date
			BETWEEN 
				CURRENT_DATE + INTERVAL '60 DAYS'
			AND
				CURRENT_DATE + INTERVAL '89 DAYS'
			THEN
				'60 dias'
   		WHEN
			sale.due_date
			BETWEEN 
				CURRENT_DATE + INTERVAL '90 DAYS'
			AND
				CURRENT_DATE + INTERVAL '119 DAYS'
			THEN
				'90 dias'
   		WHEN 
			sale.due_date >=
			CURRENT_DATE + INTERVAL '120 DAYS'
			THEN
				'120 dias'
		ELSE 'A vencer'
 	END AS sub
	FROM 
		public.sale_header AS sale
  	INNER JOIN public.clients AS client
		ON sale.client_id = client.id
	
SELECT * FROM view_aging_list;

DROP VIEW view_aging_list;

CREATE OR REPLACE VIEW view_profit 
 	AS SELECT  
		products.id,
		products.product_name,
		DATE_PART('month', sale.creation_date) AS month,
		COUNT(sale.id) AS quantity_sold,
		MAX(products.product_price) AS max_product_price_sold,
		MAX(sale.total_bought) AS max_total_sold,
		AVG(products.product_price::numeric) AS medium_sold,
		SUM(sale.total_bought) AS total_sold
	FROM 
		public.products AS products
		INNER JOIN public.sale_itens AS itens
		ON itens.product_id = products.id
		INNER JOIN public.sale_header AS sale
		ON sale.id = itens.sale_header_id
	GROUP BY 
		products.id,
		products.product_name,
		month
		
SELECT * FROM view_profit;