import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { GeneratePodcastProps } from "@/types";
import { useAction, useMutation } from "convex/react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useUploadFiles } from "@xixixao/uploadstuff/react";

const useGeneratePodcast = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const getPodcastAudio = useAction(api.openai.generatedAudioAction);
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const generatePodcast = async () => {
    console.log("🎤 Generating Podcast with:", { voiceType, voicePrompt });

    setIsGenerating(true);
    setAudio("");

    if (!voiceType) {
      console.error("❌ Missing voiceType");
      toast({
        title: "Please provide a voice type to generate a podcast",
      });
      setIsGenerating(false);
      return;
    }

    if (!voicePrompt) {
      console.error("❌ Missing voicePrompt");
      toast({
        title: "Please provide a voice prompt to generate a podcast",
      });
      setIsGenerating(false);
      return;
    }

    try {
      console.log("🚀 Sending request to OpenAI API...");
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt,
      });

      console.log("✅ API Response received:", response);

      const blob = new Blob([response], { type: "audio/mpeg" });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: "audio/mpeg" });

      console.log("📂 Created File:", file);

      const uploaded = await startUpload([file]);
      console.log("📤 Uploaded File Response:", uploaded);

      if (!uploaded || !uploaded[0] || !(uploaded[0].response as any).storageId) {
        console.error("❌ Upload failed: No storage ID returned");
        toast({
          title: "Error uploading file",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const storageId = (uploaded[0].response as any).storageId;
      setAudioStorageId(storageId);
      console.log("🔑 Storage ID:", storageId);

      console.log("🔍 Fetching audio URL...");
      const audioUrl = await getAudioUrl({ storageId });

      if (!audioUrl) {
        console.error("❌ Error: No audio URL returned");
        toast({
          title: "Failed to retrieve audio URL",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      console.log("🔗 Audio URL:", audioUrl);
      setAudio(audioUrl);
      setIsGenerating(false);

      toast({
        title: "Podcast generated successfully",
      });
    } catch (error) {
      console.error("❌ Error generating podcast:", error);
      toast({
        title: "Error creating a podcast",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  return { isGenerating, generatePodcast };
};

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);
  const [localVoicePrompt, setLocalVoicePrompt] = useState(props.voicePrompt);

  useEffect(() => {
    setLocalVoicePrompt(props.voicePrompt);
  }, [props.voicePrompt]);

  const handleVoicePromptChange = (e: any) => {
    const newValue = e.target.value;
    setLocalVoicePrompt(newValue);
    props.setVoicePrompt(newValue);
    props.setFormValue?.("voicePrompt", newValue);
  };

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-orange-1 mt-5">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light bg-gray-100 focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate audio"
          rows={5}
          value={localVoicePrompt}
          onChange={handleVoicePromptChange}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-lg bg-orange-1 py-4 font-bold text-white-1"
          onClick={generatePodcast}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) =>
            props.setAudioDuration(e.currentTarget.duration)
          }
        />
      )}
    </div>
  );
};

export default GeneratePodcast;
