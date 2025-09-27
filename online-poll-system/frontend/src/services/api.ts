import axios, { AxiosResponse } from 'axios';

// ✅ Use Render backend by default, fallback to localhost for dev
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://pollsystem-backend.onrender.com/api/';

// Create axios instance with increased timeout for Render cold starts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10000ms to 30000ms (30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.message);
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    throw new Error(error.response?.data?.error || error.message || 'Network error');
  }
);

// ====== WAKE-UP FUNCTION ======
/**
 * Wake up the backend server (useful for Render free tier cold starts)
 * This function makes a simple GET request to wake up sleeping servers
 */
export const wakeUpBackend = async (): Promise<void> => {
  try {
    console.log('🚀 Waking up backend server...');
    await fetch(`${API_BASE_URL}polls/`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Backend server is awake');
  } catch (error) {
    console.log('⏳ Backend waking up... (this may take 20-30 seconds)');
  }
};

// ====== POLL API FUNCTIONS ======

export interface Option {
  id: string;
  text: string;
  vote_count: number;
}

export interface Poll {
  id: string;
  question: string;
  description: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  options: Option[];
  total_votes: number;
}

export interface PollCreateData {
  question: string;
  description: string;
  expires_at?: string;
  options: string[];
}

export interface VoteResponse {
  success: boolean;
  message: string;
  updated_poll: Poll;
}

// API Functions
export const getPolls = (): Promise<AxiosResponse<Poll[]>> => {
  return api.get('/polls/');
};

export const getPollById = (id: string): Promise<AxiosResponse<Poll>> => {
  return api.get(`/polls/${id}/`);
};

export const createPoll = (data: PollCreateData): Promise<AxiosResponse<Poll>> => {
  return api.post('/polls/', data);
};

export const vote = (
  pollId: string,
  optionId: string
): Promise<AxiosResponse<VoteResponse>> => {
  return api.post(`/polls/${pollId}/vote/`, { option_id: optionId });
};

// Helper function to check if backend is responding
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}polls/`, {
      method: 'GET',
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default api;
