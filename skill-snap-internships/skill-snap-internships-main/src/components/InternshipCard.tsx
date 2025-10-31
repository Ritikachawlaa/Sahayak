import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// --- FIX: Re-import the Bookmark and TrendingUp icons ---
import { Bookmark, MapPin, IndianRupee, Clock, ExternalLink, Lightbulb, TrendingUp } from 'lucide-react';
import { Internship } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InternshipCardProps {
  internship: Internship;
  isSaved: boolean;
  onSave: (id: string) => void;
  onApply: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const InternshipCard: React.FC<InternshipCardProps> = ({ internship, isSaved, onSave, onApply, onViewDetails }) => {
  const { id, title, company, location, stipend, duration, tags, score, missing_skills_with_resources } = internship;

  return (
    <Card className="border-0 shadow-soft hover:shadow-strong transition-shadow duration-300 flex flex-col relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          {/* Add padding to the right to prevent title from overlapping with the score badge */}
          <div className="pr-28"> 
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{company}</CardDescription>
          </div>
          
          {/* --- FIX: The Save/Bookmark button has been re-added here --- */}
          <Button variant="ghost" size="icon" onClick={() => onSave(String(id))}>
            <Bookmark className={`h-5 w-5 ${isSaved ? 'text-primary fill-current' : 'text-muted-foreground'}`} />
          </Button>
        </div>

        {score && score > 0 && (
          <Badge 
            variant="outline"
            className="absolute top-6 right-6 bg-green-100 text-green-800 border-green-200 text-sm font-bold py-1 px-3"
          >
            <TrendingUp className="h-4 w-4 mr-1.5" />
            {Math.round(score)}% Match
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 text-sm text-muted-foreground flex-grow">
        <div className="flex items-center pt-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{location}</span>
        </div>
        <div className="flex items-center">
          <IndianRupee className="h-4 w-4 mr-2" />
          <span>{stipend}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span>{duration}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.isArray(tags) && tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">{tag.charAt(0).toUpperCase() + tag.slice(1)}</Badge>
          ))}
        </div>
      </CardContent>

      {missing_skills_with_resources && missing_skills_with_resources.length > 0 && (
        <CardContent className="pt-0">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start px-2 text-amber-600 hover:bg-amber-50">
                <Lightbulb className="h-4 w-4 mr-2" />
                Skills to Learn for this Role
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 pl-4 space-y-3">
              {missing_skills_with_resources.map(({ skill, resources }) => (
                <div key={skill}>
                  <p className="font-semibold text-xs text-foreground">{skill}</p>
                  <div className="flex space-x-4 mt-1">
                    <a href={resources.websites[0]} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-muted-foreground hover:text-primary">
                      Website <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a href={resources.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-muted-foreground hover:text-primary">
                      YouTube <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onViewDetails(String(id))}>View Details</Button>
        <Button onClick={() => onApply(String(id))}>Apply Now</Button>
      </CardFooter>
    </Card>
  );
};

export default InternshipCard;

