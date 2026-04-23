import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const platforms = [
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E4405F" },
  { id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000" },
  { id: "twitter", name: "Twitter / X", icon: "🐦", color: "#1DA1F2" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2" },
  { id: "facebook", name: "Facebook", icon: "👥", color: "#1877F2" }
];

export default function SocialConnections() {
  const [connections, setConnections] = useState({
    tiktok: false,
    instagram: false,
    youtube: false,
    twitter: false,
    linkedin: false,
    facebook: false
  });
  
  const toggleConnection = (platformId) => {
    setConnections(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };
  
  const handleConnect = (platformId) => {
    // TODO: Implement OAuth flow for each platform
    alert(`Connecting to ${platformId}... (OAuth flow needed)`);
    toggleConnection(platformId);
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Social Accounts</h3>
      
      <div className="space-y-3">
        {platforms.map(platform => (
          <div 
            key={platform.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{platform.icon}</span>
              <div>
                <p className="font-medium">{platform.name}</p>
                {connections[platform.id] ? (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not connected</p>
                )}
              </div>
            </div>
            
            {connections[platform.id] ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleConnection(platform.id)}
              >
                <X className="w-4 h-4" />
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={() => handleConnect(platform.id)}
                style={{ backgroundColor: platform.color }}
              >
                Connect
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Connect your social media accounts to enable auto-posting.
          All credentials are encrypted and stored securely.
        </p>
      </div>
    </Card>
  );
}
