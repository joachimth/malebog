
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const motifs = pgTable("motifs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // Dyr, Eventyr, Biler, etc.
  imageUrl: text("image_url").notNull(), // Path to SVG
  tags: text("tags").array(),
});

export const insertMotifSchema = createInsertSchema(motifs).omit({ id: true });

export type Motif = typeof motifs.$inferSelect;
export type InsertMotif = z.infer<typeof insertMotifSchema>;
export type MotifResponse = Motif;
