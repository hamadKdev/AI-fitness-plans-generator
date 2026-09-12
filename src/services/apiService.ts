import { getApiBaseUrl } from '../config/api';
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  DashboardResponse,
  GeneratePlanRequest,
  GeneratePlanResponse,
} from '../types';

/**
 * Standard fetch helper with error handling, non-200 JSON extraction, and network diagnostics.
 */
async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data: any = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || response.statusText };
      }
    }

    // Even if status code is non-200, return structured data if provided so the caller can inspect data.message
    if (!response.ok) {
      if (data && typeof data === 'object' && (data.message || data.detail)) {
        return {
          ...data,
          message: data.message || data.detail,
          _statusCode: response.status,
        } as T;
      }
      throw new Error(`API Error (${response.status}): ${response.statusText || 'Server responded with an error'}`);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out while connecting to ${getApiBaseUrl()}`);
    }
    if (
      error.message &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Load failed') ||
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('ERR_BLOCKED_BY_CLIENT'))
    ) {
      const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const isLocalHttp = getApiBaseUrl().startsWith('http://');

      if (isHttpsPage && isLocalHttp) {
        throw new Error(
          `Cannot reach ${getApiBaseUrl()} from this HTTPS cloud preview. Browsers block http://127.0.0.1 from https:// domains (Mixed Content / CORS). Use an HTTPS tunnel (e.g. 'ngrok http 8000' or 'npx localtunnel --port 8000') and paste the HTTPS URL in the FastAPI Settings, or ensure CORS is enabled.`
        );
      }

      throw new Error(
        `Cannot connect to FastAPI backend at ${getApiBaseUrl()}. Please make sure your FastAPI server is running with CORS enabled (e.g. 'uvicorn main:app --reload --port 8000').`
      );
    }
    throw error;
  }
}

export const apiService = {
  /**
   * 1. Signup
   * POST ${API_BASE_URL}/signup
   * Request body: { "name": "...", "email": "...", "password": "..." }
   */
  async signup(payload: SignupRequest): Promise<SignupResponse> {
    const baseUrl = getApiBaseUrl();
    return fetchJson<SignupResponse>(`${baseUrl}/signup`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 2. Login
   * POST ${API_BASE_URL}/login
   * Request body: { "email": "...", "password": "..." }
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const baseUrl = getApiBaseUrl();
    return fetchJson<LoginResponse>(`${baseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * 3. Dashboard
   * GET ${API_BASE_URL}/dashboard?email=...
   */
  async getDashboard(email: string): Promise<DashboardResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/dashboard?email=${encodeURIComponent(email.trim())}`;
    return fetchJson<DashboardResponse>(url, {
      method: 'GET',
    });
  },

  /**
   * 4. Generate Fitness Plan
   * POST ${API_BASE_URL}/generate-plan
   * Request body: { "goal": "...", "experience": "...", "workout_days": 5 }
   */
  async generatePlan(payload: GeneratePlanRequest): Promise<GeneratePlanResponse> {
    const baseUrl = getApiBaseUrl();
    return fetchJson<GeneratePlanResponse>(`${baseUrl}/generate-plan`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
