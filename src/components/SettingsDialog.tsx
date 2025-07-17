import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { profile, updateProfile } = useSupabaseAuth();
  const [profileData, setProfileData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    gpa: profile?.gpa || 0,
  });

  const [notifications, setNotifications] = useState({
    assignments: true,
    grades: true,
    events: true,
    studyGroups: false,
  });

  const handleProfileSave = () => {
    updateProfile(profileData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and academic details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    placeholder="Your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={profileData.gpa}
                    onChange={(e) => setProfileData({ ...profileData, gpa: parseFloat(e.target.value) || 0 })}
                    placeholder="Your GPA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleProfileSave} className="w-full">
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you'd like to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignments">Assignment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming assignment due dates
                    </p>
                  </div>
                  <Switch
                    id="assignments"
                    checked={notifications.assignments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, assignments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="grades">Grade Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when grades are posted
                    </p>
                  </div>
                  <Switch
                    id="grades"
                    checked={notifications.grades}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, grades: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="events">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming events and activities
                    </p>
                  </div>
                  <Switch
                    id="events"
                    checked={notifications.events}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, events: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="studyGroups">Study Group Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for study group chat messages
                    </p>
                  </div>
                  <Switch
                    id="studyGroups"
                    checked={notifications.studyGroups}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, studyGroups: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>
                  Customize your ClassMate experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Calendar Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync with Google Calendar
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tutorial Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Show helpful tips and tutorials
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;