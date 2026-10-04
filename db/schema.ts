import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: serial().primaryKey(),
  name: text().notNull(),
  contact: text().notNull(),
  project: text().notNull().default(""),
  message: text().notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
