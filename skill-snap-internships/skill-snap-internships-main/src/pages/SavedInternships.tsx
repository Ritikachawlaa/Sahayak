import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, Search, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import InternshipCard from '@/components/InternshipCard'; // Import InternshipCard

const SavedInternships = () => {
  const { toast } = useToast();
  // --- Get global state from context ---
  const { savedInternshipIds, recommendedInternships, saveInternship, unsaveInternship } = useAuth();

  // Filter the full list of internships to get only the saved ones
  const savedItems = recommendedInternships.filter(internship => 
    savedInternshipIds.includes(String(internship.id))
  );

  const handleSaveInternship = (id: string) => {
    if (savedInternshipIds.includes(id)) {
      unsaveInternship(id);
      toast({ title: "Internship unsaved." });
    } else {
      saveInternship(id);
      toast({ title: "Internship saved!" });
    }
  };
  
  // ... (keep handleVoiceCommand)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Saved Internships
            </h1>
          </div>
          <p className="text-muted-foreground">
            Keep track of internships you're interested in
          </p>
        </div>

        {/* --- Conditional Rendering --- */}
        {savedItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedItems.map(internship => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                isSaved={true} // It will always be true here
                onSave={() => handleSaveInternship(String(internship.id))}
                onApply={() => console.log('Apply:', internship.id)}
                onViewDetails={() => console.log('Details:', internship.id)}
              />
            ))}
          </div>
        ) : (
          // Empty State
          <Card className="border-0 shadow-soft">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                No saved internships yet
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start exploring internships and save the ones that interest you. 
                They'll appear here for easy access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/search">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Internships
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <VoiceAssistant onCommand={() => {}} />
    </div>
  );
};

export default SavedInternships;