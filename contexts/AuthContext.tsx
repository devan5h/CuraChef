import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserPreferences } from '../types';
import * as db from '../database';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  authError: string | null;
  authModalState: 'none' | 'signIn' | 'signUp';
  setAuthModalState: (state: 'none' | 'signIn' | 'signUp') => void;
  closeAuthModal: () => void;
  handleSignUp: (email: string, password: string) => Promise<boolean>;
  handleSignIn: (email: string, password: string) => Promise<boolean>;
  handleSignOut: () => void;
  handleSavePreferences: (prefs: UserPreferences) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authModalState, setAuthModalState] = useState<'none' | 'signIn' | 'signUp'>('none');

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const allUsers = await db.getUsers();
      setUsers(allUsers);
      setIsLoading(false);
    };
    loadUsers();
  }, []);

  const handleSavePreferences = async (prefs: UserPreferences) => {
    if (!currentUser) return;
    
    const updatedUser = await db.updateUserPreferences(currentUser.email, prefs);
    if (updatedUser) {
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.email === updatedUser.email ? updatedUser : u));
    }
  };
  
  const handleSignUp = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const newUser = await db.addUser(email, password);
      setUsers(prevUsers => [...prevUsers, newUser]);
      setCurrentUser(newUser);
      setAuthModalState('none');
      return true;
    } catch (e) {
      if (e instanceof Error) setAuthError(e.message);
      return false;
    }
  };
  
  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    // Note: We are re-fetching users here in case another tab registered a user.
    // In a real-world scenario, you might use more advanced state-syncing.
    const currentUsers = await db.getUsers(); 
    setUsers(currentUsers);
    const user = currentUsers.find(u => u.email === email);
    
    if (user && user.password === password) {
      setCurrentUser(user);
      setAuthModalState('none');
      return true;
    }
    setAuthError("Invalid email or password.");
    return false;
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  const closeAuthModal = () => {
    setAuthModalState('none');
    setAuthError(null);
  };

  const value = {
    currentUser,
    isLoading,
    authError,
    authModalState,
    setAuthModalState,
    closeAuthModal,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    handleSavePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};