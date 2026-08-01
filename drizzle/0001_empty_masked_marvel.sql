CREATE TYPE "public"."sender_type" AS ENUM('customer', 'employee', 'agent');--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "sender_user_id" TO "sender_customer_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "sender_business_user_id" TO "sender_employee_id";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_user_id_customers_customer_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_business_user_id_employees_employee_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "conversation_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "business_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "business_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "sender_type" "sender_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_customer_id_customers_customer_id_fk" FOREIGN KEY ("sender_customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_employee_id_employees_employee_id_fk" FOREIGN KEY ("sender_employee_id") REFERENCES "public"."employees"("employee_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "sender_matches_type" CHECK (
            ("messages"."sender_type" = 'customer' AND "messages"."sender_customer_id" IS NOT NULL AND "messages"."sender_employee_id" IS NULL)
            OR ("messages"."sender_type" = 'employee' AND "messages"."sender_employee_id" IS NOT NULL AND "messages"."sender_customer_id" IS NULL)
            OR ("messages"."sender_type" = 'agent' AND "messages"."sender_customer_id" IS NULL AND "messages"."sender_employee_id" IS NULL)
        );