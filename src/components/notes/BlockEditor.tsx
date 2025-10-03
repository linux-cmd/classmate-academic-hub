import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Type, Heading1, Heading2, List, CheckSquare, Code, 
  Image as ImageIcon, Link as LinkIcon, Quote, Plus 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Block {
  id: string;
  type: 'heading1' | 'heading2' | 'paragraph' | 'list' | 'checkbox' | 'code' | 'quote';
  content: string;
  checked?: boolean;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export const BlockEditor = ({ blocks, onChange, readOnly = false }: BlockEditorProps) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const addBlock = (type: Block['type'], afterId?: string) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: '',
      checked: type === 'checkbox' ? false : undefined
    };

    if (afterId) {
      const index = blocks.findIndex(b => b.id === afterId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onChange(newBlocks);
    } else {
      onChange([...blocks, newBlock]);
    }
    
    setFocusedBlockId(newBlock.id);
    setShowBlockMenu(false);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return;
    onChange(blocks.filter(b => b.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent, blockId: string, index: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Enter key - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Check for slash command
      if (block.content === '/') {
        setShowBlockMenu(true);
        updateBlock(blockId, { content: '' });
        return;
      }
      
      addBlock('paragraph', blockId);
    }

    // Backspace on empty block - delete it
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(blockId);
      
      // Focus previous block
      if (index > 0) {
        setFocusedBlockId(blocks[index - 1].id);
      }
    }

    // Up arrow - focus previous block
    if (e.key === 'ArrowUp' && index > 0) {
      setFocusedBlockId(blocks[index - 1].id);
    }

    // Down arrow - focus next block
    if (e.key === 'ArrowDown' && index < blocks.length - 1) {
      setFocusedBlockId(blocks[index + 1].id);
    }
  };

  const renderBlock = (block: Block, index: number) => {
    const isEditing = focusedBlockId === block.id;
    
    const baseClasses = "w-full border-0 focus:ring-0 focus:outline-none bg-transparent resize-none";
    
    const commonProps = {
      value: block.content,
      onChange: (e: any) => updateBlock(block.id, { content: e.target.value }),
      onFocus: () => setFocusedBlockId(block.id),
      onKeyDown: (e: any) => handleKeyDown(e, block.id, index),
      readOnly,
      placeholder: getPlaceholder(block.type),
      className: baseClasses
    };

    switch (block.type) {
      case 'heading1':
        return (
          <Input 
            {...commonProps}
            className={cn(baseClasses, "text-3xl font-bold")}
          />
        );
      
      case 'heading2':
        return (
          <Input 
            {...commonProps}
            className={cn(baseClasses, "text-2xl font-semibold")}
          />
        );
      
      case 'code':
        return (
          <Textarea
            {...commonProps}
            className={cn(baseClasses, "font-mono text-sm bg-muted/30 p-2 rounded")}
            rows={3}
          />
        );
      
      case 'quote':
        return (
          <div className="border-l-4 border-primary/50 pl-4">
            <Textarea
              {...commonProps}
              className={cn(baseClasses, "italic text-muted-foreground")}
              rows={2}
            />
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
              disabled={readOnly}
              className="mt-1.5 h-4 w-4 rounded border-gray-300"
            />
            <Input
              {...commonProps}
              className={cn(baseClasses, block.checked && "line-through text-muted-foreground")}
            />
          </div>
        );
      
      case 'list':
        return (
          <div className="flex items-start space-x-2">
            <span className="mt-1.5">•</span>
            <Input {...commonProps} />
          </div>
        );
      
      default:
        return <Textarea {...commonProps} rows={1} />;
    }
  };

  const getPlaceholder = (type: Block['type']) => {
    switch (type) {
      case 'heading1': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'code': return '// Code block';
      case 'quote': return 'Quote...';
      case 'checkbox': return 'To-do';
      case 'list': return 'List item';
      default: return "Type '/' for commands";
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id}>
            {renderBlock(block, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative">
          {renderBlock(block, index)}
          
          {focusedBlockId === block.id && showBlockMenu && (
            <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-popover border rounded-md shadow-lg p-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  updateBlock(block.id, { type: 'heading1' });
                  setShowBlockMenu(false);
                }}
              >
                <Heading1 className="w-4 h-4 mr-2" />
                Heading 1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  updateBlock(block.id, { type: 'heading2' });
                  setShowBlockMenu(false);
                }}
              >
                <Heading2 className="w-4 h-4 mr-2" />
                Heading 2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  updateBlock(block.id, { type: 'list' });
                  setShowBlockMenu(false);
                }}
              >
                <List className="w-4 h-4 mr-2" />
                Bullet List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  updateBlock(block.id, { type: 'checkbox', checked: false });
                  setShowBlockMenu(false);
                }}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                To-do
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  updateBlock(block.id, { type: 'code' });
                  setShowBlockMenu(false);
                }}
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  updateBlock(block.id, { type: 'quote' });
                  setShowBlockMenu(false);
                }}
              >
                <Quote className="w-4 h-4 mr-2" />
                Quote
              </Button>
            </div>
          )}
        </div>
      ))}
      
      {!readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBlock('paragraph')}
          className="w-full justify-start text-muted-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add block (or type '/')
        </Button>
      )}
    </div>
  );
};
