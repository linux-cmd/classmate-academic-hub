import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Folder, Plus, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notebook } from '@/hooks/useNotes';

interface NotebookSidebarProps {
  notebooks: Notebook[];
  selectedNotebook: string | null;
  onSelectNotebook: (id: string | null) => void;
  onCreateNotebook: (title: string) => Promise<void>;
}

export const NotebookSidebar = ({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  onCreateNotebook
}: NotebookSidebarProps) => {
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const handleCreate = async () => {
    if (!newNotebookTitle.trim()) return;
    
    await onCreateNotebook(newNotebookTitle);
    setNewNotebookTitle('');
    setShowDialog(false);
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Notebooks</h3>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Notebook</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Notebook name"
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!newNotebookTitle.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <Button
            variant={selectedNotebook === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectNotebook(null)}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            All Notes
          </Button>

          {notebooks.map((notebook) => (
            <Button
              key={notebook.id}
              variant={selectedNotebook === notebook.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectNotebook(notebook.id)}
            >
              <Folder className="w-4 h-4 mr-2" />
              <span className="truncate">{notebook.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
