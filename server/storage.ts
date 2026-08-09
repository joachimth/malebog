import { db } from "./db";
import { motifs, type Motif, type InsertMotif } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getMotifs(): Promise<Motif[]>;
  getMotif(id: number): Promise<Motif | undefined>;
  seedMotifs(motifs: InsertMotif[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMotifs(): Promise<Motif[]> {
    return await db.select().from(motifs);
  }

  async getMotif(id: number): Promise<Motif | undefined> {
    const [motif] = await db.select().from(motifs).where(eq(motifs.id, id));
    return motif;
  }

  async seedMotifs(newMotifs: InsertMotif[]): Promise<void> {
    if (newMotifs.length === 0) return;

    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext('malebog:motif-seed'))`);

      const existing = await tx
        .select({ title: motifs.title, category: motifs.category })
        .from(motifs);
      const existingKeys = new Set(existing.map(({ title, category }) => `${title}\0${category}`));
      const missing = newMotifs.filter(
        ({ title, category }) => !existingKeys.has(`${title}\0${category}`),
      );

      if (missing.length > 0) {
        await tx.insert(motifs).values(missing);
      }
    });
  }
}

export const storage = new DatabaseStorage();
