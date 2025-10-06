import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { History, RotateCcw, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface VersionHistoryModalProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: () => void;
}

export const VersionHistoryModal = ({ noteId, open, onOpenChange, onRestore }: VersionHistoryModalProps) => {
  const { versions, loading, saveVersion, restoreVersion } = useVersionHistory(noteId);
  const [savingSummary, setSavingSummary] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSaveVersion = async () => {
    await saveVersion(savingSummary || undefined);
    setSavingSummary('');
    setShowSaveInput(false);
  };

  const handleRestore = async (versionId: string) => {
    const success = await restoreVersion(versionId);
    if (success) {
      toast({
        title: 'Version Restored',
        description: 'The note has been restored to this version',
      });
      onRestore?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            {showSaveInput ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Version summary (optional)"
                  value={savingSummary}
                  onChange={(e) => setSavingSummary(e.target.value)}
                />
                <Button onClick={handleSaveVersion}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setShowSaveInput(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowSaveInput(true)} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Current Version
              </Button>
            )}
          </div>

          <ScrollArea className="h-96">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No version history yet. Save your first version!
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div key={version.id} className="p-4 border rounded-lg hover:bg-muted/50 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={version.author?.avatar_url} />
                          <AvatarFallback>{version.author?.display_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {version.author?.display_name || 'Unknown'}
                            </span>
                            <Badge variant="outline">v{version.version}</Badge>
                            {index === 0 && <Badge>Latest</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {index !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(version.id)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>

                    {version.change_summary && (
                      <p className="text-sm text-muted-foreground mb-2">{version.change_summary}</p>
                    )}

                    <div className="text-sm">
                      <div className="font-medium mb-1">{version.title}</div>
                      <div className="text-muted-foreground line-clamp-2">
                        {version.content_blocks.length > 0
                          ? version.content_blocks.map((b) => b.content).join(' ')
                          : version.content}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      {version.content_blocks.length} blocks
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
