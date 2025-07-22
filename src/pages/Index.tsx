import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import DashboardStats from "@/components/DashboardStats";
import AssignmentTracker from "@/components/AssignmentTracker";
import ScheduleOverview from "@/components/ScheduleOverview";
import GradesOverview from "@/components/GradesOverview";
import EventsBoard from "@/components/EventsBoard";
import TutorialDialog from "@/components/TutorialDialog";
import TourDialog from "@/components/TourDialog";
import Assignments from "./Assignments";
import Schedule from "./Schedule";
import Notes from "./Notes";
import StudyGroups from "./StudyGroups";
import Grades from "./Grades";
import Events from "./Events";
import Landing from "./Landing";
import heroImage from "@/assets/hero-study.jpg";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const { user, profile, isAuthenticated, loading } = useSupabaseAuth();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('classmate-tutorial-seen');
    const hasSeenTour = localStorage.getItem('classmate-tour-completed');
    
    if (!hasSeenTutorial && isAuthenticated) {
      setShowTutorial(true);
    } else if (!hasSeenTour && isAuthenticated && user) {
      // Create unique key for this user on this device
      const userTourKey = `classmate-tour-completed-${user.id}`;
      const userHasSeenTour = localStorage.getItem(userTourKey);
      
      if (!userHasSeenTour) {
        setShowTour(true);
      }
    }
  }, [isAuthenticated, user]);

  const renderPage = () => {
    switch (currentPage) {
      case "assignments":
        return <Assignments />;
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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="pt-16 relative overflow-hidden">
        <div 
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-primary/80" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {isAuthenticated ? profile?.display_name || user?.email?.split('@')[0] || "Student" : "Guest"}!
              </h1>
              <p className="text-white/90">
                {isAuthenticated 
                  ? "You have 3 assignments due this week and 2 upcoming events."
                  : "Sign in to access your personalized academic dashboard."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AssignmentTracker />
          <ScheduleOverview />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GradesOverview />
          <EventsBoard />
        </div>
      </div>
    </div>
  );

  // Show loading screen while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
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
    <>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
      <TutorialDialog open={showTutorial} onOpenChange={setShowTutorial} />
      <TourDialog open={showTour} onOpenChange={setShowTour} />
    </>
  );
};

export default Index;
