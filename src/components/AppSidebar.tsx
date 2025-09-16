import { 
  Home, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Users, 
  BookOpen,
  MapPin,
  ListTodo
} from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const AppSidebar = ({ currentPage = "dashboard", onPageChange }: AppSidebarProps) => {
  const { state } = useSidebar();
  const location = useLocation();
  
  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "assignments", icon: CheckSquare, label: "Assignments" },
    { id: "tasks", icon: ListTodo, label: "Tasks" },
    { id: "schedule", icon: Calendar, label: "Schedule" },
    { id: "notes", icon: BookOpen, label: "Notes" },
    { id: "grades", icon: TrendingUp, label: "Grades" },
    { id: "events", icon: MapPin, label: "Events" },
    { id: "study-groups", icon: Users, label: "Study Groups" },
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange?.(pageId);
    window.location.hash = `#${pageId}`;
  };

  const isActive = (pageId: string) => currentPage === pageId;

  return (
    <Sidebar className="border-r border-border bg-sidebar-background">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h1 className="text-lg font-semibold text-sidebar-foreground">ClassMate</h1>
                <p className="text-xs text-sidebar-foreground/60">Student Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.id)}
                    isActive={isActive(item.id)}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    {state !== "collapsed" && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;