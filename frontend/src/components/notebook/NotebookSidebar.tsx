import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, X, FileText, Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Types
interface MindMapNode {
  id: string;
  label: string;
}

interface MindMapEdge {
  source: string;
  target: string;
}

interface ScrapedData {
  scraped_content: { title: string };
  summary?: {
    summary: string;
    key_concepts: string[];
  };
  mind_maps?: {
    network?: {
      data: { nodes: MindMapNode[]; edges: MindMapEdge[] };
    };
  };
}

export const NotebookSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteError, setWebsiteError] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);

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
        const res = await fetch('http://localhost:5000/upload', { method: 'POST', body: formData });
        const data = await res.json();
        console.log('Backend response:', data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  // Website scrape handler
  const handleWebsiteSubmit = async () => {
    if (websiteUrl.trim() === '') {
      setWebsiteError(true);
      return;
    }
    setWebsiteError(false);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const { job_id } = await res.json();

      let result: ScrapedData | null = null;
      while (!result) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`http://localhost:8000/job/${job_id}`);
        const statusData = await statusRes.json();

        if (statusData.status === 'completed') {
          result = statusData.result;
          break;
        }
        if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Scrape job failed');
        }
      }

      setScrapedData(result);
    } catch (error) {
      console.error('Error scraping website:', error);
      alert('Failed to scrape website.');
    } finally {
      setLoading(false);
      setWebsiteUrl('');
    }
  };

  // Convert backend mindmap to React Flow elements
  const reactFlowElements = useMemo(() => {
    if (!scrapedData?.mind_maps?.network?.data) return [];
    const { nodes, edges } = scrapedData.mind_maps.network.data;

    const flowNodes: Node[] = nodes.map((n, idx) => ({
      id: n.id,
      data: { label: n.label },
      position: { x: 50 + (idx % 5) * 150, y: Math.floor(idx / 5) * 100 },
    }));

    const flowEdges: Edge[] = edges.map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      animated: true,
    }));

    return [...flowNodes, ...flowEdges];
  }, [scrapedData]);

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
      </div>

      {/* Content & Mind Map */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Uploaded Sources</h3>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface p-2 rounded-md">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="ml-auto text-red-500 hover:text-red-700"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {scrapedData && (
          <div className="space-y-2 mt-4">
            <h3 className="font-medium text-foreground">Scraped Website</h3>
            <p className="text-sm text-foreground font-semibold">{scrapedData.scraped_content.title}</p>
            <p className="text-xs text-muted-foreground">
              {scrapedData.summary?.summary || 'No summary available'}
            </p>
            {scrapedData.summary?.key_concepts && (
              <div className="flex flex-wrap gap-2 mt-2">
                {scrapedData.summary.key_concepts.map((concept, idx) => (
                  <span key={idx} className="bg-surface px-2 py-1 rounded text-xs text-foreground">
                    {concept}
                  </span>
                ))}
              </div>
            )}

            {reactFlowElements.length > 0 && (
              <div className="h-64 w-full border border-border rounded mt-4">
                <ReactFlow nodes={reactFlowElements.filter(n => (n as Node).data)}
                           edges={reactFlowElements.filter(e => (e as Edge).source && (e as Edge).target)}
                           fitView>
                  <MiniMap />
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            )}
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
