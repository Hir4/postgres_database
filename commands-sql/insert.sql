------------------------------------------------------------------------
-- CLIENT TABLE
------------------------------------------------------------------------

INSERT INTO public.clients
	(email, password, first_name, last_name, document, address, city, state, zip_code, phone_ddi, phone_ddd, phone_number)
VALUES
	('hirayama.rafael517@gmail.com', '123', 'Rafael', 'Hideki', '47584967817', 'Pq. Industrial', 'SJC', 'SP', '12235690', '55', '12', '996384346')
	
SELECT * FROM public.clients

TRUNCATE TABLE public.clients CASCADE

------------------------------------------------------------------------
-- ADMIN TABLE
------------------------------------------------------------------------

INSERT INTO public.admin
	(email, password, first_name, last_name, document, address, city, state, zip_code, phone_ddi, phone_ddd, phone_number)
VALUES
	('hirayama.rafael517@gmail.com', '123', 'Rafael', 'Hideki', '47584967817', 'Pq. Industrial', 'SJC', 'SP', '12235690', '55', '12', '996384346')
	
SELECT * FROM public.admin

TRUNCATE TABLE public.admin

------------------------------------------------------------------------
-- EMPLOYEE TABLE
------------------------------------------------------------------------

INSERT INTO public.employee
	(email, password, first_name, last_name, document, address, city, state, zip_code, phone_ddi, phone_ddd, phone_number)
VALUES
	('hirayama.rafael517@gmail.com', '123', 'Rafael', 'Hideki', '47584967817', 'Pq. Industrial', 'SJC', 'SP', '12235690', '55', '12', '996384346')
	
SELECT * FROM public.employee

TRUNCATE TABLE public.employee

------------------------------------------------------------------------
-- PRODUCT_GROUP TABLE
------------------------------------------------------------------------

INSERT INTO public.product_group
	(product_type)
VALUES
	('processors')
	
SELECT * FROM public.product_group

TRUNCATE TABLE public.product_group

------------------------------------------------------------------------
-- PRODUCTS TABLE
------------------------------------------------------------------------

INSERT INTO public.products
	(label, group_id, product_name, product_price)
VALUES
	('intel', '1', 'Intel Core i5-10400F', '1.282,24')
	
SELECT * FROM public.products

TRUNCATE TABLE public.products CASCADE

------------------------------------------------------------------------
-- PROVIDER TABLE
------------------------------------------------------------------------

INSERT INTO public.provider
	(company, first_name, last_name, document, address, city, state, zip_code, phone_ddi, phone_ddd, phone_number)
VALUES
	('Intel', 'Fábio', 'Andrade', '11111111111', '2200 Mission College Blvd', 'Santa Clara', 'CA', '111111111', '111', '11', '111111111')
	
SELECT * FROM public.provider

TRUNCATE TABLE public.provider CASCADE

------------------------------------------------------------------------
-- RECEIVE_BILLS TABLE
------------------------------------------------------------------------

INSERT INTO public.receive_bills
	(client_id, sale_header_id, installments, value, pay_method, due_date)
VALUES
	('1', '1', '1', '1.282,24', 'pix', now())
	
SELECT * FROM public.receive_bills

TRUNCATE TABLE public.receive_bills 

------------------------------------------------------------------------
-- PAY_BILLS TABLE
------------------------------------------------------------------------

INSERT INTO public.pay_bills
	(provider_id, installments, product_bought, product_price, product_quantity, total_bought, pay_method, shipping)
VALUES
	('1', '1', 'processors', '1.089,90', '5', '5.449,5', 'pix', '0')
	
SELECT * FROM public.pay_bills

TRUNCATE TABLE public.pay_bills CASCADE

------------------------------------------------------------------------
-- SALE_HEADER TABLE
------------------------------------------------------------------------

INSERT INTO public.sale_header
	(client_id, total_bought, pay_method, installments, due_date, shipping, delivery_time)
VALUES
	('1', '1.282,24', 'pix', '1', now(), '0', now())
	
SELECT * FROM public.sale_header

TRUNCATE TABLE public.sale_header CASCADE

------------------------------------------------------------------------
-- SALE_ITENS TABLE
------------------------------------------------------------------------

INSERT INTO public.sale_itens
	(sale_header_id, line_id, product_id, product_quantity)
VALUES
	('1', '1', '7', '1')
	
SELECT * FROM public.sale_itens

TRUNCATE TABLE public.sale_itens CASCADE