import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { generateContent } from "@/lib/github-models-api";

export default function AutoPostVideos() {
  const [topic, setTopic] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Create a YouTube/TikTok video script about: ${topic}.
      Include: hook, introduction, main content (3-5 points), conclusion, CTA.
      Format with timestamps.`;
      
      const content = await generateContent(prompt);
      setGeneratedScript(content);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Video Script</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Video Topic</label>
            <Textarea 
              placeholder="Enter video topic (e.g., 'How to use AI tools', '10 coding tips')"
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
            {isGenerating ? "Generating..." : "🤖 Generate Script with AI (FREE)"}
          </Button>
        </div>
      </Card>
      
      {generatedScript && (
        <Card className="p-6">
          <h4 className="font-semibold mb-2">Generated Script:</h4>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {generatedScript}
          </div>
          <Button className="mt-4 w-full">
            🚀 Post Video Script
          </Button>
        </Card>
      )}
    </div>
  );
}
