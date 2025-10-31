import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfileData, Internship } from '@/types'; // Import Internship type

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: (profileData: UserProfileData) => void;
  isLoading: boolean;
  
  // --- New additions for saved internships ---
  savedInternshipIds: string[];
  recommendedInternships: Internship[];
  saveInternship: (internshipId: string) => void;
  unsaveInternship: (internshipId: string) => void;
  setRecommendedInternships: (internships: Internship[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- New state for saved internships ---
  const [savedInternshipIds, setSavedInternshipIds] = useState<string[]>([]);
  const [recommendedInternships, setRecommendedInternships] = useState<Internship[]>([]);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
     const response = await fetch('http://127.0.0.1:8000/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
     if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setSavedInternshipIds([]); // Clear saved internships on logout
  };

  const completeOnboarding = (profileData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData, isOnboarded: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };
  
  // --- New functions to manage state ---
  const saveInternship = (internshipId: string) => {
    setSavedInternshipIds(prev => [...prev, internshipId]);
  };
  
  const unsaveInternship = (internshipId: string) => {
    setSavedInternshipIds(prev => prev.filter(id => id !== internshipId));
  };


  const value = {
    user,
    login,
    signup,
    logout,
    completeOnboarding,
    isLoading,
    // --- Expose new state and functions ---
    savedInternshipIds,
    recommendedInternships,
    saveInternship,
    unsaveInternship,
    setRecommendedInternships,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};