import { NotebookLayout } from '@/components/notebook/NotebookLayout';
import { useDemoData } from '@/hooks/useDemoData';

const Index = () => {
  useDemoData();
  return <NotebookLayout />;
};

export default Index;
