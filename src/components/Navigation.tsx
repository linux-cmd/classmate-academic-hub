import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Users, 
  BookOpen,
  MapPin,
  Settings,
  Bell,
  LogIn,
  LogOut
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthDialog from "./AuthDialog";
import SettingsDialog from "./SettingsDialog";
import NotificationsDialog from "./NotificationsDialog";
import ThemeToggle from "./ThemeToggle";

interface NavigationProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const Navigation = ({ currentPage = "dashboard", onPageChange }: NavigationProps) => {
  const { user, profile, isAuthenticated, signIn, signOut, signUp, signInWithGoogle } = useSupabaseAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  
  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", active: currentPage === "dashboard" },
    { id: "assignments", icon: CheckSquare, label: "Assignments", active: currentPage === "assignments" },
    { id: "schedule", icon: Calendar, label: "Schedule", active: currentPage === "schedule" },
    { id: "notes", icon: BookOpen, label: "Notes", active: currentPage === "notes" },
    { id: "grades", icon: TrendingUp, label: "Grades", active: currentPage === "grades" },
    { id: "events", icon: MapPin, label: "Events", active: currentPage === "events" },
    { id: "study-groups", icon: Users, label: "Study Groups", active: currentPage === "study-groups" },
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange?.(pageId);
    window.location.hash = `#${pageId}`;
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ClassMate</h1>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.active ? "default" : "ghost"}
                  className="flex items-center space-x-2 px-3 py-2"
                  onClick={() => handleNavClick(item.id)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotificationsDialog(true)}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
                </Button>
              )}
              
              <ThemeToggle />
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {profile?.display_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" onClick={handleAuthAction}>
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
          </div>
        </div>
      </nav>

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