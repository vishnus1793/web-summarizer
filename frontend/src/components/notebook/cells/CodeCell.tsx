import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { useNotebookStore } from '@/stores/notebookStore';
import { CodeCell as CodeCellType } from '@/types/notebook';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Play } from 'lucide-react';

interface CodeCellProps {
  cell: CodeCellType;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
];

export const CodeCell = ({ cell }: CodeCellProps) => {
  const { updateCell } = useNotebookStore();
  const [content, setContent] = useState(cell.content);
  const [language, setLanguage] = useState(cell.language);

  useEffect(() => {
    setContent(cell.content);
    setLanguage(cell.language);
  }, [cell.content, cell.language]);

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    updateCell(cell.id, { content: newContent });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    updateCell(cell.id, { language: newLanguage });
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
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Play className="w-3 h-3" />
            Run
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
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
          }}
        />
      </div>
    </div>
  );
};