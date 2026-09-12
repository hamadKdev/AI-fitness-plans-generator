import React, { useState } from 'react';
import { User, Mail, LogOut, Settings, Dumbbell, Shield, Sparkles, Database, Check, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiConfigModal } from '../components/ApiConfigModal';
import { getApiBaseUrl, DEFAULT_API_BASE_URL } from '../config/api';

export const ProfilePage: React.FC = () => {
  const { user, fitnessDetails, logout, setCurrentPage } = useAuth();
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const currentApiBaseUrl = getApiBaseUrl();

  const handleLogout = () => {
    logout();
  };

  return (
    <div id="profile-page-container" className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-600/20">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {user?.fullName || 'User Profile'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            {user?.userId && (
              <p className="text-[11px] text-slate-400 font-mono">
                User ID: {user.userId}
              </p>
            )}
          </div>
        </div>

        <button
          id="profile-logout-btn"
          onClick={handleLogout}
          className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Fitness Profile Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Saved Fitness Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your synchronized physical attributes and preferences
              </p>
            </div>
          </div>
          <button
            id="profile-edit-fitness-btn"
            onClick={() => setCurrentPage('fitness-form')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Update Details
          </button>
        </div>

        {fitnessDetails ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Goal</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">{fitnessDetails.fitnessGoal || 'General Fitness'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Experience</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{fitnessDetails.experienceLevel || 'Beginner'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Days/Week</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{fitnessDetails.workoutDays || 5} Days</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Diet</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">{fitnessDetails.foodPreference || 'Balanced'}</span>
            </div>
            {fitnessDetails.age && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{fitnessDetails.age} Years</span>
              </div>
            )}
            {fitnessDetails.height && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Height</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{fitnessDetails.height} cm</span>
              </div>
            )}
            {fitnessDetails.weight && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Weight</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{fitnessDetails.weight} kg</span>
              </div>
            )}
            {fitnessDetails.availableEquipment && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Equipment</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">{fitnessDetails.availableEquipment}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-xs text-slate-500 space-y-2">
            <p>No fitness metrics saved yet.</p>
            <button
              onClick={() => setCurrentPage('fitness-form')}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium cursor-pointer"
            >
              Fill Fitness Form
            </button>
          </div>
        )}
      </div>

      {/* FastAPI Backend Server Settings */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                FastAPI Backend Integration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct endpoints integration via JavaScript <code className="font-mono text-indigo-600 dark:text-indigo-400">fetch()</code>
              </p>
            </div>
          </div>
          <button
            id="profile-open-api-btn"
            onClick={() => setIsApiModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Configure API URL
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Base API URL (API_BASE_URL)</span>
            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              {currentApiBaseUrl}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">POST /signup</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">POST /login</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">GET /dashboard?email=...</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">POST /generate-plan</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>
      </div>

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
};
