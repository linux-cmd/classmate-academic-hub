import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings,
  Upload,
  Globe,
  Lock,
  Trash2,
  Save,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { StudyGroup } from "@/hooks/useStudyGroups";

interface GroupSettingsProps {
  group: StudyGroup;
}

export function GroupSettings({ group }: GroupSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    name: group.name,
    description: group.description || "",
    subject: group.subject || "",
    is_public: group.is_public,
    image_url: group.image_url || ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("study_groups")
        .update({
          name: settings.name,
          description: settings.description,
          subject: settings.subject,
          is_public: settings.is_public,
          image_url: settings.image_url || null
        })
        .eq("id", group.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Group settings have been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileName = `${group.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('group-files')
        .upload(`covers/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('group-files')
        .getPublicUrl(uploadData.path);

      setSettings(prev => ({ ...prev, image_url: urlData.publicUrl }));
      
      toast({
        title: "Image uploaded",
        description: "Group cover image has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const { error } = await supabase
        .from("study_groups")
        .delete()
        .eq("id", group.id);

      if (error) throw error;

      toast({
        title: "Group deleted",
        description: "The study group has been permanently deleted",
      });

      // Redirect to groups list or home
      window.location.href = "/study-groups";
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Group Settings
          </CardTitle>
          <CardDescription>
            Manage your study group's information and privacy settings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your group's name, description, and subject
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={settings.name}
              onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={settings.subject}
              onChange={(e) => setSettings(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Mathematics, Computer Science, History"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this group is about, study goals, meeting times, etc."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Group Image */}
      <Card>
        <CardHeader>
          <CardTitle>Group Image</CardTitle>
          <CardDescription>
            Upload a cover image for your study group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              {settings.image_url ? (
                <AvatarImage src={settings.image_url} alt={settings.name} />
              ) : (
                <AvatarFallback className="text-lg">
                  {settings.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control who can join your study group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {settings.is_public ? (
                  <>
                    <Globe className="w-4 h-4 text-green-500" />
                    <Label className="text-base font-medium">Public Group</Label>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-orange-500" />
                    <Label className="text-base font-medium">Private Group</Label>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {settings.is_public 
                  ? "Anyone can join this group without approval"
                  : "Users need to request access to join"
                }
              </p>
            </div>
            <Switch
              checked={settings.is_public}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, is_public: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Changes */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Deleting this group is permanent. All messages, files, tasks, and events will be lost forever.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Group
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Are you absolutely sure? Type the group name to confirm:
              </p>
              <Input
                placeholder={group.name}
                onChange={(e) => {
                  if (e.target.value === group.name) {
                    // Enable delete button logic could go here
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteGroup}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Forever
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}