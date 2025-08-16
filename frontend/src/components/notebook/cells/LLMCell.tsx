import { useState, useEffect, useRef } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { LLMCell as LLMCellType } from '@/types/notebook';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Send, Square, Loader2 } from 'lucide-react';

interface LLMCellProps {
  cell: LLMCellType;
}

const GEMINI_MODELS = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
];

// Replace with your Gemini API Key here
const GEMINI_API_KEY = "AIzaSyDwfaxEP-Ji9CA6eXwptj9wyjBuS6AhDLE";

export const LLMCell = ({ cell }: LLMCellProps) => {
  const { updateCell } = useNotebookStore();
  const [prompt, setPrompt] = useState(cell.prompt);
  const [response, setResponse] = useState(cell.response || '');
  const [model, setModel] = useState(cell.model || 'gemini-1.5-pro');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrompt(cell.prompt);
    setResponse(cell.response || '');
    setModel(cell.model || 'gemini-1.5-pro');
  }, [cell.prompt, cell.response, cell.model]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [streamingText, response]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    updateCell(cell.id, { prompt: value });
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    updateCell(cell.id, { response: streamingText, isStreaming: false });
    setResponse(streamingText);
    setStreamingText('');
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isStreaming) return;

    setIsStreaming(true);
    setStreamingText('');
    updateCell(cell.id, { isStreaming: true });

    try {
      const res = await fetch("https://generativeai.googleapis.com/v1beta2/models/" + model + ":generateText", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            text: prompt,
          },
          temperature: 0.7,
          maxOutputTokens: 500
        }),
      });

      const data = await res.json();
      // Gemini returns choices array
      const textResponse = data?.candidates?.[0]?.content || "No response";

      // Simulate streaming token by token
      let i = 0;
      const interval = setInterval(() => {
        if (i < textResponse.length) {
          setStreamingText(prev => prev + textResponse[i]);
          i++;
        } else {
          clearInterval(interval);
          stopStreaming();
        }
      }, 10); // adjust speed

    } catch (error) {
      console.error("Failed to fetch Gemini:", error);
      setIsStreaming(false);
      updateCell(cell.id, { isStreaming: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isStreaming) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="w-4 h-4" />
          <span>LLM Cell</span>
        </div>
        <Select value={model} onValueChange={(val) => { setModel(val); updateCell(cell.id, { model: val }); }}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GEMINI_MODELS.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Prompt</label>
          <Button onClick={isStreaming ? stopStreaming : handleSubmit} disabled={!prompt.trim()} size="sm" variant={isStreaming ? "destructive" : "default"} className="gap-2">
            {isStreaming ? <><Square className="w-4 h-4" />Stop</> : <><Send className="w-4 h-4" />Send</>}
          </Button>
        </div>

        <Textarea value={prompt} onChange={(e) => handlePromptChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask Google Gemini anything..." className="min-h-[80px] bg-background/50 border-border resize-none" />

        <div className="text-xs text-muted-foreground">Press Ctrl+Enter to send</div>
      </div>

      {/* Response */}
      {(response || streamingText || isStreaming) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Response</label>
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </div>
            )}
          </div>
          <div ref={responseRef} className="max-h-96 overflow-y-auto p-4 rounded-md bg-background/30 border border-border">
            <div className="prose prose-sm max-w-none prose-invert whitespace-pre-wrap">
              {isStreaming ? streamingText : response}
              {isStreaming && <span className="animate-pulse">▋</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
