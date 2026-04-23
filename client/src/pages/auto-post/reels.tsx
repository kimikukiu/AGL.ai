import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { generateContent } from "@/lib/github-models-api";

export default function AutoPostReels() {
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Create a viral TikTok/Instagram Reel script about: ${topic}. 
      Include: catchy hook, engaging content, trending hashtags, and call-to-action.`;
      
      const content = await generateContent(prompt);
      setGeneratedContent(content);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePost = async () => {
    // TODO: Post to selected social platforms
    alert("Posting to connected platforms...");
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Reel Content</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Topic or Idea</label>
            <Textarea 
              placeholder="Enter topic for your Reel (e.g., '5 productivity hacks', 'morning routine')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !topic}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "🤖 Generate with AI "}
          </Button>
        </div>
      </Card>
      
      {generatedContent && (
        <Card className="p-6">
          <h4 className="font-semibold mb-2">Generated Content:</h4>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {generatedContent}
          </div>
          <Button onClick={handlePost} className="mt-4 w-full">
            🚀 Post to Social Media
          </Button>
        </Card>
      )}
    </div>
  );
}
