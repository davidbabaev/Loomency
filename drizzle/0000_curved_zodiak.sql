CREATE TABLE "businesses" (
	"business_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "businesses_business_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"business_name" text,
	"country" text,
	"address" text,
	"field" text,
	"phone_number" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"customer_id" integer,
	"business_id" integer,
	"conversation_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_conversation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"customer_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_customer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"customer_name" text,
	"customer_lastname" text,
	"phone_number" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"user_id_betterauth" text,
	"employee_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employees_employee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"business_id" integer,
	"created_at" timestamp DEFAULT now(),
	"role" text,
	CONSTRAINT "employees_user_id_betterauth_business_id_unique" UNIQUE("user_id_betterauth","business_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"conversation_id" integer,
	"business_id" integer,
	"message_text" text,
	"message_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_message_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sender_user_id" integer,
	"sender_business_user_id" integer,
	"message_media_url" text,
	"message_media_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("conversation_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_customers_customer_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_business_user_id_employees_employee_id_fk" FOREIGN KEY ("sender_business_user_id") REFERENCES "public"."employees"("employee_id") ON DELETE no action ON UPDATE no action;