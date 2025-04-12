import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const useCategoryPodcasts = (categoryType: string) => {
  return useQuery(api.podcasts.getPodcastByCategoryType, { categoryType });
};

export default useCategoryPodcasts;
