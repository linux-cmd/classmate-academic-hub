import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AppSidebar from "@/components/AppSidebar";
import DashboardStats from "@/components/DashboardStats";
import NotionAssignmentTable from "@/components/NotionAssignmentTable";
import NotionSchedule from "@/components/NotionSchedule";
import NotionGrades from "@/components/NotionGrades";
import NotionNotes from "@/components/NotionNotes";
import EventsBoard from "@/components/EventsBoard";
import Assignments from "./Assignments";
import Schedule from "./Schedule";
import Notes from "./Notes";
import StudyGroups from "./StudyGroups";
import Grades from "./Grades";
import Events from "./Events";
import Tasks from "./Tasks";
import Landing from "./Landing";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, profile, isAuthenticated, loading } = useSupabaseAuth();


  const renderPage = () => {
    switch (currentPage) {
      case "assignments":
        return <Assignments />;
      case "tasks":
        return <Tasks />;
      case "schedule":
        return <Schedule />;
      case "notes":
        return <Notes />;
      case "study-groups":
        return <StudyGroups />;
      case "grades":
        return <Grades />;
      case "events":
        return <Events />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 p-6 space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {isAuthenticated ? profile?.display_name || user?.email?.split('@')[0] || "Student" : "Guest"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isAuthenticated 
              ? "Manage your assignments, schedule, and academic progress"
              : "Sign in to access your personalized academic dashboard"
            }
          </p>
        </div>

        {/* Quick Actions Toolbar */}
        {isAuthenticated && (
          <div className="flex flex-wrap gap-3 p-4 bg-card rounded-lg border shadow-sm">
            <Button className="flex items-center gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
            <Button variant="outline" className="flex items-center gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
            <Button variant="outline" className="flex items-center gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Create Note
            </Button>
          </div>
        )}

        {/* Dashboard Stats Section */}
        <DashboardStats />

        {/* Assignments Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Assignments</h2>
            <p className="text-muted-foreground text-sm">Track and manage your coursework</p>
          </div>
          <NotionAssignmentTable />
        </div>

        {/* Schedule Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Today's Schedule</h2>
            <p className="text-muted-foreground text-sm">Your events and classes for today</p>
          </div>
          <NotionSchedule />
        </div>

        {/* Grades Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Academic Performance</h2>
            <p className="text-muted-foreground text-sm">Track your grades and GPA</p>
          </div>
          <NotionGrades />
        </div>

        {/* Notes Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Notes & Documentation</h2>
            <p className="text-muted-foreground text-sm">Your personal knowledge base</p>
          </div>
          <NotionNotes />
        </div>

        {/* Study Groups Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Study Groups & Events</h2>
            <p className="text-muted-foreground text-sm">Connect with peers and upcoming events</p>
          </div>
          <EventsBoard />
        </div>
      </div>
    </div>
  );

  // Show loading screen while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <SidebarInset>
          <Navigation />
          {renderPage()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
