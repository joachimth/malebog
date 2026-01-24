## Packages
idb | Local storage for user drawings (IndexedDB)
framer-motion | Playful animations and transitions
use-image | Helper for loading images in canvas (if using Konva, but we'll use raw Canvas API for flood fill simplicity or react-colorful for picker)
react-colorful | Simple color picker component

## Notes
The application is a Digital Coloring Book for children.
Backend serves static SVG motifs.
Frontend handles all coloring logic (Flood fill, brush, eraser).
User drawings are saved locally in IndexedDB using `idb`.
Design should be touch-friendly, colorful, and resilient.
Fonts: 'Architects Daughter' for headings, 'DM Sans' for UI text.
