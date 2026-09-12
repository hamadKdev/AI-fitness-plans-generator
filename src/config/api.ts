export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

const STORAGE_KEY = 'ai_fitness_api_base_url';

export function getApiBaseUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    console.error('Failed to read API Base URL from storage', e);
  }
  return DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string): string {
  const cleanUrl = (url || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '');
  try {
    localStorage.setItem(STORAGE_KEY, cleanUrl);
  } catch (e) {
    console.error('Failed to save API Base URL to storage', e);
  }
  return cleanUrl;
}

export function resetApiBaseUrl(): string {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset API Base URL', e);
  }
  return DEFAULT_API_BASE_URL;
}
