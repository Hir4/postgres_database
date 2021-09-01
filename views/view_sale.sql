CREATE OR REPLACE VIEW view_sale 
 	AS SELECT  
		client_id, 
		first_name,
		product_name,
		sale.creation_date, 
		total_bought, 
		payment.method_type
	FROM 
		public.sale_header AS sale
  	INNER JOIN public.clients AS client
		ON sale.client_id = client.id
	INNER JOIN public.sale_itens AS sale_itens
		ON sale_itens.sale_header_id = sale.id
	INNER JOIN public.products AS products
		ON products.id = sale_itens.product_id
	INNER JOIN public.pay_method AS payment
		ON payment.id = pay_method
 	WHERE 
		sale.creation_date 
		BETWEEN (NOW() - INTERVAL '30 DAYS') 
		AND NOW();
	
SELECT * FROM view_sale;