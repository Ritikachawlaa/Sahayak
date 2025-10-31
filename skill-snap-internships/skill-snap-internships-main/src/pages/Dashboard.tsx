import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import InternshipCard from '../components/InternshipCard';
import VoiceAssistant from '../components/VoiceAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Internship } from '../types';
import { MapPin, Clock, DollarSign, Briefcase, Search } from 'lucide-react';

const Dashboard = () => {
  // --- highlight: Use global state from AuthContext instead of local state
  const { 
    user, 
    recommendedInternships, 
    setRecommendedInternships, 
    savedInternshipIds, 
    saveInternship, 
    unsaveInternship 
  } = useAuth();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- highlight: These local states are no longer needed for saved/recommended internships
  // const [recommendedInternships, setRecommendedInternships] = useState<Internship[]>([]);
  // const [savedInternships, setSavedInternships] = useState<string[]>([]);
  
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && !user.isOnboarded) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  // Fetch recommendations when the component mounts
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      try {
        const userProfile = {
          location_preference: user.location ? [user.location] : [],
          skills: user.skills || [],
          interests: user.interests || [],
          education: user.education || ''
        };

        const response = await fetch('http://127.0.0.1:8000/api/recommend/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProfile),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data: Internship[] = await response.json();
        
        const formattedData = data.map(internship => ({
          ...internship,
          tags: typeof internship.tags === 'string' ? internship.tags.split(',').map(tag => tag.trim()) : [],
        }));

        // --- highlight: Update the global state in the context
        setRecommendedInternships(formattedData);

      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        toast({
          title: "Could not load recommendations",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    };

    if (user?.isOnboarded) {
      fetchRecommendations();
    }
  }, [user, toast, setRecommendedInternships]);


  // --- highlight: Filter from the global recommendedInternships state
  const filteredInternshipsForMap = recommendedInternships.filter(internship => {
    const matchesLocation = !locationFilter || 
      internship.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || internship.type === typeFilter;
    return matchesLocation && matchesType;
  });

  // --- highlight: Update handleSaveInternship to use context functions
  const handleSaveInternship = (id: string) => {
    if (savedInternshipIds.includes(id)) {
      unsaveInternship(id);
      toast({
        title: "Internship unsaved",
        description: "Removed from your saved internships.",
      });
    } else {
      saveInternship(id);
      toast({
        title: "Internship saved!",
        description: "Added to your saved internships.",
      });
    }
  };

  const handleApplyInternship = (id: string) => {
    toast({
      title: "Application submitted!",
      description: "We'll notify you about the status.",
    });
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('saved internships')) {
      navigate('/saved');
    } else if (lowerCommand.includes('profile')) {
      navigate('/profile');
    } else if (lowerCommand.includes('search')) {
      navigate('/search');
    } else if (lowerCommand.includes('find internships')) {
      navigate('/search');
    }
  };

  const stats = [
    {
      icon: Briefcase,
      label: 'Recommended For You',
      value: recommendedInternships.length.toString(),
      color: 'text-primary'
    },
    {
      icon: MapPin,
      label: 'Cities',
      value: '8+',
      color: 'text-accent'
    },
    {
      icon: Clock,
      label: 'Avg Duration',
      value: '4 months',
      color: 'text-success'
    },
    {
      icon: DollarSign,
      label: 'Paid Opportunities',
      value: `${recommendedInternships.filter(i => i.type === 'paid').length}`,
      color: 'text-warning'
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here are the latest internship opportunities matched for you.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map Section */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Explore Locations</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/search')}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2 flex-wrap">
                  <Badge 
                    variant={typeFilter === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setTypeFilter('all')}
                  >
                    All
                  </Badge>
                  <Badge 
                    variant={typeFilter === 'paid' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setTypeFilter('paid')}
                  >
                    Paid
                  </Badge>
                  <Badge 
                    variant={typeFilter === 'unpaid' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setTypeFilter('unpaid')}
                  >
                    Unpaid
                  </Badge>
                </div>
                <MapComponent
                  internships={filteredInternshipsForMap}
                />
              </CardContent>
            </Card>

            {/* Recommended Internships */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {recommendedInternships.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      // --- highlight: Check against global savedInternshipIds
                      isSaved={savedInternshipIds.includes(String(internship.id))}
                      onSave={() => handleSaveInternship(String(internship.id))}
                      onApply={() => handleApplyInternship(String(internship.id))}
                      onViewDetails={(id) => console.log('View details:', id)}
                    />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={() => navigate('/search')}>
                    View All Internships
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/search')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Internships
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/saved')}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  {/* --- highlight: Display count from global state */}
                  View Saved ({savedInternshipIds.length})
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profile completed</span>
                    <Badge variant="secondary">Today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account created</span>
                    <Badge variant="secondary">Today</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <VoiceAssistant onCommand={handleVoiceCommand} />
    </div>
  );
};

export default Dashboard;