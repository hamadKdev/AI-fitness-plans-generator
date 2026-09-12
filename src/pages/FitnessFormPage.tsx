import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  Save, 
  Check, 
  ArrowRight, 
  User, 
  Target, 
  Activity, 
  Calendar, 
  Utensils,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { AlertBanner } from '../components/AlertBanner';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { FitnessGoal, ExperienceLevel, FitnessFormData } from '../types';
import confetti from 'canvas-confetti';

export const FitnessFormPage: React.FC = () => {
  const { user, fitnessDetails, saveFitnessDetails, saveFitnessPlan, setCurrentPage } = useAuth();

  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(fitnessDetails?.fitnessGoal || 'Muscle Gain');
  const [customGoal, setCustomGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(fitnessDetails?.experienceLevel || 'Beginner');
  const [workoutDays, setWorkoutDays] = useState<number | string>(fitnessDetails?.workoutDays || 5);
  
  // Optional companion details
  const [age, setAge] = useState(fitnessDetails?.age || '');
  const [height, setHeight] = useState(fitnessDetails?.height || '');
  const [weight, setWeight] = useState(fitnessDetails?.weight || '');
  const [availableEquipment, setAvailableEquipment] = useState(fitnessDetails?.availableEquipment || 'Full Gym Equipment');
  const [foodPreference, setFoodPreference] = useState(fitnessDetails?.foodPreference || 'High Protein Balanced');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sync state if context changes
  useEffect(() => {
    if (fitnessDetails) {
      if (fitnessDetails.fitnessGoal) setFitnessGoal(fitnessDetails.fitnessGoal);
      if (fitnessDetails.experienceLevel) setExperienceLevel(fitnessDetails.experienceLevel);
      if (fitnessDetails.workoutDays) setWorkoutDays(fitnessDetails.workoutDays);
      if (fitnessDetails.age) setAge(fitnessDetails.age);
      if (fitnessDetails.height) setHeight(fitnessDetails.height);
      if (fitnessDetails.weight) setWeight(fitnessDetails.weight);
      if (fitnessDetails.availableEquipment) setAvailableEquipment(fitnessDetails.availableEquipment);
      if (fitnessDetails.foodPreference) setFoodPreference(fitnessDetails.foodPreference);
    }
  }, [fitnessDetails]);

  const activeGoalString = fitnessGoal === 'Custom' ? customGoal.trim() : fitnessGoal;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!activeGoalString) {
      errors.fitnessGoal = 'Please select or enter your fitness goal';
    }

    if (!experienceLevel) {
      errors.experienceLevel = 'Please select your experience level';
    }

    const daysNum = Number(workoutDays);
    if (!daysNum || isNaN(daysNum) || daysNum < 1 || daysNum > 7) {
      errors.workoutDays = 'Workout days must be between 1 and 7';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getFormData = (): FitnessFormData => ({
    age: age.trim(),
    height: height.trim(),
    weight: weight.trim(),
    fitnessGoal: activeGoalString,
    experienceLevel,
    workoutDays: Number(workoutDays),
    availableEquipment,
    foodPreference,
  });

  const handleSaveDetailsOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setStatusMessage({
        type: 'error',
        text: 'Please correct the highlighted form fields before saving.',
      });
      return;
    }

    const data = getFormData();
    saveFitnessDetails(data);
    setStatusMessage({
      type: 'success',
      text: 'Fitness preferences saved to your session!',
    });
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // 1. Validate fields
    if (!validate()) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all required fields accurately before generating your plan.',
      });
      return;
    }

    const formData = getFormData();
    saveFitnessDetails(formData);

    // 2. Prepare payload for FastAPI:
    // { "goal": "Muscle Gain", "experience": "Beginner", "workout_days": 5 }
    setIsLoading(true);
    const payload = {
      goal: activeGoalString,
      experience: experienceLevel,
      workout_days: Number(workoutDays),
    };

    try {
      // 3. Send POST ${API_BASE_URL}/generate-plan using fetch()
      const response = await apiService.generatePlan(payload);
      setIsLoading(false);

      if (response.message === 'Fitness plan generated successfully' || response.plan) {
        const exactMsg = response.message || 'Fitness plan generated successfully!';
        setStatusMessage({
          type: 'success',
          text: exactMsg,
        });

        // Parse plan received from FastAPI
        const rawPlan = response.plan || response;
        const planId = rawPlan.planId || rawPlan.id || rawPlan.plan_id || `PLAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const planUserId = rawPlan.userId || user?.userId || user?.email || 'hamad@gmail.com';
        const planStatus = rawPlan.planStatus || 'Active';
        const planGenDate = rawPlan.generatedDate || rawPlan.generatedAt || new Date().toISOString();

        const workoutPlan = rawPlan.workoutPlan || rawPlan.weeklyWorkoutPlan || rawPlan.workoutSchedule || rawPlan.routine || null;
        const mealSuggestions = rawPlan.mealSuggestions || rawPlan.dietPlan || rawPlan.nutrition || null;

        const completePlan = {
          planId,
          userId: planUserId,
          planStatus,
          name: user?.fullName || 'Athlete',
          goal: rawPlan.goal || activeGoalString,
          experienceLevel: rawPlan.experience || experienceLevel,
          workoutSchedule: `${rawPlan.workout_days || workoutDays} Days / Week`,
          workout_days: rawPlan.workout_days || Number(workoutDays),
          equipment: availableEquipment,
          foodPreference,
          workoutPlan: workoutPlan || `### Weekly Training Routine (${rawPlan.workout_days || workoutDays} Days/Week)\n- **Goal**: ${rawPlan.goal || activeGoalString}\n- **Level**: ${rawPlan.experience || experienceLevel}\n- **Focus**: Progressive resistance training, compound movements, and scheduled active recovery periods.`,
          weeklyWorkoutPlan: workoutPlan,
          mealSuggestions: mealSuggestions || `### Personalized Nutrition Blueprint\n- High lean protein (1.6g - 2.2g per kg of body weight)\n- Nutrient-dense complex carbohydrates (oats, brown rice, sweet potatoes)\n- Essential healthy fats (avocado, nuts, olive oil)\n- Hydration goal: 3 to 3.5 Liters of water daily.`,
          dietPlan: mealSuggestions,
          waterGoal: rawPlan.waterGoal || '3.0 - 3.5 Liters / Day',
          importantNotes: rawPlan.importantNotes || [
            'Warm up 5-10 minutes with dynamic stretching prior to every session.',
            'Track your weights and aim for progressive overload weekly.',
            'Prioritize 7-8 hours of quality sleep for peak recovery and muscle growth.',
            'Stay properly hydrated before, during, and after workouts.'
          ],
          generatedDate: planGenDate,
          generatedAt: planGenDate,
          rawResponse: rawPlan,
        };

        saveFitnessPlan(completePlan);

        // Celebration effect
        try {
          confetti({
            particleCount: 65,
            spread: 75,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        // Redirect to My Fitness Plan page
        setTimeout(() => {
          setCurrentPage('my-plan');
        }, 1000);
      } else {
        // Show error returned by API
        setStatusMessage({
          type: 'error',
          text: response.message || 'Failed to generate fitness plan from FastAPI backend.',
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to connect to FastAPI backend at http://127.0.0.1:8000/generate-plan. Please verify your server is running.',
      });
    }
  };

  return (
    <div id="fitness-form-container" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {isLoading && (
        <LoadingOverlay
          id="generating-plan-overlay"
          message="Generating Your Custom Fitness Plan..."
          subtext="Sending parameters to FastAPI backend (POST /generate-plan)..."
        />
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
          <Sparkles className="w-4 h-4 text-amber-500" />
          FastAPI Plan Generator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Fitness Information Form
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure your primary goal, experience level, and weekly workout schedule to generate your personalized program.
        </p>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="space-y-2">
          <AlertBanner
            id="fitness-form-status-alert"
            type={statusMessage.type}
            message={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
          {statusMessage.type === 'error' && (
            <div className="flex justify-end">
              <button
                type="button"
                id="form-retry-generate-btn"
                onClick={handleGeneratePlan}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Retry Generate Plan
              </button>
            </div>
          )}
        </div>
      )}

      <form className="space-y-8">
        {/* Core Parameters Required by FastAPI */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Core Generation Parameters (FastAPI)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                These fields are sent directly in the payload: <code className="font-mono text-indigo-600 dark:text-indigo-400">&#123; goal, experience, workout_days &#125;</code>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Primary Fitness Goal <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Muscle Gain', 'Weight Loss', 'General Fitness'].map((goalOption) => (
                  <button
                    key={goalOption}
                    type="button"
                    onClick={() => setFitnessGoal(goalOption)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      fitnessGoal === goalOption
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">{goalOption}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {goalOption === 'Muscle Gain' ? 'Hypertrophy & strength' : goalOption === 'Weight Loss' ? 'Fat burn & conditioning' : 'Overall health & mobility'}
                      </span>
                    </div>
                    {fitnessGoal === goalOption && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Goal Input Option */}
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="goal-custom"
                    name="goal-selector"
                    checked={fitnessGoal === 'Custom'}
                    onChange={() => setFitnessGoal('Custom')}
                    className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="goal-custom" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Or specify a custom goal
                  </label>
                </div>
                {fitnessGoal === 'Custom' && (
                  <input
                    type="text"
                    id="custom-goal-input"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Marathon Training, Powerlifting, Calisthenics..."
                    className="mt-2 w-full px-3.5 py-2.5 text-sm rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
              {fieldErrors.fitnessGoal && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{fieldErrors.fitnessGoal}</p>
              )}
            </div>

            {/* 2. Experience Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Experience Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { level: 'Beginner', desc: '0 - 1 year of consistent training' },
                  { level: 'Intermediate', desc: '1 - 3 years with good form' },
                  { level: 'Advanced', desc: '3+ years of intense training' },
                ].map(({ level, desc }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperienceLevel(level as ExperienceLevel)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      experienceLevel === level
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">{level}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</span>
                    </div>
                    {experienceLevel === level && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {fieldErrors.experienceLevel && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{fieldErrors.experienceLevel}</p>
              )}
            </div>

            {/* 3. Workout Days (1 - 7) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  3. Workout Days Per Week (workout_days) <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {workoutDays} {Number(workoutDays) === 1 ? 'Day' : 'Days'} / Week
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    id={`workout-day-${num}`}
                    onClick={() => setWorkoutDays(num)}
                    className={`py-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                      Number(workoutDays) === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400/30'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {fieldErrors.workoutDays && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{fieldErrors.workoutDays}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Optional Profile Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Additional Physical & Diet Preferences
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optional contextual details stored with your profile
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                id="fitness-age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 26"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Height (cm)
              </label>
              <input
                id="fitness-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 178"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Weight (kg)
              </label>
              <input
                id="fitness-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 74"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Equipment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Equipment Access
              </label>
              <select
                id="fitness-equipment"
                value={availableEquipment}
                onChange={(e) => setAvailableEquipment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Full Gym Equipment">Full Commercial Gym Equipment</option>
                <option value="Dumbbells & Bench Only">Home Dumbbells & Bench Only</option>
                <option value="Bodyweight / Calisthenics">Bodyweight & Calisthenics Only</option>
                <option value="Resistance Bands & Kettlebells">Resistance Bands & Kettlebells</option>
              </select>
            </div>

            {/* Nutrition */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Dietary Preference
              </label>
              <select
                id="fitness-diet"
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="High Protein Non-Vegetarian">High Protein Non-Vegetarian</option>
                <option value="High Protein Vegetarian">High Protein Vegetarian</option>
                <option value="Plant-Based / Vegan">Plant-Based / Vegan</option>
                <option value="Keto / Low-Carb">Keto / Low-Carb</option>
                <option value="Pescatarian">Pescatarian</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            id="save-fitness-details-btn"
            onClick={handleSaveDetailsOnly}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences Only</span>
          </button>

          <button
            type="button"
            id="generate-plan-submit-btn"
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Plan (POST /generate-plan)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};
