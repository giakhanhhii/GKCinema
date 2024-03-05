import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, signOut as firebaseSignOut, getAuth } from 'firebase/auth';
import { auth } from '../config/firebase';

// Extend Firebase User type with our custom fields
interface CustomUser extends FirebaseUser {
  firstName?: string;
  lastName?: string;
  profile?: {
    phoneNumber?: string;
    preferredLanguage?: string;
    dateOfBirth?: string;
    profilePicture?: string;
  };
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase User to CustomUser
        const customUser: CustomUser = {
          ...firebaseUser,
          firstName: '',
          lastName: '',
          profile: {
            phoneNumber: '',
            preferredLanguage: 'en',
            dateOfBirth: '',
            profilePicture: '',
          },
        };
        setUser(customUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (user) {
        // Update user profile in Firebase
        // This is a placeholder - implement actual profile update logic
        console.log('Updating profile:', data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
