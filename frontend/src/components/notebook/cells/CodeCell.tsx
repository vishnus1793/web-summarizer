import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { useNotebookStore } from '@/stores/notebookStore';
import { CodeCell as CodeCellType } from '@/types/notebook';
import { Button } from '@/components/ui/button';
import { Code, Play, Loader2 } from 'lucide-react';

interface CodeCellProps {
  cell: CodeCellType;
}

export const CodeCell = ({ cell }: CodeCellProps) => {
  const { updateCell } = useNotebookStore();
  const [content, setContent] = useState(cell.content);
  const [language, setLanguage] = useState(cell.language);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(cell.explanation || '');

  useEffect(() => {
    setContent(cell.content);
    setLanguage(cell.language);
    setExplanation(cell.explanation || '');
  }, [cell.content, cell.language, cell.explanation]);

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    updateCell(cell.id, { content: newContent });
  };

  const handleSubmit = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/code/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: content, language }),
      });

      if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

      const data = await res.json();
      const explanationText = data?.explanation || 'No explanation received';

      setExplanation(explanationText);
      updateCell(cell.id, { explanation: explanationText });
    } catch (error) {
      console.error('❌ Failed to get explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Cell header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code className="w-4 h-4" />
          <span>Code Cell</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Explain
          </Button>
        </div>
      </div>

      {/* Code editor */}
      <div className="border border-border rounded-md overflow-hidden bg-background/50">
        <Editor
          height="200px"
          language={language}
          value={content}
          onChange={handleContentChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            scrollbar: { vertical: 'auto', horizontal: 'auto' },
          }}
        />
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="p-3 rounded-md bg-background/30 border border-border prose prose-sm max-w-none prose-invert whitespace-pre-wrap">
          <strong>Explanation:</strong>
          <div>{explanation}</div>
        </div>
      )}
    </div>
  );
};
