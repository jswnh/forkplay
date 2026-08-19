CREATE TABLE "store_items" (
	"item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"category" text DEFAULT 'dlc' NOT NULL,
	"game_id" uuid,
	"price" double precision DEFAULT 0 NOT NULL,
	"original_price" double precision,
	"image_url" text NOT NULL,
	"rarity" text DEFAULT 'common' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_items" (
	"user_item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_equipped" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_transactions" DROP CONSTRAINT "store_transactions_game_id_games_game_id_fk";
--> statement-breakpoint
ALTER TABLE "store_transactions" ALTER COLUMN "game_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "store_transactions" ALTER COLUMN "payment_method" SET DEFAULT 'Online Payment';--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "item_id" uuid;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD COLUMN "item_type" text DEFAULT 'game' NOT NULL;--> statement-breakpoint
ALTER TABLE "store_items" ADD CONSTRAINT "store_items_game_id_games_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("game_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_item_id_store_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."store_items"("item_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_transactions" ADD CONSTRAINT "store_transactions_game_id_games_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("game_id") ON DELETE set null ON UPDATE no action;