
import { z } from 'zod';
import { insertMotifSchema, motifs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  motifs: {
    list: {
      method: 'GET' as const,
      path: '/api/motifs',
      responses: {
        200: z.array(z.custom<typeof motifs.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/motifs/:id',
      responses: {
        200: z.custom<typeof motifs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
