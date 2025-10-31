import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import InternshipCard from '@/components/InternshipCard';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Internship } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'stipend' | 'duration'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [savedInternships, setSavedInternships] = useState<string[]>([]);
  const { toast } = useToast();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [allSectors, setAllSectors] = useState<string[]>([]);
  
  // --- Fetch recommendations from Django Backend ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        const userProfile = {
          skills: user.skills || [],
          interests: user.interests || [],
          location_preference: [], // Initially fetch for all locations
        };

        const response = await fetch('http://127.0.0.1:8000/api/recommend/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProfile),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data: Internship[] = await response.json();
        // **FIX:** Transform tags from string to string[]
        const formattedData = data.map(internship => ({
          ...internship,
          tags: typeof internship.tags === 'string' ? internship.tags.split(',').map(tag => tag.trim()) : [],
        }));
        setInternships(formattedData);

        // Dynamically populate filters from fetched data
        const locations = Array.from(new Set(data.map(i => i.location)));
        const sectors = Array.from(new Set(data.map(i => i.sector)));
        setAllLocations(locations);
        setAllSectors(sectors);

      } catch (error) {
        console.error("API Error:", error);
        toast({
          title: "Error",
          description: "Could not fetch internship recommendations.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, toast]);

  // --- Client-side filtering and sorting ---
  const filteredInternships = useMemo(() => {
    let filtered = internships.filter(internship => {
      const matchesSearch = !searchQuery ||
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(internship.tags) && internship.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesLocation = selectedLocations.length === 0 ||
        selectedLocations.includes(internship.location);
      
      const matchesSector = selectedSectors.length === 0 ||
        selectedSectors.includes(internship.sector);
      
      const matchesType = selectedType === 'all' || internship.type === selectedType;

      return matchesSearch && matchesLocation && matchesSector && matchesType;
    });

    // Sort results
    if (sortBy === 'stipend') {
      filtered.sort((a, b) => {
        const aStipend = a.type === 'paid' && a.stipend ? parseInt(a.stipend.replace(/[^\d]/g, '')) : 0;
        const bStipend = b.type === 'paid' && b.stipend ? parseInt(b.stipend.replace(/[^\d]/g, '')) : 0;
        return bStipend - aStipend;
      });
    } else if (sortBy === 'duration') {
       filtered.sort((a, b) => {
        const aDuration = a.duration ? parseInt(a.duration.replace(/[^\d]/g, '')) : 999;
        const bDuration = b.duration ? parseInt(b.duration.replace(/[^\d]/g, '')) : 999;
        return aDuration - bDuration;
      });
    }
    
    return filtered;
  }, [internships, searchQuery, selectedLocations, selectedSectors, selectedType, sortBy]);


  const handleLocationChange = (location: string, checked: boolean) => {
    setSelectedLocations(prev =>
      checked
        ? [...prev, location]
        : prev.filter(loc => loc !== location)
    );
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    setSelectedSectors(prev =>
      checked
        ? [...prev, sector]
        : prev.filter(sec => sec !== sector)
    );
  };
  
  const clearFilters = () => {
    setSelectedLocations([]);
    setSelectedSectors([]);
    setSelectedType('all');
    setSearchQuery('');
  };

  const handleSaveInternship = (id: string) => {
    setSavedInternships(prev => {
      if (prev.includes(id)) {
        return prev.filter(savedId => savedId !== id);
      } else {
        toast({
          title: "Internship saved!",
          description: "Added to your saved internships.",
        });
        return [...prev, id];
      }
    });
  };

  const handleApplyInternship = (id: string) => {
    toast({
      title: "Application submitted!",
      description: "We'll notify you about the status.",
    });
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      const searchTerms = lowerCommand.replace(/search|find|internships?|for/g, '').trim();
      if (searchTerms) {
        setSearchQuery(searchTerms);
      }
    } else if (lowerCommand.includes('paid')) {
      setSelectedType('paid');
    } else if (lowerCommand.includes('remote')) {
      setSearchQuery('remote');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search Internships
          </h1>
          <p className="text-muted-foreground">
            Find the perfect internship from our listings
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-soft sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-6 ${showFilters || 'hidden lg:block'}`}>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>

                <div className="space-y-3">
                  <h3 className="font-medium">Type</h3>
                  <div className="space-y-2">
                    {['all', 'paid', 'unpaid'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedType === type}
                          onCheckedChange={() => setSelectedType(type as any)}
                        />
                        <label htmlFor={type} className="text-sm capitalize">
                          {type === 'all' ? 'All Types' : type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Location</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allLocations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={location}
                          checked={selectedLocations.includes(location)}
                          onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                        />
                        <label htmlFor={location} className="text-sm">
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Sector</h3>
                  <div className="space-y-2">
                    {allSectors.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={sector}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={(checked) => 
                            handleSectorChange(sector, checked as boolean)
                          }
                        />
                        <label htmlFor={sector} className="text-sm">
                          {sector}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, company, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="stipend">Highest Stipend</SelectItem>
                      <SelectItem value="duration">Shortest Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Active Filters */}
            {(selectedLocations.length > 0 || selectedSectors.length > 0 || selectedType !== 'all') && (
              <div className="flex flex-wrap gap-2">
                {selectedType !== 'all' && (
                  <Badge variant="secondary" className="capitalize">
                    {selectedType}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setSelectedType('all')}
                    />
                  </Badge>
                )}
                {selectedLocations.map((location) => (
                  <Badge key={location} variant="secondary">
                    {location}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleLocationChange(location, false)}
                    />
                  </Badge>
                ))}
                {selectedSectors.map((sector) => (
                  <Badge key={sector} variant="secondary">
                    {sector}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleSectorChange(sector, false)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredInternships.length} internships found
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="border-0 shadow-soft p-6">
                            <div className="flex items-start justify-between">
                               <div className="flex-1 space-y-2">
                                  <Skeleton className="h-6 w-3/4" />
                                  <Skeleton className="h-4 w-1/2" />
                               </div>
                               <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                             <div className="space-y-4 mt-4">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-5/6" />
                               <div className="flex space-x-4 pt-2">
                                  <Skeleton className="h-10 flex-1" />
                                  <Skeleton className="h-10 w-24" />
                               </div>
                            </div>
                        </Card>
                    ))}
                </div>
              ) : filteredInternships.length === 0 ? (
                <Card className="border-0 shadow-soft">
                  <CardContent className="p-8 text-center">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No internships found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredInternships.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      isSaved={savedInternships.includes(internship.id)}
                      onSave={() => handleSaveInternship(internship.id)}
                      onApply={() => handleApplyInternship(internship.id)}
                      onViewDetails={(id) => console.log('View details:', id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <VoiceAssistant onCommand={handleVoiceCommand} />
    </div>
  );
};

export default Search;