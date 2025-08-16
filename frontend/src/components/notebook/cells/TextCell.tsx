import { useState, useEffect } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { TextCell as TextCellType } from '@/types/notebook';
import { Textarea } from '@/components/ui/textarea';
import { Type } from 'lucide-react';

interface TextCellProps {
  cell: TextCellType;
}

export const TextCell = ({ cell }: TextCellProps) => {
  const { updateCell } = useNotebookStore();
  const [content, setContent] = useState(cell.content);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setContent(cell.content);
  }, [cell.content]);

  const handleSave = () => {
    updateCell(cell.id, { content });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setContent(cell.content);
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
      {isEditing || !cell.content ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter your text content here..."
            className="min-h-[100px] bg-background/50 border-border resize-none"
            autoFocus={!cell.content}
          />
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to save, Esc to cancel4
          </div>
        </div>
      ) : (
        <div
          className="prose prose-sm max-w-none prose-invert cursor-text"
          onClick={() => setIsEditing(true)}
        >
          <div className="whitespace-pre-wrap p-3 rounded-md bg-background/30 hover:bg-background/50 transition-colors">
            {cell.content || 'Click to add text...'}
          </div>
        </div>
      )}
    </div>
  );
};