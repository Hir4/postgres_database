------------------------------------------------------------------------
-- CREATE TABLE
------------------------------------------------------------------------

-- CLIENT TABLE

CREATE TABLE "public.clients" (
	"id" serial NOT NULL,
	"email" varchar(30) NOT NULL UNIQUE,
	"password" varchar(30) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"document" varchar(14) NOT NULL,
	"address" varchar(250) NOT NULL,
	"city" varchar(80) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(9) NOT NULL,
	"phone_ddd" varchar(2) NOT NULL,
	"phone_number" varchar(10) NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "clients_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- PRODUCTS TABLE

CREATE TABLE "public.products" (
	"id" serial NOT NULL,
	"group_id" integer NOT NULL,
	"label" varchar(30) NOT NULL,
	"product_name" varchar(30) NOT NULL,
	"product_quantity" integer NOT NULL,
	"product_price" FLOAT NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "products_pk" PRIMARY KEY ("id","group_id")
) WITH (
  OIDS=FALSE
);

-- PRODUCTS GROUP TABLE

CREATE TABLE "public.product_group" (
	"id" serial NOT NULL,
	"product_type" varchar(30) NOT NULL UNIQUE,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "product_group_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- PROVIDER TABLE

CREATE TABLE "public.provider" (
	"id" serial NOT NULL,
	"company" varchar(50) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"document" varchar(14) NOT NULL,
	"addres" varchar(250) NOT NULL,
	"city" varchar(80) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(9) NOT NULL,
	"phone_ddd" varchar(2) NOT NULL,
	"phone_number" varchar(10) NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "provider_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- SALE HEADER TABLE

CREATE TABLE "public.sale_header" (
	"id" serial NOT NULL,
	"client_id" integer NOT NULL,
	"total_bought" FLOAT NOT NULL,
	"pay_method" varchar(7) NOT NULL,
	"installments" integer NOT NULL DEFAULT '1',
	"due_date" timestamp NOT NULL,
	"shipping" FLOAT NOT NULL DEFAULT '0',
	"delivery_time" timestamp NOT NULL,
	"confirmation" BOOLEAN NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "sale_header_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- SALE ITENS TABLE

CREATE TABLE "public.sale_itens" (
	"sale_header_id" serial NOT NULL,
	"line_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_quantity" integer NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "sale_itens_pk" PRIMARY KEY ("sale_header_id","line_id","product_id")
) WITH (
  OIDS=FALSE
);

-- PAY BILLS TABLE

CREATE TABLE "public.pay_bills" (
	"id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"installments" integer NOT NULL DEFAULT '1',
	"product_bought" varchar(30) NOT NULL,
	"product_price" FLOAT NOT NULL,
	"product_quantity" integer NOT NULL,
	"total_bought" FLOAT NOT NULL,
	"pay_method" varchar(7) NOT NULL,
	"shipping" FLOAT,
	"confirmation" BOOLEAN NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "pay_bills_pk" PRIMARY KEY ("id","provider_id","installments")
) WITH (
  OIDS=FALSE
);

-- RECEIVE BILLS TABLE

CREATE TABLE "public.receive_bills" (
	"client_id" integer NOT NULL,
	"sale_header_id" integer NOT NULL,
	"installments" integer NOT NULL DEFAULT '1',
	"value" FLOAT NOT NULL,
	"pay_method" varchar(7) NOT NULL,
	"due_date" timestamp NOT NULL,
	"confirmation" BOOLEAN NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_data" timestamp NOT NULL,
	CONSTRAINT "receive_bills_pk" PRIMARY KEY ("client_id","sale_header_id","installments")
) WITH (
  OIDS=FALSE
);

-- ADMIN TABLE

CREATE TABLE "public.admin" (
	"id" serial NOT NULL,
	"email" varchar(30) NOT NULL UNIQUE,
	"password" varchar(30) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"document" varchar(14) NOT NULL,
	"address" varchar(250) NOT NULL,
	"city" varchar(80) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(9) NOT NULL,
	"phone_ddd" varchar(2) NOT NULL,
	"phone_number" varchar(2) NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "admin_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- EMPLOYEE TABLE

CREATE TABLE "public.employee" (
	"id" serial NOT NULL,
	"email" varchar(30) NOT NULL UNIQUE,
	"password" varchar(30) NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"document" varchar(14) NOT NULL,
	"address" varchar(250) NOT NULL,
	"city" varchar(80) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(9) NOT NULL,
	"phone_ddd" varchar(2) NOT NULL,
	"phone_number" varchar(2) NOT NULL,
	"creation_date" TIMESTAMP NOT NULL,
	"update_date" timestamp NOT NULL,
	"delete_date" timestamp NOT NULL,
	CONSTRAINT "employee_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

-- CONSTRAINTS

ALTER TABLE "products" ADD CONSTRAINT "products_fk0" FOREIGN KEY ("group_id") REFERENCES "product_group"("id");



ALTER TABLE "sale_header" ADD CONSTRAINT "sale_header_fk0" FOREIGN KEY ("client_id") REFERENCES "clients"("id");

ALTER TABLE "sale_itens" ADD CONSTRAINT "sale_itens_fk0" FOREIGN KEY ("sale_header_id") REFERENCES "sale_header"("id");
ALTER TABLE "sale_itens" ADD CONSTRAINT "sale_itens_fk1" FOREIGN KEY ("product_id") REFERENCES "products"("id");

ALTER TABLE "pay_bills" ADD CONSTRAINT "pay_bills_fk0" FOREIGN KEY ("provider_id") REFERENCES "provider"("id");

ALTER TABLE "receive_bills" ADD CONSTRAINT "receive_bills_fk0" FOREIGN KEY ("client_id") REFERENCES "clients"("id");
ALTER TABLE "receive_bills" ADD CONSTRAINT "receive_bills_fk1" FOREIGN KEY ("sale_header_id") REFERENCES "sale_header"("id");
