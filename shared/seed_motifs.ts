
import { type InsertMotif, type Motif } from "./schema";

export const initialMotifs: InsertMotif[] = [
  {
    title: "Glad Sol",
    category: "Natur",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="black" stroke-width="2"/><path d="M50,10 L50,15 M50,85 L50,90 M10,50 L15,50 M85,50 L90,50 M22,22 L26,26 M74,74 L78,78 M22,78 L26,74 M74,26 L78,22" stroke="black" stroke-width="2"/><circle cx="40" cy="45" r="3" fill="black"/><circle cx="60" cy="45" r="3" fill="black"/><path d="M40,60 Q50,70 60,60" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["sol", "vejr", "sommer"],
  },
  {
    title: "Simpel Bil",
    category: "Biler",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,60 L90,60 L90,45 L70,45 L65,30 L35,30 L30,45 L10,45 Z" fill="none" stroke="black" stroke-width="2"/><circle cx="25" cy="60" r="8" fill="none" stroke="black" stroke-width="2"/><circle cx="75" cy="60" r="8" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["bil", "køretøj"],
  },
  {
    title: "Hjerte",
    category: "Dyr", 
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50,80 C50,80 10,50 10,30 C10,15 25,10 35,20 C45,30 50,40 50,40 C50,40 55,30 65,20 C75,10 90,15 90,30 C90,50 50,80 50,80 Z" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["hjerte", "kærlighed"],
  },
  {
    title: "Stjerne",
    category: "Rum",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,15 61,35 85,35 66,50 73,72 50,60 27,72 34,50 15,35 39,35" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["stjerne", "himmel"],
  },
  {
    title: "Hus",
    category: "Natur",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="45" width="50" height="40" fill="none" stroke="black" stroke-width="2"/><polygon points="20,45 50,15 80,45" fill="none" stroke="black" stroke-width="2"/><rect x="42" y="65" width="16" height="20" fill="none" stroke="black" stroke-width="2"/><rect x="30" y="50" width="15" height="15" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["hus", "bygning"],
  },
  {
    title: "Fisk",
    category: "Hav",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,50 Q40,20 70,50 Q40,80 20,50 Z M70,50 L90,30 L90,70 Z" fill="none" stroke="black" stroke-width="2"/><circle cx="35" cy="45" r="2" fill="black"/></svg>')}`,
    tags: ["fisk", "vand", "dyr"],
  },
  {
    title: "Blomst",
    category: "Natur",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="10" fill="none" stroke="black" stroke-width="2"/><circle cx="50" cy="30" r="10" fill="none" stroke="black" stroke-width="2"/><circle cx="70" cy="50" r="10" fill="none" stroke="black" stroke-width="2"/><circle cx="50" cy="70" r="10" fill="none" stroke="black" stroke-width="2"/><circle cx="30" cy="50" r="10" fill="none" stroke="black" stroke-width="2"/><path d="M50,70 Q50,90 40,100" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["blomst", "plante"],
  },
  {
    title: "Raket",
    category: "Rum",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M40,20 Q50,5 60,20 L60,70 L40,70 Z" fill="none" stroke="black" stroke-width="2"/><polygon points="40,70 30,85 40,80" fill="none" stroke="black" stroke-width="2"/><polygon points="60,70 70,85 60,80" fill="none" stroke="black" stroke-width="2"/><circle cx="50" cy="40" r="8" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["raket", "rumskib"],
  },
  {
    title: "Juletræ",
    category: "Jul",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 70,30 60,30 80,50 70,50 90,80 10,80 30,50 20,50 40,30 30,30" fill="none" stroke="black" stroke-width="2"/><rect x="45" y="80" width="10" height="15" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["jul", "træ"],
  },
  {
    title: "Dinosaur",
    category: "Dinosaurer",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30,70 Q30,40 50,30 Q70,20 80,40 Q85,50 70,60 L70,80 L60,80 L60,70 L40,70 L40,80 L30,80 Z M30,70 L10,60" fill="none" stroke="black" stroke-width="2"/><circle cx="70" cy="35" r="2" fill="black"/></svg>')}`,
    tags: ["dino", "dyr"],
  },
  {
    title: "Is",
    category: "Dyr", // Just for variety
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,90 30,50 70,50" fill="none" stroke="black" stroke-width="2"/><circle cx="50" cy="40" r="15" fill="none" stroke="black" stroke-width="2"/><circle cx="35" cy="45" r="10" fill="none" stroke="black" stroke-width="2"/><circle cx="65" cy="45" r="10" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["is", "mad"],
  },
  {
    title: "Ugle",
    category: "Dyr",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="black" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="none" stroke="black" stroke-width="2"/><circle cx="60" cy="40" r="8" fill="none" stroke="black" stroke-width="2"/><polygon points="48,50 52,50 50,55" fill="black"/><path d="M35,85 L25,95 M65,85 L75,95" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["ugle", "fugl"],
  },
  {
    title: "Slot",
    category: "Eventyr",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="50" width="20" height="40" fill="none" stroke="black" stroke-width="2"/><rect x="60" y="50" width="20" height="40" fill="none" stroke="black" stroke-width="2"/><rect x="30" y="60" width="40" height="30" fill="none" stroke="black" stroke-width="2"/><polygon points="15,50 20,30 25,50" fill="none" stroke="black" stroke-width="2"/><polygon points="75,50 80,30 85,50" fill="none" stroke="black" stroke-width="2"/><path d="M40,90 Q50,70 60,90" fill="none" stroke="black" stroke-width="2"/></svg>')}`,
    tags: ["slot", "prinsesse"],
  },
  {
    title: "Drage",
    category: "Fantasy",
    imageUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30,70 Q20,50 30,30 Q50,10 70,30 Q80,50 70,70 L50,90 L30,70 Z M30,30 L10,20 L30,40 M70,30 L90,20 L70,40" fill="none" stroke="black" stroke-width="2"/><circle cx="40" cy="40" r="2" fill="black"/><circle cx="60" cy="40" r="2" fill="black"/></svg>')}`,
    tags: ["drage", "monster"],
  }
];


// The fresh PostgreSQL seed uses serial IDs starting at 1. Keeping this
// derived catalog in the same module avoids duplicating the SVG data in the
// Pages bundle while giving the static app stable route IDs.
export const clientMotifs: Motif[] = initialMotifs.map((motif, index) => ({
  id: index + 1,
  ...motif,
  tags: motif.tags ?? [],
}));
