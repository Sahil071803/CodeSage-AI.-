import axios from 'axios';
import { buildMockAnalysis, createSeedHistory, mockKnowledgeDocs } from '../data/mockAnalysis.js';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

/**
 * In dev, requests are relative (same-origin) and Vite's proxy forwards
 * /api/* to the backend (target = VITE_API_BASE_URL in .env) — this avoids
 * CORS and port/origin mismatches entirely. In a production build the
 * configured absolute API base URL is used.
 */
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090');

/** Demo Mode is on unless VITE_USE_MOCK is explicitly set to "false". */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const TOKEN_KEY = 'codesage_token';
const HISTORY_KEY = 'codesage_history';
const UPLOADS_KEY = 'codesage_uploaded_docs';

/** Backend API routes (same-origin in dev via the Vite proxy). */
export const ENDPOINTS = {
  login: '/api/auth/login',
  signup: '/api/auth/signup',
  analyze: '/api/analyze',
  knowledgeBase: '/api/knowledge-base',
  uploadDocument: '/api/knowledge-base/upload',
};

const client = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function endpoint(name) {
  const path = ENDPOINTS[name];
  if (!path) {
    throw new Error(
      `The backend endpoint "${name}" is not configured yet. Set it in src/services/api.js, or use Demo Mode (VITE_USE_MOCK=true).`
    );
  }
  return path;
}

function toMessage(error) {
  const serverMessage = error.response?.data?.message;
  if (serverMessage) return serverMessage;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Try again.';
  if (error.request && !error.response) {
    return 'Cannot reach the server. Check that the backend is running and that VITE_API_BASE_URL is correct.';
  }
  return error.message || 'Something went wrong. Try again.';
}

async function request(method, name, payload, config) {
  try {
    const { data } = await client.request({ method, url: endpoint(name), data: payload, ...config });
    return data;
  } catch (error) {
    throw new Error(toMessage(error));
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable: ignore in demo */
  }
}

function nameFromEmail(email) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Developer';
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* Expected live response: { user: { name, email }, token }            */
/* ------------------------------------------------------------------ */

export async function loginUser({ email, password }) {
  if (USE_MOCK) {
    await wait(700);
    if (!EMAIL_PATTERN.test(email) || password.length < 8) {
      throw new Error('Enter a valid email and a password with at least 8 characters.');
    }
    // Demo only: no account is checked and no token is issued.
    return { user: { name: nameFromEmail(email), email }, token: null };
  }
  return request('post', 'login', { email, password });
}

export async function signupUser({ name, email, password }) {
  if (USE_MOCK) {
    await wait(900);
    return { user: { name: name.trim(), email }, token: null };
  }
  return request('post', 'signup', { name, email, password });
}

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* Request:  { mode: 'explain' | 'debug', code, language, problem }    */
/* Response: same shape as buildMockAnalysis() in data/mockAnalysis.js */
/* ------------------------------------------------------------------ */

export async function analyzeCode({ mode, code, language, problem }) {
  if (USE_MOCK) {
    await wait(1400);
    return buildMockAnalysis({ mode, code, language });
  }
  return request('post', 'analyze', { mode, code, language, problem });
}

/* ------------------------------------------------------------------ */
/* Knowledge base                                                      */
/* ------------------------------------------------------------------ */

export async function getKnowledgeDocs() {
  if (USE_MOCK) {
    await wait(400);
    return [...readJson(UPLOADS_KEY, []), ...mockKnowledgeDocs];
  }
  return request('get', 'knowledgeBase');
}

export async function uploadDocument(file) {
  if (USE_MOCK) {
    await wait(900);
    const doc = {
      id: `upload-${Date.now()}`,
      title: file.name,
      type: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TXT',
      language: 'Not specified',
      length: 'Not processed',
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      description: 'Stored in this browser only. It is not read, chunked, or indexed in Demo Mode.',
      status: 'uploaded-local',
    };
    writeJson(UPLOADS_KEY, [doc, ...readJson(UPLOADS_KEY, [])]);
    return doc;
  }
  const form = new FormData();
  form.append('file', file);
  return request('post', 'uploadDocument', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

/* ------------------------------------------------------------------ */
/* History                                                             */
/* Demo Mode keeps history in localStorage. With a live backend, the   */
/* server should record each analysis and expose a history endpoint.   */
/* ------------------------------------------------------------------ */

export async function getHistory() {
  const stored = readJson(HISTORY_KEY, null);
  if (stored) return stored;
  const seeded = createSeedHistory();
  writeJson(HISTORY_KEY, seeded);
  return seeded;
}

export async function saveHistoryEntry(entry) {
  if (!USE_MOCK) return;
  const current = await getHistory();
  writeJson(HISTORY_KEY, [entry, ...current].slice(0, 30));
}

export async function clearHistory() {
  writeJson(HISTORY_KEY, []);
}
