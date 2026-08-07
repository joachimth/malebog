import { useQuery } from "@tanstack/react-query";
import { clientMotifs } from "@shared/seed_motifs";

export function useMotifs() {
  return useQuery({
    queryKey: ["static-motifs"],
    queryFn: async () => clientMotifs,
    initialData: clientMotifs,
  });
}

export function useMotif(id: number) {
  return useQuery({
    queryKey: ["static-motif", id],
    enabled: id > 0,
    queryFn: async () => clientMotifs.find((motif) => motif.id === id) ?? null,
    initialData: clientMotifs.find((motif) => motif.id === id) ?? null,
  });
}
