import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Bell,
  Target,
  Trophy,
  Zap,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  Play
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthDialog from "@/components/AuthDialog";
import heroImage from "@/assets/hero-study-professional.jpg";

const Landing = () => {
  const { isAuthenticated, signIn, signUp, signInWithGoogle } = useSupabaseAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const features = [
    {
      icon: CheckSquare,
      title: "Smart Assignment Tracking",
      description: "Never miss a deadline again. Track assignments with due dates, priorities, and completion status.",
      color: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "Integrated Schedule",
      description: "Sync your class schedule, study sessions, and important events in one unified calendar.",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Grade Analytics",
      description: "Visualize your academic progress with detailed grade tracking and performance insights.",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Connect with classmates, form study groups, and collaborate on projects effectively.",
      color: "text-orange-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get timely reminders for assignments, exams, and study sessions based on your schedule.",
      color: "text-red-500"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set academic goals, track your progress, and celebrate achievements along the way.",
      color: "text-indigo-500"
    }
  ];

  const benefits = [
    {
      icon: Trophy,
      title: "Boost Your GPA",
      description: "Students using ClassMate see an average 15% improvement in their grades"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce planning time by 60% with our intelligent scheduling algorithms"
    },
    {
      icon: Zap,
      title: "Stay Motivated",
      description: "Gamified progress tracking keeps you engaged and motivated to succeed"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your academic data is encrypted and never shared with third parties"
    }
  ];

  if (isAuthenticated) {
    window.location.hash = "#dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight">ClassMate</h1>
            </div>
            <Button 
              onClick={() => setShowAuthDialog(true)}
              className="rounded-full px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                  Classmate | Academic Excellence Made Simple
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                  Your academic
                  <span className="block text-muted-foreground">companion</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Transform chaos into clarity. Organize assignments, track progress, 
                  and achieve your academic goals with our beautifully designed platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="rounded-full px-8 py-6 text-base"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-base"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={heroImage} 
                  alt="Students collaborating"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-elegant">
                <Trophy className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="rounded-full">
              ✨ Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Everything you need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you organize, track, and excel in your academic journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-all duration-300 bg-background">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="rounded-full">
              📈 Results
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Proven impact
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary rounded-2xl flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <Card className="border-0 bg-primary text-primary-foreground">
            <CardContent className="p-12 lg:p-16 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Ready to start?
                </h2>
                <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                  Join thousands of students who have transformed their academic journey with ClassMate.
                </p>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full px-8 py-6 text-base"
                onClick={() => setShowAuthDialog(true)}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-primary-foreground/60">
                No credit card required • Free forever
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">ClassMate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ClassMate. Built for academic excellence.
            </p>
          </div>
        </div>
      </footer>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onLogin={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
      />
    </div>
  );
};

export default Landing;