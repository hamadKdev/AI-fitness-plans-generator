import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FitnessFormPage } from './pages/FitnessFormPage';
import { MyFitnessPlanPage } from './pages/MyFitnessPlanPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { currentPage } = useAuth();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'signup':
        return <SignUpPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'fitness-form':
        return <FitnessFormPage />;
      case 'my-plan':
        return <MyFitnessPlanPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full pb-16">
        {renderCurrentPage()}
      </main>

      <footer className="w-full py-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AI Fitness Plan Generator. Connected to FastAPI Backend.</p>
          <p className="font-mono text-[11px] text-slate-400">FastAPI Real-Time Architecture</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
