import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Video, 
  Brain, 
  FileText,
  ChevronDown 
} from 'lucide-react';

export const NotebookStudio = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-notebook-studio border-l border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="rotate-180"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-notebook-studio border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Studio</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Studio tools */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="p-2">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="audio" className="p-2">
              <div className="w-4 h-4 flex flex-col justify-center">
                <div className="h-0.5 bg-current mb-0.5" />
                <div className="h-1 bg-current mb-0.5" />
                <div className="h-0.5 bg-current" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="video" className="p-2">
              <Video className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="p-2">
              <Brain className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Audio Overview</p>
                <p className="text-xs text-muted-foreground">
                  Studio output will be saved here. After adding sources, 
                  click to add Audio Overview, Study Guide, Mind Map, and more!
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
                <div className="w-6 h-6 flex flex-col justify-center">
                  <div className="h-0.5 bg-muted-foreground mb-0.5" />
                  <div className="h-1 bg-muted-foreground mb-0.5" />
                  <div className="h-0.5 bg-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Audio Overview</p>
                <p className="text-xs text-muted-foreground">
                  Generate an audio summary of your sources
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
                <Video className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Video Overview</p>
                <p className="text-xs text-muted-foreground">
                  Create a video presentation of your content
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mindmap" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Mind Map</p>
                <p className="text-xs text-muted-foreground">
                  Visualize connections between your ideas
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reports dropdown */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};