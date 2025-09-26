// API Response Types
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

export interface VoteRequest {
  option_id: string;
}

export interface VoteResponse {
  message: string;
  poll: Poll;
}

// Redux State Types
export interface PollState {
  polls: Poll[];
  currentPoll: Poll | null;
  loading: boolean;
  error: string | null;
  voting: boolean;
  creating: boolean;
}

export interface RootState {
  polls: PollState;
}

// Component Props Types
export interface PollCardProps {
  poll: Poll;
  onClick: () => void;
}

export interface VoteFormProps {
  poll: Poll;
  onVote: (optionId: string) => void;
  loading: boolean;
}

export interface PollResultsProps {
  poll: Poll;
}

export interface PollFormProps {
  onSubmit: (data: PollCreateData) => void;
  loading: boolean;
}

// Chart Data Types
export interface ChartData {
  name: string;
  votes: number;
  percentage: number;
  fill?: string;
}

// API Error Types
export interface ApiError {
  error: string;
  details?: string;
}

// Form Types
export interface CreatePollForm {
  question: string;
  description: string;
  expires_at: string;
  options: string[];
}

// Utility Types
export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface AsyncThunkConfig {
  rejectValue: string;
}