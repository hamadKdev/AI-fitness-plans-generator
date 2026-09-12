import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageView, UserSession, FitnessFormData, StructuredFitnessPlan } from '../types';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  currentPage: PageView;
  fitnessDetails: FitnessFormData | null;
  fitnessPlan: StructuredFitnessPlan | null;
  setCurrentPage: (page: PageView) => void;
  login: (userData: UserSession) => void;
  logout: () => void;
  saveFitnessDetails: (details: FitnessFormData) => void;
  saveFitnessPlan: (plan: any) => void;
  clearPlan: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'ai_fitness_user_session';
const DETAILS_STORAGE_KEY = 'ai_fitness_details';
const PLAN_STORAGE_KEY = 'ai_fitness_plan';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [fitnessDetails, setFitnessDetails] = useState<FitnessFormData | null>(() => {
    try {
      const saved = localStorage.getItem(DETAILS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [fitnessPlan, setFitnessPlan] = useState<StructuredFitnessPlan | null>(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPageState] = useState<PageView>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? 'dashboard' : 'login';
    } catch {
      return 'login';
    }
  });

  const isAuthenticated = !!user;

  // Route Protection Guard
  const setCurrentPage = (page: PageView) => {
    const protectedPages: PageView[] = ['dashboard', 'fitness-form', 'my-plan', 'profile'];
    if (protectedPages.includes(page) && !user) {
      setCurrentPageState('login');
      return;
    }
    // If logged in and tries to go to login or signup, allow or direct to dashboard
    setCurrentPageState(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (userData: UserSession) => {
    const session: UserSession = {
      ...userData,
      createdAt: userData.createdAt || new Date().toISOString(),
    };
    setUser(session);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to persist user session', e);
    }
    setCurrentPageState('dashboard');
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      // Keep or clear plan if desired, but user session is cleared
    } catch (e) {
      console.error('Failed to remove user session', e);
    }
    setCurrentPageState('login');
  };

  const saveFitnessDetails = (details: FitnessFormData) => {
    setFitnessDetails(details);
    try {
      localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
    } catch (e) {
      console.error('Failed to save fitness details', e);
    }
  };

  const saveFitnessPlan = (plan: any) => {
    setFitnessPlan(plan);
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save fitness plan', e);
    }
  };

  const clearPlan = () => {
    setFitnessPlan(null);
    try {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear fitness plan', e);
    }
  };

  // Sync state if user changes
  useEffect(() => {
    const protectedPages: PageView[] = ['dashboard', 'fitness-form', 'my-plan', 'profile'];
    if (!user && protectedPages.includes(currentPage)) {
      setCurrentPageState('login');
    }
  }, [user, currentPage]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        currentPage,
        fitnessDetails,
        fitnessPlan,
        setCurrentPage,
        login,
        logout,
        saveFitnessDetails,
        saveFitnessPlan,
        clearPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
