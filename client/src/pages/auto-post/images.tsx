import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { generateContent } from "@/lib/github-models-api";

export default function AutoPostImages() {
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    try {
      const content = await generateContent(
        `Create a detailed image description for: ${prompt}. 
        Include: visual elements, style, colors, mood, and composition.`
      );
      setDescription(content);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Image Post</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Image Description Prompt</label>
            <Input 
              placeholder="Describe the image you want (e.g., 'sunset over mountains')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "🤖 Generate Description (FREE)"}
          </Button>
        </div>
      </Card>
      
      {description && (
        <Card className="p-6">
          <h4 className="font-semibold mb-2">Generated Description:</h4>
          <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
            {description}
          </div>
          <Button className="mt-4 w-full">
            🚀 Post Image with Description
          </Button>
        </Card>
      )}
    </div>
  );
}
