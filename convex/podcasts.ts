import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUrl = mutation({
    args: {
        storageId: v.id("_storage"),

    },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    }
})

export const createPodcast = mutation({
    args : {
        podcastTitle: v.string(),
        podcastDescription: v.string(),
        audioUrl: v.string(),
        imageUrl: v.string(),
        voiceType: v.string(),
        categoryType: v.string(),
        imagePrompt: v.string(),
        voicePrompt: v.string(),
        views: v.number(),
        audioDuration: v.number(),
        audioStorageId: v.id('_storage'),
        imageStorageId: v.id('_storage'),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new ConvexError("Not Authenticated");
        }

        const user = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('email'), identity.email))
            .collect();
        
            if(user.length === 0) {
                throw new ConvexError("User Not Found");
            }
        
        const podcast = await ctx.db.insert('podcasts', {
            ...args,
            user: user[0]._id,
            author: user[0].name,
            authorId: user[0].clerkId,
            authorImageUrl: user[0].imageUrl,
        })

        return podcast;
    }
})

export const getTrendingPodcasts = query({
    handler: async (ctx) => {
        const podcasts = await ctx.db.query('podcasts').collect();

        return podcasts;
    }
})

export const getPodcastById = query({
    args: {
        podcastId: v.id('podcasts'),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.podcastId);
    }
})

export const getPodcastBySearch = query({
    args: {
        search: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.search === "") {
            return await ctx.db.query("podcasts").order("desc").collect();
        }
    
        const authorSearch = await ctx.db
            .query("podcasts")
            .withSearchIndex("search_author", (q) => q.search("author", args.search))
            .take(10);
    
        if (authorSearch.length > 0) {
            return authorSearch;
        }
    
        const titleSearch = await ctx.db
            .query("podcasts")
            .withSearchIndex("search_title", (q) =>
            q.search("podcastTitle", args.search)
            )
            .take(10);
    
        if (titleSearch.length > 0) {
            return titleSearch;
        }
    
        // Separate searches for podcastDescription and podcastTitle
        const descriptionSearch = await ctx.db
            .query("podcasts")
            .withSearchIndex("search_body", (q) =>
            q.search("podcastDescription", args.search)
            )
            .take(10);
    
        if (descriptionSearch.length > 0) {
            return descriptionSearch;
        }
    
        return [];
        },
});


export const getPodcastByVoiceType = query({
    args: {
        podcastId: v.id("podcasts"),
    },
    handler: async (ctx, args) => {
      // Fetch the current podcast to get its voiceType
        const currentPodcast = await ctx.db.get(args.podcastId);
        if (!currentPodcast) {
            return [];
        }

      // Query podcasts with the same voiceType, excluding the current podcast
    return await ctx.db
        .query("podcasts")
        .filter((q) => q.eq(q.field("voiceType"), currentPodcast.voiceType))
        .filter((q) => q.neq(q.field("_id"), args.podcastId))
        .order("desc")
        .take(10);
    },
});

export const getPodcastByCategoryType = query({
    args: {
        categoryType: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("podcasts")
            .withIndex("categoryType_index", (q) => q.eq("categoryType", args.categoryType))  // ✅ Use the correct index name
            .order("desc")
            .collect();
    },
});

export const getPodcastByAuthorId = query({
    args: {
      authorId: v.string(), // Ensure it's always a string
    },
    handler: async (ctx, args) => {
      const cleanedAuthorId = args.authorId.trim(); // Ensure no leading/trailing spaces

      // Filter for matching authorId
      const filteredPodcasts = await ctx.db
        .query("podcasts")
        .filter((q) => q.eq(q.field("authorId"), cleanedAuthorId)) // Ensure filtering correctly
        .order("desc")
        .collect();
      return filteredPodcasts;
    },
  });


  export const getUserPodcasts = query({
    args: { userId: v.id("users") }, // ✅ Expect Convex user ID, not clerkId
    handler: async (ctx, args) => {
      // Step 1: Fetch podcasts using the given Convex user ID
      return await ctx.db
        .query("podcasts")
        .withIndex("user_index", (q) => q.eq("user", args.userId))
        .order("desc")
        .collect();
    },
  });

export const deletePodcast = mutation({
    args: {
        podcastId: v.id("podcasts"),
        imageStorageId: v.optional(v.id("_storage")),
        audioStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const podcast = await ctx.db.get(args.podcastId);
    
        if (!podcast) {
            throw new ConvexError("Podcast not found");
        }

        // Only delete storage if the ID exists
        if (args.imageStorageId) {
            await ctx.storage.delete(args.imageStorageId);
        }
        if (args.audioStorageId) {
            await ctx.storage.delete(args.audioStorageId);
        }

        return await ctx.db.delete(args.podcastId);
    },
});


export const updatePodcast = mutation({
    args: {
        podcastId: v.id("podcasts"),
        podcastTitle: v.optional(v.string()),
        podcastDescription: v.optional(v.string()),
        audioUrl: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        voicePrompt: v.optional(v.string()),
        imagePrompt: v.optional(v.string()),
        voiceType: v.optional(v.string()),
        categoryType: v.optional(v.string()),
        views: v.optional(v.number()),
        audioDuration: v.optional(v.number()),
        audioStorageId: v.optional(v.id("_storage")),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const { podcastId, ...updateFields } = args;

        const podcast = await ctx.db.get(podcastId);
        if (!podcast) {
            throw new ConvexError("Podcast not found");
        }

        // Remove undefined fields from the update object
        const filteredUpdates = Object.fromEntries(
            Object.entries(updateFields).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(filteredUpdates).length === 0) {
            throw new ConvexError("No changes provided");
        }

        return await ctx.db.patch(podcastId, filteredUpdates);
    },
});


