import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const motifs = pgTable("motifs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  tags: text("tags").array(),
});

export const insertMotifSchema = createInsertSchema(motifs).omit({ id: true });

export type Motif = typeof motifs.$inferSelect;
export type InsertMotif = z.infer<typeof insertMotifSchema>;
export type MotifResponse = Motif;
