"use client";

import { useQuery } from "convex/react";

import EmptyState from "@/components/EmptyState";
import LoaderSpinner from "@/components/LoaderSpinner";
import PodcastCard from "@/components/PodcastCard";
import ProfileCard from "@/components/ProfileCard";
import { api } from "@/convex/_generated/api";

const ProfilePage = ({ params }: { params: { profileId: string } }) => {
  const user = useQuery(api.users.getUserById, { clerkId: params.profileId });
  const podcastsData = useQuery(api.podcasts.getPodcastByAuthorId, {
    authorId: params.profileId.trim(),
  });


  if (!user || !podcastsData) return <LoaderSpinner />;

  return (
    <section className="mt-9 flex flex-col">
      <h1 className="text-24 font-extrabold bg-gradient-to-r from-[#D4D925] to-gray-300 text-transparent bg-clip-text drop-shadow-lg animate-pulse">
        Podcaster&apos;s Profile
      </h1>
      <div className="mt-6 flex flex-col gap-6 max-md:items-center md:flex-row">
        <ProfileCard
          podcastData={{
            podcasts: podcastsData.map(podcast => ({
              ...podcast,
              audioStorageId: podcast.audioStorageId ?? null,
              imageStorageId: podcast.imageStorageId ?? null,
              audioUrl: podcast.audioUrl ?? null,
              imageUrl: podcast.imageUrl ?? null,
            })),
            listeners: 0,
          }}
          imageUrl={user?.imageUrl!}
          userFirstName={user?.name!}
        />
      </div>
      <section className="mt-9 flex flex-col gap-5">
        <h1 className="text-20 font-bold text-white-1">All Podcasts</h1>
        {podcastsData && podcastsData.length > 0 ? (
          <div className="podcast_grid">
            {podcastsData.slice(0, 4).map((podcast) => (
              <PodcastCard
                key={podcast._id}
                imgUrl={podcast.imageUrl!}
                title={podcast.podcastTitle!}
                description={podcast.podcastDescription}
                podcastId={podcast._id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="You have not created any podcasts yet"
            buttonLink="/create-podcast"
            buttonText="Create Podcast"
          />
        )}
      </section>
    </section>
  );
};

export default ProfilePage;