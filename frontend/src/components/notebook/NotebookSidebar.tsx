import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, X, FileText, Upload, Link as LinkIcon, Loader, Network, Eye, TreePine, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import { toast } from 'sonner';
import 'reactflow/dist/style.css';

// Types
interface ScrapedData {
  scraped_content: {
    url: string;
    title: string;
    sections: Array<{
      title: string;
      content: string;
      keywords: string[];
    }>;
    full_text: string;
    word_count: number;
  };
  summary: {
    summary: string;
    key_concepts: string[];
    method: string;
  };
  mind_maps: {
    visual: string;
    network: string;
    hierarchical: string;
  };
}

const BACKEND_URL = 'http://127.0.0.1:8000';

export const NotebookSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteError, setWebsiteError] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState('');

  // Remove file by index
  const handleRemoveFile = (idxToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, idx) => idx !== idxToRemove));
  };

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFiles(prev => [...prev, file]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        // Note: This endpoint doesn't exist in your FastAPI backend yet
        // You might want to add file upload functionality to your backend
        const res = await fetch(`${BACKEND_URL}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        console.log('Backend response:', data);
        toast.success('File uploaded successfully');
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file');
      }
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 1 minute with 2-second intervals

    while (attempts < maxAttempts) {
      try {
        const statusRes = await fetch(`${BACKEND_URL}/job/${jobId}`);
        if (!statusRes.ok) throw new Error('Failed to fetch job status');
        
        const statusData = await statusRes.json();
        setProgress(statusData.progress);
        setJobStatus(statusData.status);

        if (statusData.status === 'completed') {
          return statusData.result;
        }
        
        if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Scrape job failed');
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        throw error;
      }
    }
    
    throw new Error('Job timed out');
  };

  // Website scrape handler
  const handleWebsiteSubmit = async () => {
    if (websiteUrl.trim() === '') {
      setWebsiteError(true);
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(websiteUrl);
    } catch {
      setWebsiteError(true);
      toast.error('Please enter a valid URL');
      return;
    }

    setWebsiteError(false);
    setLoading(true);
    setProgress(0);
    setJobStatus('queued');

    try {
      // Start the scraping job
      const res = await fetch(`${BACKEND_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: websiteUrl,
          summary_length: 300 
        }),
      });

      if (!res.ok) throw new Error('Failed to start scraping job');

      const { job_id } = await res.json();
      toast.success('Scraping started...');

      // Poll for results
      const result = await pollJobStatus(job_id);
      setScrapedData(result);
      toast.success('Website scraped and analyzed successfully!');
      
    } catch (error) {
      console.error('Error scraping website:', error);
      toast.error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setProgress(0);
      setJobStatus('');
    }
  };

  const downloadMindMap = (type: 'visual' | 'network' | 'hierarchical', filename: string) => {
    if (!scrapedData) return;
    
    const content = scrapedData.mind_maps[type];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearScrapedData = () => {
    setScrapedData(null);
    toast.success('Scraped data cleared');
  };

  return (
    <div className="w-80 bg-notebook-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Sources</h2>
          <Button size="sm" variant="ghost">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 w-full"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <Upload className="w-4 h-4" />
            Add Files
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-2">
            <Search className="w-4 h-4" /> Discover
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search sources..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-surface"
        />
      </div>

      {/* Upload & Website */}
      <div className="p-4 border-b border-border space-y-3">
        <div>
          <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
          <Button
            variant="outline"
            className="gap-2 w-full"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <Upload className="w-4 h-4" />
             Upload a source
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter website URL..."
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
            disabled={loading}
          />
          <Button
            onClick={handleWebsiteSubmit}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
          </Button>
        </div>
        {websiteError && <p className="text-red-500 text-sm mt-1">Please enter a website URL</p>}
        
        {loading && (
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Progress: {progress}% - {jobStatus}
            </p>
          </div>
        )}
      </div>

      {/* Content & Mind Map */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Uploaded Sources</h3>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface p-2 rounded-md">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="ml-auto text-red-500 hover:text-red-700 shrink-0"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {scrapedData && (
          <div className="space-y-3">
            {/* Scraped Website Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground text-sm">Scraped Website</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearScrapedData}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-surface p-3 rounded-md">
                <p className="text-sm text-foreground font-medium truncate">
                  {scrapedData.scraped_content.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {scrapedData.summary?.summary || 'No summary available'}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Words: {scrapedData.scraped_content.word_count}</span>
                  <span>•</span>
                  <span>{scrapedData.summary.method}</span>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            {scrapedData.summary?.key_concepts && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Key Concepts
                </h4>
                <div className="flex flex-wrap gap-1">
                  {scrapedData.summary.key_concepts.slice(0, 6).map((concept, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0 h-5">
                      {concept}
                    </Badge>
                  ))}
                  {scrapedData.summary.key_concepts.length > 6 && (
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                      +{scrapedData.summary.key_concepts.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Mind Maps */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mind Maps
              </h4>
              <Tabs defaultValue="visual" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="visual" className="text-xs h-6">
                    <Eye className="w-3 h-3 mr-1" />
                    Visual
                  </TabsTrigger>
                  <TabsTrigger value="network" className="text-xs h-6">
                    <Network className="w-3 h-3 mr-1" />
                    Network
                  </TabsTrigger>
                  <TabsTrigger value="hierarchical" className="text-xs h-6">
                    <TreePine className="w-3 h-3 mr-1" />
                    Tree
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="visual" className="space-y-2 mt-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(scrapedData.mind_maps.visual)}
                      className="text-xs h-6 px-2"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMindMap('visual', 'visual-mindmap.txt')}
                      className="text-xs h-6 px-2"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono max-h-40">
                    {scrapedData.mind_maps.visual}
                  </pre>
                </TabsContent>
                
                <TabsContent value="network" className="space-y-2 mt-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(scrapedData.mind_maps.network)}
                      className="text-xs h-6 px-2"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMindMap('network', 'network-mindmap.txt')}
                      className="text-xs h-6 px-2"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono max-h-40">
                    {scrapedData.mind_maps.network}
                  </pre>
                </TabsContent>
                
                <TabsContent value="hierarchical" className="space-y-2 mt-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(scrapedData.mind_maps.hierarchical)}
                      className="text-xs h-6 px-2"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMindMap('hierarchical', 'tree-mindmap.txt')}
                      className="text-xs h-6 px-2"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap font-mono max-h-40">
                    {scrapedData.mind_maps.hierarchical}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {!scrapedData && selectedFiles.length === 0 && !loading && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Saved sources will appear here
              </p>
              <p className="text-xs text-muted-foreground">
                Click Add source above to add PDFs, websites, text, videos, or audio files.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};