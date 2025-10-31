import React, { useState, useRef } from 'react'; // Import useRef
import Navbar from '@/components/Navbar';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// --- FIX: Add CheckCircle to imports ---
import { User, Mail, Phone, MapPin, FileText, Settings, Save, Upload, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // --- ADDED: State and refs for file upload functionality ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing mock data state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: '+91 9876543210',
    location: 'Mumbai, Maharashtra',
    bio: 'Computer Science student passionate about AI and web development.',
    skills: ['JavaScript', 'React', 'Python', 'Machine Learning'],
    interests: ['Technology', 'Finance', 'Design'],
    experience: 'Beginner',
    availability: 'Full-time',
    // --- FIX: Use real user data to check for an uploaded resume ---
    resumeUploaded: user?.resume || false, 
  });

  const [editedData, setEditedData] = useState(profileData);

  const availableSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning',
    'Data Analysis', 'UI/UX Design', 'Digital Marketing', 'Finance',
    'Project Management', 'Content Writing', 'Photography'
  ];

  const availableInterests = [
    'Technology', 'Finance', 'Healthcare', 'Marketing', 'Education',
    'Media', 'Engineering', 'Design', 'Research', 'Non-profit'
  ];

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
    toast({
      title: "Profile updated!",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleSkillToggle = (skill: string) => {
    setEditedData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setEditedData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // --- ADDED: Functions for handling resume upload ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleResumeUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('resumeFile', selectedFile);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/upload-resume/${user.id}/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Resume upload failed.');
      }

      await response.json();
      toast({
        title: "Success!",
        description: "Your resume has been uploaded.",
      });
      setProfileData(prev => ({...prev, resumeUploaded: true}));
      setSelectedFile(null);

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

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('edit profile') || lowerCommand.includes('update profile')) {
      setIsEditing(true);
    } else if (lowerCommand.includes('save')) {
      if (isEditing) {
        handleSave();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{profileData.name}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- REPLACED: Resume Section with functional code --- */}
            <Card className="border-0 shadow-soft mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />

                {profileData.resumeUploaded && !selectedFile && (
                  <div className="p-4 bg-green-100 text-green-800 rounded-lg text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Resume on file.</p>
                  </div>
                )}
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">Ready to upload</p>
                    </div>
                    <Button onClick={handleResumeUpload} disabled={isUploading} className="w-full">
                      {isUploading ? 'Uploading...' : 'Confirm Upload'}
                    </Button>
                  </div>
                ) : (
                   <Button variant="outline" className="w-full" onClick={handleUploadClick}>
                      <Upload className="h-4 w-4 mr-2" />
                      {profileData.resumeUploaded ? 'Replace Resume' : 'Upload Resume'}
                   </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editedData.name}
                          onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={editedData.phone}
                          onChange={(e) => setEditedData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editedData.location}
                        onChange={(e) => setEditedData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full p-3 border rounded-md resize-none"
                        rows={3}
                        value={editedData.bio}
                        onChange={(e) => setEditedData(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Bio</Label>
                      <p className="text-muted-foreground mt-1">{profileData.bio}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Experience Level</Label>
                        <p className="text-muted-foreground mt-1">{profileData.experience}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Availability</Label>
                        <p className="text-muted-foreground mt-1">{profileData.availability}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={editedData.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label htmlFor={skill} className="text-sm">{skill}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Areas of Interest</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-3 gap-3">
                    {availableInterests.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={editedData.interests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                        />
                        <Label htmlFor={interest} className="text-sm">{interest}</Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <Badge key={interest} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <VoiceAssistant onCommand={handleVoiceCommand} />
    </div>
  );
};

export default Profile;
