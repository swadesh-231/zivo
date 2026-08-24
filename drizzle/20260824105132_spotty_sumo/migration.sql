CREATE TYPE "build_event_kind" AS ENUM('STATUS', 'THOUGHT', 'READ', 'WRITE', 'TERMINAL', 'ERROR');--> statement-breakpoint
CREATE TABLE "build_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"kind" "build_event_kind" NOT NULL,
	"label" text NOT NULL,
	"detail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "build_event_project_id_idx" ON "build_event" ("project_id");--> statement-breakpoint
ALTER TABLE "build_event" ADD CONSTRAINT "build_event_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;