import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useMotifs() {
  return useQuery({
    queryKey: [api.motifs.list.path],
    queryFn: async () => {
      const res = await fetch(api.motifs.list.path);
      if (!res.ok) throw new Error("Kunne ikke hente motiver");
      return api.motifs.list.responses[200].parse(await res.json());
    },
  });
}

export function useMotif(id: number) {
  return useQuery({
    queryKey: [api.motifs.get.path, id],
    enabled: !isNaN(id),
    queryFn: async () => {
      const url = buildUrl(api.motifs.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Kunne ikke hente motivet");
      return api.motifs.get.responses[200].parse(await res.json());
    },
  });
}
