import { useState } from "react";
import Navigation from "@/components/Navigation";
import DashboardStats from "@/components/DashboardStats";
import AssignmentTracker from "@/components/AssignmentTracker";
import ScheduleOverview from "@/components/ScheduleOverview";
import GradesOverview from "@/components/GradesOverview";
import EventsBoard from "@/components/EventsBoard";
import Assignments from "./Assignments";
import Schedule from "./Schedule";
import StudyGroups from "./StudyGroups";
import heroImage from "@/assets/hero-study.jpg";
import { useAuth } from "@/hooks/useData";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, isAuthenticated } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case "assignments":
        return <Assignments />;
      case "schedule":
        return <Schedule />;
      case "study-groups":
        return <StudyGroups />;
      case "grades":
      case "events":
        // For now, redirect back to dashboard for these pages
        return renderDashboard();
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
                Welcome back, {isAuthenticated ? user?.name || "Student" : "Guest"}!
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

  return (
    <>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </>
  );
};

export default Index;
