import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { MindMapCell } from './MindMapCell'; // adjust path
import { MindMapCellType } from '@/types/notebook';
import { toast } from 'sonner';
import { BarChart3, Video, Brain, FileText, ChevronDown } from 'lucide-react';

export const NotebookStudio = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // MindMap states
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [cellData, setCellData] = useState<MindMapCellType | null>(null);

  // Load list of JSON files
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await fetch('/api/mindmap-files'); // API route returns filenames from /scraped_data
        if (!res.ok) throw new Error('Failed to fetch file list');
        const fileList: string[] = await res.json();
        setFiles(fileList);
        if (fileList.length > 0) setSelectedFile(fileList[0]);
      } catch (err) {
        console.error(err);
        toast.error('Could not load mind map files');
      }
    };
    loadFiles();
  }, []);

  // Load selected JSON
  useEffect(() => {
    const loadJson = async () => {
      if (!selectedFile) return;
      try {
        const res = await fetch(`/api/mindmap-file?name=${encodeURIComponent(selectedFile)}`); 
        if (!res.ok) throw new Error('Failed to load JSON file');
        const json = await res.json();
        setCellData({
          id: selectedFile,
          title: json.title,
          mindmapData: json.mindmap,
          keyConcepts: json.summary?.key_concepts || [],
          summary: json.summary?.text || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load mind map data');
      }
    };
    loadJson();
  }, [selectedFile]);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-notebook-studio border-l border-border flex flex-col items-center py-4">
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(false)} className="rotate-180">
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
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)}>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Studio tools */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="p-2"><BarChart3 className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="audio" className="p-2">
              <div className="w-4 h-4 flex flex-col justify-center">
                <div className="h-0.5 bg-current mb-0.5" />
                <div className="h-1 bg-current mb-0.5" />
                <div className="h-0.5 bg-current" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="video" className="p-2"><Video className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="mindmap" className="p-2"><Brain className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Audio Overview</p>
                <p className="text-xs text-muted-foreground">
                  Studio output will be saved here. After adding sources, click to add Audio Overview, Study Guide, Mind Map, and more!
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
                <p className="text-xs text-muted-foreground">Generate an audio summary of your sources</p>
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
                <p className="text-xs text-muted-foreground">Create a video presentation of your content</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mindmap" className="space-y-4">
            {/* Mind Map Header */}
            <div className="text-center space-y-2 py-4">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Mind Map</p>
              <p className="text-xs text-muted-foreground">Visualize your JSON content in a tree structure</p>
            </div>

            {/* JSON selector */}
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a JSON file" />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file} value={file}>{file}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* MindMap visualization */}
            {cellData && <MindMapCell cell={cellData} />}
          </TabsContent>
        </Tabs>

        {/* Reports dropdown */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" className="w-full justify-between gap-2">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4" />Reports</div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
