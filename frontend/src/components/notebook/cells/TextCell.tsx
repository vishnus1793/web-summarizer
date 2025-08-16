import { useState, useEffect } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { TextCell as TextCellType } from '@/types/notebook';
import { Textarea } from '@/components/ui/textarea';
import { Type } from 'lucide-react';
import { toast } from 'sonner';

interface TextCellProps {
  cell: TextCellType;
}

const BACKEND_URL = 'http://127.0.0.1:8000'; // your FastAPI backend

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

      let result = null;
      while (!result) {
        await new Promise((r) => setTimeout(r, 2000));
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


export const TextCell = ({ cell }: TextCellProps) => {
  const { updateCell } = useNotebookStore();
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
      // Optionally send updated content to backend
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

  return (
    <div className="space-y-3">
      {/* Cell header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Type className="w-4 h-4" />
        <span>Text Cell</span>
      </div>

      {/* Content */}
      {isEditing || !content ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text content here..."
            className="min-h-[100px] bg-background/50 border-border resize-none"
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
          <div className="whitespace-pre-wrap p-3 rounded-md bg-background/30 hover:bg-background/50 transition-colors">
            {content || 'Click to add text...'}
          </div>
        </div>
      )}
    </div>
  );
};
