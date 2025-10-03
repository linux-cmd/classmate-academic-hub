import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareDialogProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareDialog = ({ noteId, isOpen, onClose }: ShareDialogProps) => {
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/notes/${noteId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWithUser = async () => {
    if (!shareEmail.trim()) return;

    // TODO: Implement actual sharing logic with Supabase
    toast({
      title: "Coming soon",
      description: "User sharing will be implemented in Phase 2"
    });
    setShareEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share with specific users */}
          <div className="space-y-2">
            <Label>Share with people</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                type="email"
              />
              <Select value={shareRole} onValueChange={(v: any) => setShareRole(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleShareWithUser} 
              disabled={!shareEmail.trim()}
              className="w-full"
            >
              Share
            </Button>
          </div>

          {/* Public link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Anyone with the link</Label>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
            
            {isPublic && (
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Viewer:</strong> Can only view the note</p>
            <p><strong>Commenter:</strong> Can view and add comments</p>
            <p><strong>Editor:</strong> Can view, comment, and edit</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
