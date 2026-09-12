import React, { useState } from 'react';
import { Settings2, X, Check, RotateCcw, Send, Server, AlertCircle, Terminal, Copy, ExternalLink, HelpCircle, ShieldAlert } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, DEFAULT_API_BASE_URL } from '../config/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const [baseUrl, setBaseUrl] = useState<string>(getApiBaseUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; message: string; details?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'guide' | 'code'>('settings');

  if (!isOpen) return null;

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalHttp = baseUrl.startsWith('http://127.0.0.1') || baseUrl.startsWith('http://localhost');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = setApiBaseUrl(baseUrl);
    setBaseUrl(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    const defaults = resetApiBaseUrl();
    setBaseUrl(defaults);
    setSavedSuccess(true);
    setTestResult(null);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testUrl = `${baseUrl.trim().replace(/\/+$/, '')}/dashboard?email=test@example.com`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(testUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => null);

      if (res.ok || data?.message) {
        setTestResult({
          status: 'success',
          message: `Connected successfully! Response: "${data?.message || res.statusText}"`,
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Server returned HTTP ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      if (isHttps && isLocalHttp) {
        setTestResult({
          status: 'error',
          message: `Browser Mixed Content Block: Cannot connect to http://127.0.0.1 from an HTTPS preview.`,
          details: `Modern browsers block unencrypted HTTP local connections from HTTPS web apps. Solution: Run 'ngrok http 8000' or 'npx localtunnel --port 8000' and paste the https:// URL here, or run this app locally.`
        });
      } else {
        setTestResult({
          status: 'error',
          message: err.name === 'AbortError' 
            ? 'Connection timed out' 
            : `Connection failed. Make sure your FastAPI server is running on ${baseUrl} with CORSMiddleware enabled.`,
          details: `Verify command: 'uvicorn main:app --reload --port 8000'`
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const sampleFastApiCode = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# ⚠️ Enable CORS so browser requests are allowed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_users = {}

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PlanRequest(BaseModel):
    goal: str
    experience: str
    workout_days: int

@app.post("/signup")
def signup(data: SignupRequest):
    db_users[data.email] = {"name": data.name, "email": data.email, "password": data.password}
    return {"message": "Signup successful", "user": {"name": data.name, "email": data.email}}

@app.post("/login")
def login(data: LoginRequest):
    user = db_users.get(data.email)
    if user and user["password"] == data.password:
        return {"message": "Login successful", "user": {"name": user["name"], "email": user["email"]}}
    return {"message": "Invalid email or password"}

@app.get("/dashboard")
def dashboard(email: str):
    user = db_users.get(email)
    if not user:
        return {"message": "User not found"}
    return {"message": "Welcome to dashboard", "user": {"name": user["name"], "email": user["email"]}}

@app.post("/generate-plan")
def generate_plan(data: PlanRequest):
    return {
        "message": "Fitness plan generated successfully",
        "plan": {
            "goal": data.goal,
            "experience": data.experience,
            "workout_days": data.workout_days,
            "workoutPlan": [
                {
                    "day": "Day 1",
                    "focus": "Upper Body Strength",
                    "exercises": [
                        {"name": "Bench Press", "sets": 4, "reps": "8-10"},
                        {"name": "Bent-Over Row", "sets": 4, "reps": "10-12"},
                        {"name": "Overhead Press", "sets": 3, "reps": "10-12"}
                    ]
                },
                {
                    "day": "Day 2",
                    "focus": "Lower Body Power",
                    "exercises": [
                        {"name": "Barbell Squats", "sets": 4, "reps": "8-10"},
                        {"name": "Romanian Deadlifts", "sets": 3, "reps": "10-12"},
                        {"name": "Calf Raises", "sets": 4, "reps": "15"}
                    ]
                }
            ],
            "mealSuggestions": [
                {"mealType": "Breakfast", "description": "Oatmeal with whey protein, chia seeds & banana"},
                {"mealType": "Lunch", "description": "Grilled chicken breast with brown rice and greens"},
                {"mealType": "Dinner", "description": "Salmon fillet with roasted sweet potatoes & asparagus"}
            ]
        }
    }`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleFastApiCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      id="api-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                FastAPI Backend Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your FastAPI server endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-api-modal-btn"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-4 font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Server URL
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-4 font-semibold transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Troubleshooting & Tunneling
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-4 font-semibold transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            FastAPI Code (main.py)
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            API Base URL updated successfully.
          </div>
        )}

        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs border flex items-start gap-2.5 ${
            testResult.status === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}>
            {testResult.status === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div>
                <span className="font-bold uppercase tracking-wider">FastAPI Status: </span>
                <span>{testResult.message}</span>
              </div>
              {testResult.details && (
                <p className="text-[11px] opacity-90 leading-relaxed font-mono">
                  {testResult.details}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave} className="space-y-4">
            {isHttps && isLocalHttp && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Notice for HTTPS Previews:</span>
                  <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Browsers block direct <code className="font-mono bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded">http://127.0.0.1</code> calls from cloud <code className="font-mono bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded">https://</code> previews. Use <code className="font-mono font-bold">ngrok http 8000</code> or deploy FastAPI and paste the secure HTTPS URL below.
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  FastAPI Base URL (API_BASE_URL)
                </label>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  {isTesting ? 'Testing connection...' : 'Test Connection'}
                </button>
              </div>
              <input
                type="text"
                id="api-base-url-input"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000 or https://xyz.ngrok-free.app"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Default: <code className="font-mono text-indigo-600 dark:text-indigo-400">{DEFAULT_API_BASE_URL}</code>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Connected API Endpoints:</span>
              <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                <div><strong className="text-emerald-600 dark:text-emerald-400">POST</strong> {baseUrl}/signup</div>
                <div><strong className="text-emerald-600 dark:text-emerald-400">POST</strong> {baseUrl}/login</div>
                <div><strong className="text-indigo-600 dark:text-indigo-400">GET</strong> {baseUrl}/dashboard?email=...</div>
                <div><strong className="text-emerald-600 dark:text-emerald-400">POST</strong> {baseUrl}/generate-plan</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReset}
                id="reset-api-url-btn"
                className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  id="save-api-url-btn"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Save URL
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Troubleshooting & Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                How to Connect Local FastAPI to Cloud Preview:
              </h3>
              
              <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed">
                <li>
                  <strong>Start your FastAPI app locally:</strong>
                  <div className="my-1 p-2 bg-slate-900 text-emerald-400 font-mono rounded-lg">
                    uvicorn main:app --reload --port 8000
                  </div>
                </li>
                <li>
                  <strong>Expose your local port via HTTPS tunnel:</strong>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Run either of these commands in your terminal:</p>
                  <div className="my-1 p-2 bg-slate-900 text-emerald-400 font-mono rounded-lg">
                    npx localtunnel --port 8000
                  </div>
                  <span className="text-[10px] text-slate-400">or with ngrok:</span>
                  <div className="my-1 p-2 bg-slate-900 text-emerald-400 font-mono rounded-lg">
                    ngrok http 8000
                  </div>
                </li>
                <li>
                  <strong>Copy the generated HTTPS URL:</strong>
                  <p className="mt-0.5">Example: <code className="font-mono text-indigo-600">https://calm-puma-12.loca.lt</code> or <code className="font-mono text-indigo-600">https://xyz.ngrok-free.app</code></p>
                </li>
                <li>
                  <strong>Paste it in the "Server URL" tab</strong> and click <strong>"Save URL"</strong>!
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: FastAPI Python Code */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Complete FastAPI backend (<code>main.py</code>) with CORS:
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 text-slate-100 rounded-2xl text-[11px] font-mono max-h-64 overflow-y-auto leading-relaxed">
              {sampleFastApiCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

