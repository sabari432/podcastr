 "use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import GeneratePodcast from "@/components/GeneratePodcast";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];
const podcastCategories = [
  "business",
  "technology",
  "comedy",
  "education",
  "hobbies",
  "government",
  "mental health",
  "family",
  "music",
  "politics",
  "spirituality",
  "culture",
  "arts",
];

const formSchema = z.object({
  podcastTitle: z.string().min(2),
  podcastDescription: z.string().min(2),
});

const CreatePodcast = () => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Podcast state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [voiceType, setVoiceType] = useState<string | null>(null);
  const [categoryType, setCategoryType] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [podcastLimitExceeded, setPodcastLimitExceeded] = useState(false);

  // Get user from Convex
  const convexUser = useQuery(api.users.getUserById, user?.id ? { clerkId: user.id } : "skip");

  // Ensure convexUser exists before making the second query
  const podcasts = useQuery(api.podcasts.getUserPodcasts, convexUser ? { userId: convexUser._id } : "skip");

  // Mutation to create a podcast
  const createPodcast = useMutation(api.podcasts.createPodcast);

  // React Hook Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcastTitle: "",
      podcastDescription: "",
    },
  });

  useEffect(() => {
    if (user && podcasts) {
      const emailMatches = user?.primaryEmailAddress?.emailAddress === "23mx211@psgtech.ac.in";
      const hasPodcast = podcasts.length >= 1;

      // Only users with a specific email can create more than 1 podcast
      setPodcastLimitExceeded(hasPodcast && !emailMatches);
    }
  }, [user, podcasts]);

  // Handle form submission
  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (podcastLimitExceeded) {
      toast({ title: "Limit exhausted", description: "You can only create 1 podcast." });
      return;
    }

    if (!audioUrl || !imageUrl || !voiceType || !categoryType) {
      toast({ title: "Please generate audio and image before submitting." });
      return;
    }

    try {
      setIsSubmitting(true);

      await createPodcast({
        podcastTitle: data.podcastTitle,
        podcastDescription: data.podcastDescription,
        audioUrl,
        imageUrl,
        voiceType,
        categoryType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
      });

      toast({ title: "Podcast created successfully!" });
      router.push("/");
    } catch (error) {
      console.error("Podcast creation error:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-24 font-extrabold bg-gradient-to-r from-[#D4D925] to-gray-300 text-transparent bg-clip-text drop-shadow-lg animate-pulse">
      Create Podcast
      </h1>


      {podcastLimitExceeded ? (
        <p className="text-red-500">You have exhausted your podcast creation limit.</p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-12 flex w-full flex-col">
            <FormField control={form.control} name="podcastTitle" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-orange-1">Title</FormLabel>
                <FormControl>
                  <Input className="bg-gray-800" placeholder="Enter podcast title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="podcastDescription" render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-orange-1">Description</FormLabel>
                <FormControl>
                  <Textarea className="bg-gray-800" placeholder="Write a short podcast description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="mt-6 flex flex-col gap-2">
              <Label className="text-orange-1">Select AI Voice</Label>
              <Select onValueChange={setVoiceType}>
                <SelectTrigger className="w-full text-white-1 bg-gray-800 text-white border border-gray-700 rounded-lg p-3">
                  <SelectValue className="text-white-1" placeholder="Select AI Voice" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border border-gray-700 rounded-lg">
                  {voiceCategories.map((category) => (
                    <SelectItem key={category} value={category} className="p-2 hover:bg-gray-700 text-white-1">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <GeneratePodcast
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
            />

            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />

            <Button className="text-lg font-bold bg-orange-1 text-white-1 mt-5" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit & Publish Podcast"}
            </Button>
          </form>
        </Form>
      )}
    </section>
  );
};

export default CreatePodcast;