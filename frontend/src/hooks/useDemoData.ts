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
      name: 'Leo Das',
      avatar: 'https://pbs.twimg.com/profile_images/1848301739809861632/DiTFQD4H_400x400.jpg'};

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