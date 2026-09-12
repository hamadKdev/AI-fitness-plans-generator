import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  FileEdit, 
  RefreshCw, 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  Droplet, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Target, 
  User, 
  ShieldCheck,
  ChevronRight,
  Flame,
  Printer,
  FileDown,
  Check,
  Tag,
  Clock,
  IdCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateFitnessPlanPdf } from '../utils/pdfGenerator';
import ReactMarkdown from 'react-markdown';

export const MyFitnessPlanPage: React.FC = () => {
  const { user, fitnessDetails, fitnessPlan, setCurrentPage } = useAuth();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // If no plan is generated yet
  if (!fitnessPlan) {
    return (
      <div id="no-plan-container" className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60">
          <Dumbbell className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            No Active Fitness Plan Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You haven't generated an AI fitness plan yet. Fill out the fitness information form to create your personalized workout and nutrition program.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            id="empty-plan-create-btn"
            onClick={() => setCurrentPage('fitness-form')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate My Plan</span>
          </button>
          <button
            id="empty-plan-dashboard-btn"
            onClick={() => setCurrentPage('dashboard')}
            className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      // Converts the displayed plan into a clean professional PDF and downloads directly
      generateFitnessPlanPdf({
        plan: fitnessPlan,
        user,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Helper values
  const planId = fitnessPlan.planId || fitnessPlan.id || fitnessPlan.plan_id || 'PLAN-AI-01';
  const userId = fitnessPlan.userId || user?.userId || 'U-GUEST';
  const planStatus = fitnessPlan.planStatus || fitnessPlan.status || 'Active';
  const generatedDateFormatted = fitnessPlan.generatedDate || fitnessPlan.generatedAt
    ? new Date(fitnessPlan.generatedDate || fitnessPlan.generatedAt || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString();

  // Helper to extract formatted workout content
  const renderWorkoutPlan = () => {
    const raw = fitnessPlan.weeklyWorkoutPlan;
    if (!raw) {
      return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-500">
          No workout schedule details available in the response.
        </div>
      );
    }

    if (typeof raw === 'string') {
      return (
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
          <ReactMarkdown>{raw}</ReactMarkdown>
        </div>
      );
    }

    if (Array.isArray(raw)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {raw.map((dayPlan: any, index: number) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {dayPlan.day || `Day ${index + 1}`}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {dayPlan.focus || 'Training Session'}
                </span>
              </div>

              {dayPlan.exercises && Array.isArray(dayPlan.exercises) && (
                <ul className="space-y-2 text-xs">
                  {dayPlan.exercises.map((ex: any, exIdx: number) => (
                    <li key={exIdx} className="flex items-start justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{ex.name}</span>
                        {ex.tips && <span className="text-[11px] text-slate-400">{ex.tips}</span>}
                      </div>
                      <div className="text-right shrink-0 text-slate-600 dark:text-slate-400">
                        <span className="font-mono">{ex.sets} sets × {ex.reps}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
        <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(raw, null, 2)}
        </pre>
      </div>
    );
  };

  // Helper to extract meal content
  const renderMealSuggestions = () => {
    const raw = fitnessPlan.mealSuggestions;
    if (!raw) {
      return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-500">
          Target calories and macronutrient ratios balanced according to your goal: {fitnessPlan.goal}. High lean protein intake, clean complex carbohydrates, and essential micronutrients.
        </div>
      );
    }

    if (typeof raw === 'string') {
      return (
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4">
          <ReactMarkdown>{raw}</ReactMarkdown>
        </div>
      );
    }

    if (Array.isArray(raw)) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {raw.map((meal: any, index: number) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {meal.mealType || `Meal ${index + 1}`}
                </span>
                {meal.calories && (
                  <span className="text-[11px] font-mono font-medium text-slate-500">
                    {meal.calories} kcal
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {meal.description || meal.name || JSON.stringify(meal)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
        <pre className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(raw, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div id="my-fitness-plan-page-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI Synchronized Blueprint
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Fitness Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real personalized workout routine and nutrition blueprint generated for {fitnessPlan.name || user?.fullName || 'you'}.
          </p>
        </div>

        {/* Buttons: Download My Plan as PDF, Edit Details, Generate New Plan, Return to Dashboard */}
        <div className="flex items-center flex-wrap gap-2.5 print:hidden w-full md:w-auto">
          <button
            id="plan-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-75"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-white" />
                <span>Download My Plan as PDF</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="plan-edit-details-btn"
              onClick={() => setCurrentPage('fitness-form')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            <button
              id="plan-generate-new-btn"
              onClick={() => setCurrentPage('fitness-form')}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Plan</span>
            </button>

            <button
              id="plan-return-dashboard-btn"
              onClick={() => setCurrentPage('dashboard')}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Header Summary Card */}
      <div id="plan-printable-area" className="space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-400 block mb-1">
                Customized Protocol
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {fitnessPlan.goal || fitnessDetails?.fitnessGoal || 'Personalized Routine'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold backdrop-blur-md">
                Status: {planStatus}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md text-slate-200">
                Generated: {generatedDateFormatted}
              </span>
            </div>
          </div>

          {/* Core Plan Parameters & Metadata Grid (Plan ID, User ID, Goal, Experience, Schedule, Equipment) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-indigo-300 block text-[10px] uppercase font-semibold">Plan ID</span>
              <span className="font-mono font-bold text-white text-xs truncate block" title={String(planId)}>
                {String(planId)}
              </span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-indigo-300 block text-[10px] uppercase font-semibold">User ID</span>
              <span className="font-mono font-bold text-white text-xs truncate block" title={String(userId)}>
                {String(userId)}
              </span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-indigo-300 block text-[10px] uppercase font-semibold">Athlete</span>
              <span className="font-bold text-white text-sm truncate block">{fitnessPlan.name || user?.fullName || 'User'}</span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-indigo-300 block text-[10px] uppercase font-semibold">Experience</span>
              <span className="font-bold text-white text-sm block">{fitnessPlan.experienceLevel || fitnessDetails?.experienceLevel || 'Beginner'}</span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-indigo-300 block text-[10px] uppercase font-semibold">Schedule</span>
              <span className="font-bold text-white text-sm block">{fitnessPlan.workoutSchedule || `${fitnessDetails?.workoutDays || 4} Days/Wk`}</span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-indigo-300 block text-[10px] uppercase font-semibold">Equipment</span>
              <span className="font-bold text-white text-sm truncate block">{fitnessPlan.equipment || fitnessDetails?.availableEquipment || 'Standard Gym'}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Weekly Workout Plan */}
        <div id="section-workout-plan" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Workout Plan & Training Schedule
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exercise selection, sets, reps, and progression rules received from AI engine
              </p>
            </div>
          </div>

          <div className="pt-2">
            {renderWorkoutPlan()}
          </div>
        </div>

        {/* Section 2: Meal Suggestions & Nutrition */}
        <div id="section-meal-suggestions" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Meal & Nutrition Suggestions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimized nutrition protocol for {fitnessPlan.foodPreference || fitnessDetails?.foodPreference || 'your diet preference'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            {renderMealSuggestions()}
          </div>
        </div>

        {/* Section 3: Water Goal & Important Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Water Goal Card */}
          <div id="section-water-goal" className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Water Goal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Daily Hydration Target</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center space-y-2">
              <span className="text-3xl font-extrabold text-cyan-700 dark:text-cyan-300 font-mono">
                {fitnessPlan.waterGoal || '3.5 L'}
              </span>
              <p className="text-xs text-cyan-800 dark:text-cyan-200">
                Drink approximately 500ml upon waking, and maintain steady hydration during training sessions.
              </p>
            </div>
          </div>

          {/* Important Notes Card */}
          <div id="section-important-notes" className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Important Notes & Guidelines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Recovery, Form, & Safety</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {Array.isArray(fitnessPlan.importantNotes) ? (
                fitnessPlan.importantNotes.map((note: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  {String(fitnessPlan.importantNotes || 'Warm up adequately and respect recovery periods.')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Download Card */}
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Export Your Complete Program
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download your AI workout schedule and meal suggestions directly as a formatted PDF.
            </p>
          </div>
          <button
            id="plan-bottom-download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-75"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Download My Plan as PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
