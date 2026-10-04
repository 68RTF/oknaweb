CREATE TABLE "leads" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"contact" text NOT NULL,
	"project" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
