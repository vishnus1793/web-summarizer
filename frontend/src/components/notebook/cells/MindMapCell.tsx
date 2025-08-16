import { useState } from 'react';
import { MindMapCell as MindMapCellType } from '@/types/notebook';
import { useNotebookStore } from '@/stores/notebookStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Globe, 
  Loader2, 
  Copy, 
  Download,
  RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '@/services/api';

interface MindMapCellProps {
  cell: MindMapCellType;
}

export const MindMapCell = ({ cell }: MindMapCellProps) => {
  const { updateCell, selectedCellId } = useNotebookStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [url, setUrl] = useState(cell.url || '');
  const isSelected = selectedCellId === cell.id;

  const handleGenerateMindMap = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsGenerating(true);
    try {
      updateCell(cell.id, { isGenerating: true });
      
      const data = await ApiService.processUrl(url, 300, 'all');
      
      updateCell(cell.id, {
        url,
        title: data.title,
        mindmapData: data.mindmap,
        keyConcepts: data.summary.key_concepts,
        summary: data.summary.text,
        isGenerating: false
      });
      
      toast.success('Mind map generated successfully!');
    } catch (error) {
      console.error('Error generating mind map:', error);
      toast.error(`Failed to generate mind map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      updateCell(cell.id, { isGenerating: false });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} mind map copied to clipboard!`);
  };

  const downloadMindMap = (text: string, type: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${type}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${type} mind map downloaded!`);
  };

  return (
    <Card className={`p-4 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <span className="font-medium text-sm text-muted-foreground">Mind Map</span>
        {cell.title && (
          <Badge variant="outline" className="ml-auto">
            {cell.title}
          </Badge>
        )}
      </div>

      {/* URL Input */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter URL to analyze and create mind map..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleGenerateMindMap();
                }
              }}
            />
          </div>
          <Button 
            onClick={handleGenerateMindMap} 
            disabled={isGenerating || !url.trim()}
            size="default"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Key Concepts */}
        {cell.keyConcepts && cell.keyConcepts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Key Concepts:</h4>
            <div className="flex flex-wrap gap-1">
              {cell.keyConcepts.map((concept, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {concept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {cell.summary && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Summary:</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 rounded p-3">
              {cell.summary}
            </p>
          </div>
        )}

        {/* Mind Maps */}
        {cell.mindmapData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-foreground">Generated Mind Maps:</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleGenerateMindMap()}
                disabled={isGenerating}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
            
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {cell.mindmapData.visual && (
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                )}
                {cell.mindmapData.network && (
                  <TabsTrigger value="network">Network</TabsTrigger>
                )}
                {cell.mindmapData.hierarchical && (
                  <TabsTrigger value="hierarchical">Tree</TabsTrigger>
                )}
              </TabsList>

              {cell.mindmapData.visual && (
                <TabsContent value="visual" className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cell.mindmapData!.visual!, 'Visual')}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMindMap(cell.mindmapData!.visual!, 'visual')}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted rounded p-4 overflow-auto whitespace-pre-wrap max-h-96 font-mono">
                    {cell.mindmapData.visual}
                  </pre>
                </TabsContent>
              )}

              {cell.mindmapData.network && (
                <TabsContent value="network" className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cell.mindmapData!.network!, 'Network')}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMindMap(cell.mindmapData!.network!, 'network')}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted rounded p-4 overflow-auto whitespace-pre-wrap max-h-96 font-mono">
                    {cell.mindmapData.network}
                  </pre>
                </TabsContent>
              )}

              {cell.mindmapData.hierarchical && (
                <TabsContent value="hierarchical" className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cell.mindmapData!.hierarchical!, 'Hierarchical')}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMindMap(cell.mindmapData!.hierarchical!, 'hierarchical')}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted rounded p-4 overflow-auto whitespace-pre-wrap max-h-96 font-mono">
                    {cell.mindmapData.hierarchical}
                  </pre>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </Card>
  );
};
