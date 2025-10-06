import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTemplates } from '@/hooks/useTemplates';
import { FileText, Plus, Search, Star } from 'lucide-react';
import { Block } from '@/components/notes/BlockEditor';

interface TemplatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (blocks: Block[]) => void;
}

const builtInTemplates = [
  {
    id: 'lecture-notes',
    title: 'Lecture Notes',
    description: 'Structured template for lecture notes with sections',
    category: 'Academic',
    blocks: [
      { id: '1', type: 'heading1' as const, content: 'Lecture Title' },
      { id: '2', type: 'paragraph' as const, content: 'Course: ' },
      { id: '3', type: 'paragraph' as const, content: 'Date: ' },
      { id: '4', type: 'heading2' as const, content: 'Main Topics' },
      { id: '5', type: 'list' as const, content: 'Topic 1' },
      { id: '6', type: 'list' as const, content: 'Topic 2' },
      { id: '7', type: 'heading2' as const, content: 'Key Points' },
      { id: '8', type: 'paragraph' as const, content: '' },
      { id: '9', type: 'heading2' as const, content: 'Questions' },
      { id: '10', type: 'checkbox' as const, content: 'Review this section', checked: false },
    ],
  },
  {
    id: 'cornell-notes',
    title: 'Cornell Notes',
    description: 'Cornell note-taking system with cue, notes, and summary',
    category: 'Academic',
    blocks: [
      { id: '1', type: 'heading1' as const, content: 'Cornell Notes' },
      { id: '2', type: 'paragraph' as const, content: 'Topic: ' },
      { id: '3', type: 'heading2' as const, content: 'Notes' },
      { id: '4', type: 'paragraph' as const, content: '' },
      { id: '5', type: 'heading2' as const, content: 'Cues / Questions' },
      { id: '6', type: 'list' as const, content: 'Question 1' },
      { id: '7', type: 'heading2' as const, content: 'Summary' },
      { id: '8', type: 'paragraph' as const, content: '' },
    ],
  },
  {
    id: 'study-guide',
    title: 'Study Guide',
    description: 'Comprehensive study guide with sections for review',
    category: 'Academic',
    blocks: [
      { id: '1', type: 'heading1' as const, content: 'Study Guide' },
      { id: '2', type: 'paragraph' as const, content: 'Subject: ' },
      { id: '3', type: 'heading2' as const, content: 'Key Concepts' },
      { id: '4', type: 'list' as const, content: 'Concept 1' },
      { id: '5', type: 'heading2' as const, content: 'Important Formulas' },
      { id: '6', type: 'code' as const, content: '// Formula here' },
      { id: '7', type: 'heading2' as const, content: 'Practice Problems' },
      { id: '8', type: 'checkbox' as const, content: 'Problem 1', checked: false },
    ],
  },
  {
    id: 'lab-report',
    title: 'Lab Report',
    description: 'Scientific lab report template',
    category: 'Academic',
    blocks: [
      { id: '1', type: 'heading1' as const, content: 'Lab Report' },
      { id: '2', type: 'paragraph' as const, content: 'Lab: ' },
      { id: '3', type: 'heading2' as const, content: 'Objective' },
      { id: '4', type: 'paragraph' as const, content: '' },
      { id: '5', type: 'heading2' as const, content: 'Materials' },
      { id: '6', type: 'list' as const, content: 'Material 1' },
      { id: '7', type: 'heading2' as const, content: 'Procedure' },
      { id: '8', type: 'list' as const, content: 'Step 1' },
      { id: '9', type: 'heading2' as const, content: 'Results' },
      { id: '10', type: 'paragraph' as const, content: '' },
      { id: '11', type: 'heading2' as const, content: 'Conclusion' },
      { id: '12', type: 'paragraph' as const, content: '' },
    ],
  },
];

export const TemplatePickerModal = ({ open, onOpenChange, onSelectTemplate }: TemplatePickerModalProps) => {
  const { templates, loading } = useTemplates();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuiltIn = builtInTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustom = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTemplate = (blocks: Block[]) => {
    onSelectTemplate(blocks);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Choose a Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="built-in">
            <TabsList>
              <TabsTrigger value="built-in">
                <Star className="w-4 h-4 mr-2" />
                Built-in ({builtInTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Plus className="w-4 h-4 mr-2" />
                Custom ({templates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="built-in">
              <ScrollArea className="h-96">
                <div className="grid grid-cols-2 gap-3">
                  {filteredBuiltIn.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template.blocks)}
                      className="p-4 border rounded-lg text-left hover:bg-muted/50 transition"
                    >
                      <div className="font-medium mb-1">{template.title}</div>
                      <div className="text-sm text-muted-foreground mb-2">{template.description}</div>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="custom">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">Loading templates...</div>
                ) : filteredCustom.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No custom templates yet. Save a note as a template to see it here!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredCustom.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template.content_blocks)}
                        className="p-4 border rounded-lg text-left hover:bg-muted/50 transition"
                      >
                        <div className="font-medium mb-1">{template.title}</div>
                        {template.description && (
                          <div className="text-sm text-muted-foreground mb-2">{template.description}</div>
                        )}
                        <div className="flex items-center gap-2">
                          {template.category && (
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">Used {template.usage_count}×</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
