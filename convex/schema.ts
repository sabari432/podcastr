import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    podcasts: defineTable({
        audioStorageId: v.optional(v.id('_storage')),
        user: v.id('users'),
        podcastTitle: v.string(),
        podcastDescription: v.string(),
        categoryType: v.string(),
        audioUrl: v.optional(v.string()),
        audioStrorageId: v.optional(v.id('_storage')),
        imageUrl: v.optional(v.string()),
        imageStorageId: v.optional(v.id('_storage')),
        author: v.string(),
        authorId: v.string(),
        authorImageUrl: v.string(),
        voicePrompt: v.string(),
        imagePrompt: v.string(),
        voiceType: v.string(),
        audioDuration: v.number(),
        views: v.number(),
    })
    .searchIndex('search_author', { searchField: 'author'})
    .searchIndex('search_title', {searchField: 'podcastTitle'})
    .searchIndex('search_body', {searchField: 'podcastDescription'})
    .index("categoryType_index", ["categoryType"])
    .index("user_index", ["user"])
    .index("author_index", ["authorId"]),
    users: defineTable({
        email: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        name: v.string(),
    }),
    tasks: defineTable({
        title: v.string(),
        description: v.string(),
        completed: v.boolean(),
    })
});
