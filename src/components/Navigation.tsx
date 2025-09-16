import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings,
  Bell,
  LogIn,
  LogOut,
  Menu
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthDialog from "./AuthDialog";
import SettingsDialog from "./SettingsDialog";
import NotificationsDialog from "./NotificationsDialog";
import ThemeToggle from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navigation = () => {
  const { user, profile, isAuthenticated, signIn, signOut, signUp, signInWithGoogle } = useSupabaseAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
        </div>

        {/* Right side - User controls */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8"
              onClick={() => setShowNotificationsDialog(true)}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          )}
          
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSettingsDialog(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {profile?.display_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleAuthAction} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={handleAuthAction}>
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </header>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onLogin={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
      />
      
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
      
      <NotificationsDialog
        open={showNotificationsDialog}
        onOpenChange={setShowNotificationsDialog}
      />
    </>
  );
};

export default Navigation;