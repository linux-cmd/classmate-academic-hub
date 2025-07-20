import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Star, Folder, Tag, Calendar, Edit3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  folder: string | null;
  tags: string[];
}

const Notes = () => {
  const { user } = useSupabaseAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newNote, setNewNote] = useState({ title: "", content: "", folder: "", tags: "" });
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!user || !newNote.title.trim()) return;

    try {
      const tags = newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: newNote.title,
          content: newNote.content,
          folder: newNote.folder || null,
          tags
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote({ title: "", content: "", folder: "", tags: "" });
      setShowNewNoteDialog(false);
      
      toast({
        title: "Success",
        description: "Note created successfully"
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      });
    }
  };

  const updateNote = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: note.title,
          content: note.content,
          folder: note.folder,
          tags: note.tags
        })
        .eq('id', note.id);

      if (error) throw error;

      setNotes(prev => prev.map(n => n.id === note.id ? note : n));
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Note updated successfully"
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      setSelectedNote(null);
      
      toast({
        title: "Success",
        description: "Note deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: !note.is_favorite })
        .eq('id', note.id);

      if (error) throw error;

      setNotes(prev => prev.map(n => 
        n.id === note.id ? { ...n, is_favorite: !n.is_favorite } : n
      ));
      
      if (selectedNote?.id === note.id) {
        setSelectedNote(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
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
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notes</h1>
            <p className="text-muted-foreground">Your personal Notion-like workspace</p>
          </div>
          
          <Dialog open={showNewNoteDialog} onOpenChange={setShowNewNoteDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Start writing..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                />
                <Input
                  placeholder="Folder (optional)"
                  value={newNote.folder}
                  onChange={(e) => setNewNote(prev => ({ ...prev, folder: e.target.value }))}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={newNote.tags}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewNoteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNote} disabled={!newNote.title.trim()}>
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">All Notes ({filteredNotes.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading notes...</div>
                  ) : filteredNotes.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery ? "No notes found matching your search" : "No notes yet. Create your first note!"}
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedNote?.id === note.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium truncate flex-1">{note.title}</h4>
                          {note.is_favorite && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {note.content || "No content"}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                          {note.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{note.tags.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <Input
                          value={selectedNote.title}
                          onChange={(e) => setSelectedNote(prev => 
                            prev ? { ...prev, title: e.target.value } : null
                          )}
                          className="text-xl font-bold"
                        />
                      ) : (
                        <h2 className="text-2xl font-bold">{selectedNote.title}</h2>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(selectedNote)}
                      >
                        <Star className={`w-4 h-4 ${
                          selectedNote.is_favorite ? "text-yellow-500 fill-current" : ""
                        }`} />
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
                        onClick={() => deleteNote(selectedNote.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {new Date(selectedNote.updated_at).toLocaleDateString()}</span>
                    </div>
                    {selectedNote.folder && (
                      <div className="flex items-center space-x-1">
                        <Folder className="w-3 h-3" />
                        <span>{selectedNote.folder}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        value={selectedNote.content}
                        onChange={(e) => setSelectedNote(prev => 
                          prev ? { ...prev, content: e.target.value } : null
                        )}
                        rows={15}
                        placeholder="Start writing..."
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => updateNote(selectedNote)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      {selectedNote.content ? (
                        <div className="whitespace-pre-wrap">{selectedNote.content}</div>
                      ) : (
                        <p className="text-muted-foreground italic">No content yet. Click edit to add content.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Select a note to view</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a note from the sidebar or create a new one to get started
                  </p>
                  <Button onClick={() => setShowNewNoteDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;