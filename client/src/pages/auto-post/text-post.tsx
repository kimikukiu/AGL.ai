import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { generateContent } from "@/lib/github-models-api";

export default function AutoPostText() {
  const [prompt, setPrompt] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      const fullPrompt = `Create a ${platform} post about: ${prompt}.
      ${platform === 'twitter' ? 'Keep it under 280 characters, engaging, with hashtags.' :
        platform === 'linkedin' ? 'Professional tone, 500+ words, industry insights.' :
        'Engaging Instagram caption with emojis and hashtags.'}
      
      Optimize for ${platform} algorithm.`;
      
      const content = await generateContent(fullPrompt);
      setGeneratedPost(content);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Text Post</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="twitter">Twitter / X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Post Topic / Idea</label>
            <Textarea 
              placeholder="What do you want to post about?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "🤖 Generate Post with AI "}
          </Button>
        </div>
      </Card>
      
      {generatedPost && (
        <Card className="p-6">
          <h4 className="font-semibold mb-2">Generated Post for {platform}:</h4>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {generatedPost}
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1">
              🚀 Post Now
            </Button>
            <Button variant="outline" className="flex-1">
              ⏰ Schedule Post
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
