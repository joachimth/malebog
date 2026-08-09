import { openDB, DBSchema } from 'idb';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ColoringBookDB extends DBSchema {
  drawings: {
    key: string;
    value: {
      id: string;
      motifId?: number;
      title: string;
      blob: Blob; // The image data
      thumbnail: string; // Base64 thumbnail
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'coloring-book-db';
const STORE_NAME = 'drawings';

let dbPromise: ReturnType<typeof openDB<ColoringBookDB>> | undefined;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ColoringBookDB>(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-date', 'updatedAt');
      },
      blocked() {
        console.warn('IndexedDB upgrade is blocked by another tab.');
      },
      blocking() {
        dbPromise = undefined;
      },
    });
    dbPromise.catch(() => {
      dbPromise = undefined;
    });
  }
  return dbPromise;
}

export interface SavedDrawing {
  id: string;
  motifId?: number;
  title: string;
  blob: Blob;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
}

export function useSavedDrawings() {
  return useQuery({
    queryKey: ['drawings'],
    queryFn: async () => {
      const db = await getDB();
      const drawings = await db.getAllFromIndex(STORE_NAME, 'by-date');
      return drawings.sort((a, b) => b.updatedAt - a.updatedAt);
    },
  });
}

export function useSaveDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drawing: SavedDrawing) => {
      const db = await getDB();
      await db.put(STORE_NAME, drawing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
    },
  });
}

export function useDeleteDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = await getDB();
      await db.delete(STORE_NAME, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
    },
  });
}

export function useGetDrawing(id: string) {
  return useQuery({
    queryKey: ['drawing', id],
    enabled: !!id,
    queryFn: async () => {
      const db = await getDB();
      return db.get(STORE_NAME, id);
    },
  });
}
