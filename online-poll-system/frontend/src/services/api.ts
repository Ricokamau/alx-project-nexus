import axios, { AxiosResponse } from 'axios';
import { Poll, PollCreateData, VoteRequest, VoteResponse } from '../types';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
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
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Bad request');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const pollsApi = {
  // Get all polls
  getPolls: (): Promise<AxiosResponse<Poll[]>> => {
    return api.get('/polls/');
  },

  // Get single poll by ID
  getPoll: (id: string): Promise<AxiosResponse<Poll>> => {
    return api.get(`/polls/${id}/`);
  },

  // Create new poll
  createPoll: (data: PollCreateData): Promise<AxiosResponse<Poll>> => {
    return api.post('/polls/', data);
  },

  // Vote on a poll
  vote: (pollId: string, data: VoteRequest): Promise<AxiosResponse<VoteResponse>> => {
    return api.post(`/polls/${pollId}/vote/`, data);
  },

  // Get poll results
  getResults: (pollId: string): Promise<AxiosResponse<Poll>> => {
    return api.get(`/polls/${pollId}/results/`);
  },
};

// Export individual methods for convenience
export const {
  getPolls,
  getPoll,
  createPoll,
  vote,
  getResults,
} = pollsApi;

// Export default axios instance
export default api;