import Navigation from "@/components/Navigation";
import DashboardStats from "@/components/DashboardStats";
import AssignmentTracker from "@/components/AssignmentTracker";
import ScheduleOverview from "@/components/ScheduleOverview";
import GradesOverview from "@/components/GradesOverview";
import EventsBoard from "@/components/EventsBoard";
import heroImage from "@/assets/hero-study.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-16 relative overflow-hidden">
        <div 
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-primary/80" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
              <p className="text-white/90">You have 3 assignments due this week and 2 upcoming events.</p>
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
};

export default Index;
