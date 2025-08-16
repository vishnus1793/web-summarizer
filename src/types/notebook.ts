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

export type CellType = 'text' | 'code' | 'llm';

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

export type NotebookCell = TextCell | CodeCell | LLMCell;

export interface NotebookState {
  currentNotebook: Notebook | null;
  cells: NotebookCell[];
  selectedCellId: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}