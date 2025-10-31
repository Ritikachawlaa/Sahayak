import React, { useState, useRef } from 'react'; // --- FIX: Import useRef
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
// --- FIX: Add CheckCircle for UI feedback ---
import { Upload, FileText, MapPin, Mic, ChevronRight, Check, CheckCircle } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const { user, completeOnboarding } = useAuth(); // Get user from context
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ADDED: State and refs for file upload functionality ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ADDED: Functions for handling resume upload ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Immediately upload the file once selected
      handleResumeUpload(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleResumeUpload = async (file: File) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to upload a resume.", variant: "destructive"});
        return;
    };
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/upload-resume/${user.id}/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Resume upload failed.');

      await response.json();
      toast({
        title: "Success!",
        description: "Your resume has been uploaded.",
      });
      setResumeUploaded(true); // Set upload status to true
      
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Could not upload your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sectors = [
    'Technology', 'Finance', 'Healthcare', 'Marketing', 'Education',
    'Media', 'Engineering', 'Design', 'Research', 'Non-profit'
  ];

  const handleInterestChange = (sector: string, checked: boolean) => {
    setInterests(prev => 
      checked 
        ? [...prev, sector]
        : prev.filter(item => item !== sector)
    );
  };

  const handleComplete = () => {
    const profileData = {
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: interests,
      location: location,
    };
    completeOnboarding(profileData);
    toast({
      title: "Setup complete!",
      description: "Welcome to your personalized dashboard.",
    });
    navigate('/dashboard');
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-strong">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step < currentStep ? <Check className="h-4 w-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-0.5 ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Let's Get You Started</CardTitle>
            <CardDescription>
              Step {currentStep} of 3 - Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Skills & Experience</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your resume or tell us about your skills
                  </p>
                </div>

                <div className="space-y-4">
                  {/* --- HIDDEN FILE INPUT --- */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  
                  {/* --- UPDATED: Functional Upload Button --- */}
                  <Button variant="outline" className="w-full h-20 border-dashed" onClick={handleUploadClick} disabled={isUploading}>
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-1" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Resume (PDF, DOCX)'}</span>
                    </div>
                  </Button>
                  
                  {/* --- ADDED: UI Feedback for upload status --- */}
                  {resumeUploaded && (
                     <div className="p-3 bg-green-100 text-green-800 rounded-lg text-center text-sm flex items-center justify-center">
                       <CheckCircle className="h-4 w-4 mr-2" />
                       <p className="font-medium">Resume uploaded successfully!</p>
                     </div>
                  )}
                  
                  <div className="text-center text-sm text-muted-foreground">or</div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Enter your skills manually (comma-separated)</Label>
                    <textarea
                      id="skills"
                      className="w-full p-3 border rounded-md resize-none"
                      rows={4}
                      placeholder="e.g., JavaScript, React, Python, Data Analysis..."
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={nextStep} className="w-full">
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preferences</h3>
                  <p className="text-muted-foreground mb-6">
                    Select your interests and preferred location
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Location</Label>
                    <Input
                      placeholder="e.g., Delhi, Mumbai, Bangalore..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Sectors of Interest</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={sector}
                            checked={interests.includes(sector)}
                            onCheckedChange={(checked) => 
                              handleInterestChange(sector, checked as boolean)
                            }
                          />
                          <Label htmlFor={sector} className="text-sm">{sector}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Voice Assistant</h3>
                  <p className="text-muted-foreground mb-6">
                    Enable voice commands for easier navigation
                  </p>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h4 className="font-medium mb-3">How to use voice commands:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• "Find internships in AI in Delhi"</li>
                    <li>• "Show my saved internships"</li>
                  </ul>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Setup
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
