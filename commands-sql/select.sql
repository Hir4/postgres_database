------------------------------------------------------------------------
-- SELECTS
------------------------------------------------------------------------
SELECT * FROM public.clients 
	WHERE first_name LIKE 'Rafael%';

SELECT * FROM public.clients 
	WHERE creation_date BETWEEN '2021-07-10' AND '2021-07-15';

SELECT * FROM public.clients 
	WHERE state IN ('SP');

SELECT * FROM public.clients 
	WHERE state NOT IN ('SP');

SELECT * FROM public.clients 
	WHERE id IN (SELECT client_id FROM public.sale_header WHERE total_bought > '1000');

SELECT * FROM public.clients 
	WHERE id = (SELECT client_id FROM public.sale_header WHERE total_bought < '3000');

SELECT * FROM public.pay_bills 
	CROSS JOIN public.provider;

SELECT * FROM public.pay_bills AS bills 
	INNER JOIN public.provider AS provider 
	ON provider.id = bills.provider_id 
	WHERE bills.id = 2;

