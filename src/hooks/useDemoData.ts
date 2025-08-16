import { useEffect } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { User, Notebook } from '@/types/notebook';

export const useDemoData = () => {
  const { setUser, setNotebook, addCell } = useNotebookStore();

  useEffect(() => {
    // Set demo user
    const demoUser: User = {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };

    // Set demo notebook
    const demoNotebook: Notebook = {
      id: 'demo-notebook',
      title: 'My First Notebook',
      contentJson: [],
      ownerId: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setUser(demoUser);
    setNotebook(demoNotebook);

    // Add some demo cells
    setTimeout(() => {
      addCell('text', 0);
      addCell('llm', 1);
      addCell('code', 2);
    }, 100);
  }, [setUser, setNotebook, addCell]);
};