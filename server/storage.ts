
import { db } from "./db";
import { motifs, type Motif, type InsertMotif } from "@shared/schema";
import { eq } from "drizzle-orm";

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
    await db.insert(motifs).values(newMotifs);
  }
}

export const storage = new DatabaseStorage();
