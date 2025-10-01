import { useState, useEffect } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { TextCell as TextCellType } from '@/types/notebook';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Globe, Loader2, Download, Eye, Network, TreePine } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from "jspdf";

interface TextCellProps {
  cell: TextCellType;
}

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

export const TextCell = ({ cell }: TextCellProps) => {
  const { updateCell } = useNotebookStore();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Website scraping state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [websiteError, setWebsiteError] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [showWebsiteInput, setShowWebsiteInput] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState('');

  // 🔹 Search history cache
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 🔹 Search inside summary
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Fetch the content from backend on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/get-text-cell?id=${encodeURIComponent(cell.id)}`);
        if (!res.ok) throw new Error('Failed to fetch cell content');
        const data = await res.json();
        setContent(data.content || '');
      } catch (err) {
        console.error(err);
        toast.error('Failed to load cell content');
      }
    };

    fetchContent();
  }, [cell.id]);

  const handleSave = async () => {
    try {
      await fetch(`${BACKEND_URL}/update-text-cell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cell.id, content }),
      });

      updateCell(cell.id, { content });
      setIsEditing(false);
      toast.success('Saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save content');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const pollJobStatus = async (jobId: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const statusRes = await fetch(`${BACKEND_URL}/job/${jobId}`);
        if (!statusRes.ok) throw new Error('Failed to fetch job status');
        
        const statusData = await statusRes.json();
        setProgress(statusData.progress);
        setJobStatus(statusData.status);

        if (statusData.status === 'completed') {
          setScrapedData(statusData.result);
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

  const handleWebsiteSubmit = async () => {
    if (websiteUrl.trim() === '') {
      setWebsiteError(true);
      toast.error('Please enter a valid URL');
      return;
    }

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

      const result = await pollJobStatus(job_id);

      const summaryContent = `# ${result.scraped_content.title}

**Source:** ${result.scraped_content.url}
**Word Count:** ${result.scraped_content.word_count}

## Summary
${result.summary.summary}

## Key Concepts
${result.summary.key_concepts.map((concept: string) => `- ${concept}`).join('\n')}`;

      setContent(summaryContent);
      setSearchHistory(prev => [...new Set([websiteUrl, ...prev])]); // 🔹 Add to history
      toast.success('Website scraped and analyzed successfully!');
      
    } catch (error) {
      console.error('Error scraping website:', error);
      toast.error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setWebsiteUrl('');
      setShowWebsiteInput(false);
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // 🔹 Export summary to PDF
  const exportToPDF = () => {
    if (!scrapedData) return;
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(12);

    doc.text(`Title: ${scrapedData.scraped_content.title}`, 10, 10);
    doc.text(`URL: ${scrapedData.scraped_content.url}`, 10, 20);
    doc.text("Summary:", 10, 40);
    doc.text(scrapedData.summary.summary, 10, 50, { maxWidth: 180 });

    doc.save("summary.pdf");
  };

  return (
    <div className="space-y-4">
      {/* Cell header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Type className="w-4 h-4" />
          <span>Text Cell</span>
        </div>
        
        <div className="flex items-center gap-2">
          {scrapedData && (
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWebsiteInput(!showWebsiteInput)}
            disabled={loading}
          >
            <Globe className="w-4 h-4 mr-1" />
            Scrape Website
          </Button>
        </div>
      </div>

      {/* Website input section */}
      {showWebsiteInput && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scrape Website Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  setWebsiteError(false);
                }}
                className={websiteError ? 'border-red-500' : ''}
                disabled={loading}
              />
              <Button 
                onClick={handleWebsiteSubmit}
                disabled={loading || !websiteUrl.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {jobStatus}...
                  </>
                ) : (
                  'Scrape'
                )}
              </Button>
            </div>

            {/* 🔹 Show history */}
            {searchHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((url, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setWebsiteUrl(url)}
                    >
                      {url}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {loading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Progress: {progress}% - {jobStatus}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isEditing || !content ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text content here... or scrape a website to get started!"
            className="min-h-[200px] bg-background/50 border-border resize-none"
            autoFocus={!content}
          />
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none prose-invert cursor-text"
          onClick={() => setIsEditing(true)}
        >
          <div className="whitespace-pre-wrap p-4 rounded-md bg-background/30 hover:bg-background/50 transition-colors">
            {content || 'Click to add text...'}
          </div>
        </div>
      )}

      {/* Mind Maps Display */}
      {scrapedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Mind Maps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Network
                </TabsTrigger>
                <TabsTrigger value="hierarchical" className="flex items-center gap-2">
                  <TreePine className="w-4 h-4" />
                  Tree
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="visual" className="space-y-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(scrapedData.mind_maps.visual)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadMindMap('visual', 'visual-mindmap.txt')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
                  {scrapedData.mind_maps.visual}
                </pre>
              </TabsContent>
              
              <TabsContent value="network" className="space-y-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(scrapedData.mind_maps.network)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadMindMap('network', 'network-mindmap.txt')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
                  {scrapedData.mind_maps.network}
                </pre>
              </TabsContent>
              
              <TabsContent value="hierarchical" className="space-y-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(scrapedData.mind_maps.hierarchical)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadMindMap('hierarchical', 'tree-mindmap.txt')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap">
                  {scrapedData.mind_maps.hierarchical}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Summary and Key Concepts */}
      {scrapedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated using: {scrapedData.summary.method}
              </p>
            </CardHeader>
            <CardContent>
              {/* 🔹 Search inside summary */}
              <Input
                placeholder="Search in summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              <p className="text-sm leading-relaxed">
                {scrapedData.summary.summary.split(new RegExp(`(${searchTerm})`, "gi")).map((part, i) =>
                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-300">{part}</mark>
                  ) : (
                    part
                  )
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {scrapedData.summary.key_concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
