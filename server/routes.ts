import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { initialMotifs } from "./seed_motifs";
import { z } from "zod";

const motifIdSchema = z.string().regex(/^[1-9]\d*$/).transform(Number);

export async function registerRoutes(
  _httpServer: Server,
  app: Express,
): Promise<Server> {
  console.log("Ensuring motifs are seeded...");
  await storage.seedMotifs(initialMotifs);
  console.log("Motif seed check complete.");

  app.get(api.motifs.list.path, async (_req, res) => {
    const list = await storage.getMotifs();
    res.json(list);
  });

  app.get(api.motifs.get.path, async (req, res) => {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = motifIdSchema.safeParse(rawId);
    if (!parsed.success) {
      return res.status(400).json({ message: "Motif id must be a positive integer" });
    }

    const motif = await storage.getMotif(parsed.data);
    if (!motif) return res.status(404).json({ message: "Motif not found" });
    res.json(motif);
  });

  return _httpServer;
}
