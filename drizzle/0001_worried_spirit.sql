ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "xendit_invoice_id" text;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "xendit_payment_url" text;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "xendit_status" text;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;