import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Bell,
  Target,
  ArrowRight,
  Star,
  Clock,
  BarChart3,
  FileText,
  Zap,
  Shield,
  MessageCircle
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthDialog from "@/components/AuthDialog";

const Landing = () => {
  const { isAuthenticated, signIn, signUp, signInWithGoogle } = useSupabaseAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const features = [
    {
      icon: CheckSquare,
      title: "Assignment Tracking",
      description: "Keep track of all your assignments, deadlines, and submissions in one organized place."
    },
    {
      icon: Calendar,
      title: "Schedule Management", 
      description: "Manage your class schedule, study sessions, and important academic events seamlessly."
    },
    {
      icon: TrendingUp,
      title: "Grade Analytics",
      description: "Monitor your academic performance with detailed grade tracking and progress insights."
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Connect with classmates and collaborate effectively on projects and study sessions."
    },
    {
      icon: FileText,
      title: "Note Taking",
      description: "Create, organize, and search through your notes with our clean, distraction-free editor."
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Never miss important deadlines with intelligent notifications and reminders."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "ClassMate completely transformed how I organize my coursework. My GPA improved significantly since I started using it.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson", 
      role: "Pre-Med Student",
      content: "The grade tracking feature is incredible. I can see exactly where I need to focus my study efforts.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "Business Major",
      content: "Study groups feature helped me connect with amazing classmates. We've formed lasting study partnerships.",
      avatar: "ER"
    }
  ];

  if (isAuthenticated) {
    window.location.hash = "#dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <BookOpen className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">ClassMate</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button 
              variant="ghost"
              onClick={() => setShowAuthDialog(true)}
            >
              Log in
            </Button>
            <Button 
              onClick={() => setShowAuthDialog(true)}
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center space-y-8 text-center">
          <Badge variant="secondary" className="rounded-full">
            Academic productivity, simplified
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Your academic
            <span className="block text-muted-foreground">companion</span>
          </h1>
          
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Transform your academic workflow with ClassMate. Track assignments, 
            manage schedules, monitor grades, and collaborate with classmates — all in one beautiful, organized workspace.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button 
              size="lg" 
              onClick={() => setShowAuthDialog(true)}
              className="h-12 px-8"
            >
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              className="h-12 px-8"
            >
              Learn more
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Free to use • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to help you stay organized and excel in your academic journey.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="group space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-card">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 py-24">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by students worldwide
              </h2>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">10,000+</div>
                <div className="text-muted-foreground">Active students</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-muted-foreground">Universities</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">15%</div>
                <div className="text-muted-foreground">Average GPA improvement</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-muted-foreground">Student satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What students are saying
            </h2>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="space-y-4 rounded-lg border bg-card p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to transform your academic life?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students who have already improved their academic performance with ClassMate.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowAuthDialog(true)}
              className="h-12 px-8"
            >
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-12 px-8"
            >
              Contact sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <BookOpen className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold">ClassMate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ClassMate. All rights reserved.
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