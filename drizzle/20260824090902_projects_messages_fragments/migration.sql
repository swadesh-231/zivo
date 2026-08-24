CREATE TYPE "message_role" AS ENUM('USER', 'ASSISTANT');--> statement-breakpoint
CREATE TYPE "message_type" AS ENUM('RESULT', 'ERROR');--> statement-breakpoint
CREATE TABLE "fragment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"message_id" uuid NOT NULL,
	"sandbox_url" text NOT NULL,
	"title" text NOT NULL,
	"files" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"content" text NOT NULL,
	"role" "message_role" NOT NULL,
	"type" "message_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "fragment_message_id_idx" ON "fragment" ("message_id");--> statement-breakpoint
CREATE INDEX "message_project_id_idx" ON "message" ("project_id");--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "project" ("user_id");--> statement-breakpoint
ALTER TABLE "fragment" ADD CONSTRAINT "fragment_message_id_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;