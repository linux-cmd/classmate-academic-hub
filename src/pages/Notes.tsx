import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Star, Calendar, Edit3, Trash2, Share2, FileText, MessageSquare, History, FileCode } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useNotes } from "@/hooks/useNotes";
import { useRealtimeNote } from "@/hooks/useRealtimeNote";
import { useTemplates } from "@/hooks/useTemplates";
import { BlockEditor, type Block } from "@/components/notes/BlockEditor";
import { NotebookSidebar } from "@/components/notes/NotebookSidebar";
import { ShareDialog } from "@/components/notes/ShareDialog";
import { PresenceAvatars } from "@/components/notes/PresenceAvatars";
import { CommentsSidebar } from "@/components/notes/CommentsSidebar";
import { VersionHistoryModal } from "@/components/notes/VersionHistoryModal";
import { TemplatePickerModal } from "@/components/notes/TemplatePickerModal";
import type { Note } from "@/hooks/useNotes";

const Notes = () => {
  const { user } = useSupabaseAuth();
  const {
    notes,
    notebooks,
    loading,
    selectedNotebook,
    setSelectedNotebook,
    createNote,
    updateNote,
    deleteNote,
    createNotebook,
    toggleFavorite,
    searchNotes
  } = useNotes();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  
  // Phase 2: Real-time collaboration
  const { presenceUsers, isConnected, broadcastPresence } = useRealtimeNote(
    selectedNote?.id || null,
    user?.id || null
  );
  
  // Templates
  const { createTemplate } = useTemplates();

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    
    const note = await createNote(newNoteTitle, selectedNotebook);
    if (note) {
      setSelectedNote(note as Note);
      setIsEditing(true);
    }
    setNewNoteTitle("");
    setShowNewNoteDialog(false);
  };

  const handleUpdateBlocks = (blocks: Block[]) => {
    if (!selectedNote) return;
    
    const updatedNote = {
      ...selectedNote,
      content_blocks: blocks
    };
    
    setSelectedNote(updatedNote);
    broadcastPresence(); // Broadcast presence on edit
  };
  
  const handleInsertTemplate = (blocks: Block[]) => {
    if (!selectedNote) return;
    
    const updatedBlocks = [...selectedNote.content_blocks, ...blocks];
    handleUpdateBlocks(updatedBlocks);
  };
  
  const handleSaveAsTemplate = async () => {
    if (!selectedNote) return;
    
    await createTemplate(
      selectedNote.title,
      selectedNote.content_blocks,
      {
        description: `Template from ${selectedNote.title}`,
        isPublic: false,
      }
    );
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    
    const success = await updateNote(selectedNote.id, {
      title: selectedNote.title,
      content_blocks: selectedNote.content_blocks
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchNotes(query);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle pt-16 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access notes</h2>
          <p className="text-muted-foreground">You need to be authenticated to create and manage notes.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16 flex">
      {/* Notebook Sidebar */}
      <NotebookSidebar
        notebooks={notebooks}
        selectedNotebook={selectedNotebook}
        onSelectNotebook={setSelectedNotebook}
        onCreateNotebook={async (title) => {
          await createNotebook(title);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            
            <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Note title"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNote();
                    }}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewNoteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNote} disabled={!newNoteTitle.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-hidden flex">
          {/* Notes List */}
          <div className="w-80 border-r bg-muted/30 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-2">
                {selectedNotebook 
                  ? notebooks.find(n => n.id === selectedNotebook)?.title 
                  : 'All Notes'
                } ({notes.length})
              </h3>
            </div>
            
            <div className="space-y-1 px-2">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : notes.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  {searchQuery ? "No notes found" : "No notes yet"}
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                      selectedNote?.id === note.id ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium truncate flex-1 text-sm">{note.title}</h4>
                      {note.is_favorite && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {note.content_blocks?.[0]?.content || note.content || "Empty note"}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 overflow-y-auto flex">
            <div className="flex-1">
            {selectedNote ? (
              <div className="container mx-auto max-w-4xl p-8">
                {/* Note Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    {isEditing ? (
                      <Input
                        value={selectedNote.title}
                        onChange={(e) => setSelectedNote(prev => 
                          prev ? { ...prev, title: e.target.value } : null
                        )}
                        className="text-4xl font-bold border-0 focus:ring-0 px-0"
                        placeholder="Untitled"
                      />
                    ) : (
                      <h1 className="text-4xl font-bold">{selectedNote.title}</h1>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {/* Presence Avatars */}
                      <PresenceAvatars users={presenceUsers} isConnected={isConnected} />
                      
                      {isEditing && (
                        <Button onClick={handleSaveNote}>
                          Save
                        </Button>
                      )}
                      
                      {/* Comments */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      
                      {/* Version History */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowVersionHistory(true)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      
                      {/* Templates */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowTemplatePicker(true)}
                      >
                        <FileCode className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(selectedNote.id)}
                      >
                        <Star className={`w-4 h-4 ${
                          selectedNote.is_favorite ? "text-yellow-500 fill-current" : ""
                        }`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowShareDialog(true)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          deleteNote(selectedNote.id);
                          setSelectedNote(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(selectedNote.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Block Editor */}
                <BlockEditor
                  blocks={selectedNote.content_blocks}
                  onChange={handleUpdateBlocks}
                  readOnly={!isEditing}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold mb-2">No note selected</h2>
                  <p className="text-muted-foreground mb-4">
                    Select a note or create a new one
                  </p>
                  <Button onClick={() => setShowNewNoteDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Note
                  </Button>
                </div>
              </div>
            )}
            </div>
            
            {/* Comments Sidebar */}
            {showCommentsSidebar && selectedNote && (
              <CommentsSidebar
                noteId={selectedNote.id}
                onClose={() => setShowCommentsSidebar(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {selectedNote && (
        <>
          <ShareDialog
            noteId={selectedNote.id}
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
          />
          
          <VersionHistoryModal
            noteId={selectedNote.id}
            open={showVersionHistory}
            onOpenChange={setShowVersionHistory}
            onRestore={() => {
              // Refresh the note after restore
              window.location.reload();
            }}
          />
          
          <TemplatePickerModal
            open={showTemplatePicker}
            onOpenChange={setShowTemplatePicker}
            onSelectTemplate={handleInsertTemplate}
          />
        </>
      )}
    </div>
  );
};

export default Notes;