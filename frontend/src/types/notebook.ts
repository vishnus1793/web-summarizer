export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  googleRefreshToken?: string;
}

export interface Notebook {
  id: string;
  title: string;
  contentJson: NotebookCell[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type CellType = 'text' | 'code' | 'llm' | 'mindmap';

export interface BaseCell {
  id: string;
  type: CellType;
  order: number;
}

export interface TextCell extends BaseCell {
  type: 'text';
  content: string;
}

export interface CodeCell extends BaseCell {
  type: 'code';
  content: string;
  language: string;
}

export interface LLMCell extends BaseCell {
  type: 'llm';
  prompt: string;
  response?: string;
  isStreaming?: boolean;
  model?: string;
}

export interface MindMapCell extends BaseCell {
  type: 'mindmap';
  url?: string;
  title: string;
  mindmapData?: {
    visual?: string;
    network?: string;
    hierarchical?: string;
    structured?: {
      root: {
        name: string;
        type: string;
      };
      nodes: Array<{
        id: string;
        name: string;
        type: string;
        parent: string;
      }>;
    };
  };
  keyConcepts?: string[];
  summary?: string;
  isGenerating?: boolean;
}

export type NotebookCell = TextCell | CodeCell | LLMCell | MindMapCell;

export interface NotebookState {
  currentNotebook: Notebook | null;
  cells: NotebookCell[];
  selectedCellId: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}