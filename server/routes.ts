
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { initialMotifs } from "./seed_motifs";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed data on startup if empty
  const existing = await storage.getMotifs();
  if (existing.length === 0) {
    console.log("Seeding motifs...");
    await storage.seedMotifs(initialMotifs);
    console.log("Seeding complete.");
  }

  app.get(api.motifs.list.path, async (req, res) => {
    const list = await storage.getMotifs();
    res.json(list);
  });

  app.get(api.motifs.get.path, async (req, res) => {
    const idParam = req.params.id;
    const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
    const motif = await storage.getMotif(id);
    if (!motif) return res.status(404).json({ message: "Motif not found" });
    res.json(motif);
  });

  return httpServer;
}
