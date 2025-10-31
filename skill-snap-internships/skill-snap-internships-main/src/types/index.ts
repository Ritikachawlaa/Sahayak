export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  lat: number;
  lng: number;
  duration: string;
  stipend: string;
  type: 'paid' | 'unpaid';
  tags: string[] | string;
  description: string;
  postedDate: string;
  remote: boolean;
  sector: string;
  score?: number;
  missing_skills_with_resources?: {
    skill: string;
    resources: {
      websites: string[];
      youtube: string;
    };
  }[];
}

export interface UserProfileData {
  skills?: string[];
  interests?: string[];
  location?: string;
  education?: string;
}

export interface User extends UserProfileData {
  id: string;
  name: string;
  email: string;
  isOnboarded: boolean;
  // --- FIX: Add the optional resume property ---
  // It's a string because the backend will send the URL to the file.
  resume?: string;
}

