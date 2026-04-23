import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutoPostReels from "@/pages/auto-post/reels";
import AutoPostImages from "@/pages/auto-post/images";
import AutoPostVideos from "@/pages/auto-post/videos";
import AutoPostText from "@/pages/auto-post/text-post";
import SocialConnections from "@/pages/auto-post/social-connections";

export default function AutoPostPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Auto Post - Social Media</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Social Connections Sidebar */}
        <div className="md:col-span-1">
          <SocialConnections />
        </div>
        
        {/* Main Content Area */}
        <div className="md:col-span-3">
          <Tabs defaultValue="reels" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reels">Reels</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="text">Text Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reels">
              <AutoPostReels />
            </TabsContent>
            
            <TabsContent value="images">
              <AutoPostImages />
            </TabsContent>
            
            <TabsContent value="videos">
              <AutoPostVideos />
            </TabsContent>
            
            <TabsContent value="text">
              <AutoPostText />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
