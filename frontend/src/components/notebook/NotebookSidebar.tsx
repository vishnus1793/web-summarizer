import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const NotebookSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteError, setWebsiteError] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFiles((prev) => [...prev, file]);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        console.log('Backend response:', data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  // Handle website scrape
  const handleWebsiteSubmit = async () => {
    if (websiteUrl.trim() === '') {
      setWebsiteError(true);
      return;
    }
    setWebsiteError(false);
    setLoading(true);

    try {
      // Start scrape job
      const res = await fetch('http://localhost:8000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const { job_id } = await res.json();

      // Poll for job result
      let result = null;
      while (!result) {
        await new Promise((r) => setTimeout(r, 2000)); // 2s delay
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
          <Button size="sm" variant="outline" className="flex-1 gap-2">
            <Plus className="w-4 h-4" /> Add
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-surface"
        />
      </div>

      {/* Upload & Website */}
      <div className="p-4 border-b border-border space-y-3">
        {/* File Upload */}
        <div>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            className="gap-2 w-full"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <Upload className="w-4 h-4" />
            {selectedFiles.length > 0
              ? `${selectedFiles[selectedFiles.length - 1].name}`
              : 'Upload a source'}
          </Button>
        </div>

        {/* Website URL */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter website URL..."
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
          <Button onClick={handleWebsiteSubmit} variant="outline" size="sm">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
          </Button>
        </div>
        {websiteError && <p className="text-red-500 text-sm mt-1">Please enter a website URL</p>}
      </div>

      {/* Sources & Scraped Data */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Uploaded Sources</h3>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-surface p-2 rounded-md">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{file.name}</span>
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
                {scrapedData.summary.key_concepts.map((concept: string, idx: number) => (
                  <span key={idx} className="bg-surface px-2 py-1 rounded text-xs text-foreground">
                    {concept}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedFiles.length === 0 && !scrapedData && !loading && (
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
