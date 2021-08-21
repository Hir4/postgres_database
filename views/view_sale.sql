CREATE OR REPLACE VIEW view_sale 
 	AS SELECT  
		client_id, 
		first_name, 
		sale.creation_date, 
		total_bought, 
		pay_method,
		method_type,
		installments_accept
	FROM 
		public.sale_header AS sale
  	INNER JOIN public.clients AS client
		ON sale.client_id = client.id
	INNER JOIN public.pay_method AS payment
		ON payment.id = pay_method
 	WHERE 
		sale.creation_date 
		BETWEEN (NOW() - INTERVAL '30 DAYS') 
		AND NOW();
	
SELECT * FROM view_sale;