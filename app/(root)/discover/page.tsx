"use client";
import LoaderSpinner from '@/components/LoaderSpinner';
import PodcastCard from '@/components/PodcastCard';
import { api } from "@/convex/_generated/api";
import { useConvex, useQuery } from "convex/react";
import { useEffect, useState } from 'react';

const podcastCategories = [
  "business", "technology", "comedy", "education", "hobbies",
  "government", "mental health", "family", "music", "politics",
  "spirituality", "culture", "arts"
];

interface Podcast {
  _id: string;
  podcastTitle: string;
  podcastDescription: string;
  imageUrl?: string; // Allow imageUrl to be undefined
}

interface CategoryPodcasts {
  [key: string]: Podcast[];
}

// Helper function to capitalize category type
const capitalize = (str: string) => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Discover = () => {
  const convex = useConvex();
  
  // Fetch trending podcasts using useQuery
  const trendingPodcasts = useQuery(api.podcasts.getTrendingPodcasts);

  // State to hold category podcasts
  const [categoryPodcasts, setCategoryPodcasts] = useState<CategoryPodcasts>({});

  useEffect(() => {
    // Function to fetch podcasts for each category
    const fetchCategoryPodcasts = async () => {
      const categoriesData: CategoryPodcasts = {};
      for (const categoryType of podcastCategories) {
        // Directly assign the query result to podcasts
        const podcasts = await convex.query(api.podcasts.getPodcastByCategoryType, {
          categoryType,
        });
        // Map the podcasts array to include a default imageUrl
        categoriesData[categoryType] = podcasts.map(podcast => ({
          ...podcast,
          imageUrl: podcast.imageUrl || '' // Provide a default value for imageUrl
        }));
      }
      setCategoryPodcasts(categoriesData);
    };
  
    fetchCategoryPodcasts();
  }, [convex, podcastCategories]);  // Added podcastCategories as a dependency
  

  // Render loading spinner if data is not ready
  if (!trendingPodcasts || podcastCategories.some(categoryType => !categoryPodcasts[categoryType])) {
    return <LoaderSpinner />;
  }

  // Render once data is loaded
  return (
    <div className="mt-9 flex flex-col gap-9 md:overflow-hidden">
      <section className='flex flex-col gap-5'>
        <h1 className="text-24 font-extrabold bg-gradient-to-r from-[#D4D925] to-gray-300 text-transparent bg-clip-text drop-shadow-lg animate-pulse">Trending Podcasts</h1>
        <div className="podcast_grid">
          {trendingPodcasts?.map(({ _id, podcastTitle, podcastDescription, imageUrl }) => (
            <PodcastCard
              key={_id}
              imgUrl={imageUrl as string}
              title={podcastTitle}
              description={podcastDescription}
              podcastId={_id}
            />
          ))}
        </div>
      </section>

      {podcastCategories.map(categoryType => (
        categoryPodcasts[categoryType]?.length > 0 && (
          <section key={categoryType} className='flex flex-col gap-5'>
            <h1 className="text-20 font-bold text-white-1">{capitalize(categoryType)} Podcasts</h1>
            <div className="podcast_grid">
              {categoryPodcasts[categoryType]?.map(({ _id, podcastTitle, podcastDescription, imageUrl }) => (
                <PodcastCard
                  key={_id}
                  imgUrl={imageUrl as string}
                  title={podcastTitle}
                  description={podcastDescription}
                  podcastId={_id}
                />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
};

export default Discover;