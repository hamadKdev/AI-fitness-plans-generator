import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  FileEdit, 
  Eye, 
  RefreshCw, 
  LogOut, 
  AlertTriangle, 
  ArrowRight, 
  Target,
  User,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { DashboardResponse } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, fitnessPlan, setCurrentPage, logout, login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // GET ${API_BASE_URL}/dashboard?email=...
      const data = await apiService.getDashboard(user.email);
      setIsLoading(false);
      setDashboardData(data);

      if (data.message === 'User not found') {
        setErrorMessage('User not found in FastAPI backend.');
      } else if (data.user) {
        // Synchronize state with latest user details from FastAPI backend
        if (data.user.name && data.user.name !== user.fullName) {
          login({
            ...user,
            fullName: data.user.name,
            email: data.user.email || user.email,
          });
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err.message || 'Unable to load dashboard data from FastAPI backend at http://127.0.0.1:8000'
      );
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.email]);

  const hasPlan = !!fitnessPlan;
  const currentUserName = dashboardData?.user?.name || user?.fullName || user?.email?.split('@')[0] || 'Athlete';
  const currentUserEmail = dashboardData?.user?.email || user?.email || '';

  return (
    <div id="dashboard-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 md:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            FastAPI Connected Dashboard
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {currentUserName}!
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            {dashboardData?.message || 'Welcome to your AI fitness & nutrition command center.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-indigo-200">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {currentUserEmail}
            </span>
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh API</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Loading state banner */}
      {isLoading && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center gap-3 text-sm animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Fetching real-time profile data from FastAPI backend (<code>GET /dashboard?email={currentUserEmail}</code>)...</span>
        </div>
      )}

      {/* Error state alert */}
      {errorMessage && (
        <div
          id="dashboard-error-alert"
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">FastAPI Dashboard Error</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5 font-mono">
                {errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* Real API Response Data & Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Details from API */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Account Profile (FastAPI)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live API response data</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Active User
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-left">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Name</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">{currentUserName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Email</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">{currentUserEmail}</span>
              </div>
            </div>

            {dashboardData?.message && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] uppercase font-semibold text-indigo-500 block">Server Message</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  "{dashboardData.message}"
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              id="dashboard-edit-details-btn"
              onClick={() => setCurrentPage('fitness-form')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              Configure & Generate Plan
            </button>
          </div>
        </div>

        {/* Current Plan Status Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Fitness Plan Status</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">FastAPI Plan Generation Engine</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              hasPlan
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20'
            }`}>
              {hasPlan ? 'Plan Generated' : 'No Active Plan'}
            </span>
          </div>

          {hasPlan ? (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Goal: {fitnessPlan.goal || 'Custom Routine'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {fitnessPlan.workout_days || fitnessPlan.workoutSchedule || 5} Days/Week
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span>Experience: <strong>{fitnessPlan.experience || fitnessPlan.experienceLevel || 'Beginner'}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
              You haven't generated a plan yet. Use the "Generate Plan" feature to request your personalized routine from FastAPI.
            </p>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {hasPlan ? (
              <>
                <button
                  id="dashboard-view-current-plan-btn"
                  onClick={() => setCurrentPage('my-plan')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Current Plan
                </button>
                <button
                  id="dashboard-generate-new-plan-btn"
                  onClick={() => setCurrentPage('fitness-form')}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate New Plan
                </button>
              </>
            ) : (
              <button
                id="dashboard-create-my-plan-btn"
                onClick={() => setCurrentPage('fitness-form')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Fitness Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Action Hub */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Create / View Plan */}
          <button
            id="action-card-plan"
            onClick={() => setCurrentPage(hasPlan ? 'my-plan' : 'fitness-form')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                {hasPlan ? 'View My Fitness Plan' : 'Generate Plan'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {hasPlan ? 'Review exercises, workouts & schedule' : 'Request a routine via POST /generate-plan'}
              </p>
            </div>
          </button>

          {/* Action 2: Edit Details / Form */}
          <button
            id="action-card-details"
            onClick={() => setCurrentPage('fitness-form')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Fitness Plan Form
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set Goal, Experience & Workout Days
              </p>
            </div>
          </button>

          {/* Action 3: Profile */}
          <button
            id="action-card-profile"
            onClick={() => setCurrentPage('profile')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Profile & API Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Check user session and FastAPI server
              </p>
            </div>
          </button>

          {/* Action 4: Logout */}
          <button
            id="action-card-logout"
            onClick={logout}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500 hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                Logout
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Safely end your session
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
