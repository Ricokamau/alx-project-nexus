import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Poll, PollState, PollCreateData, AsyncThunkConfig } from '../types';
import { pollsApi } from '../services/api';

// Initial state
const initialState: PollState = {
  polls: [],
  currentPoll: null,
  loading: false,
  error: null,
  voting: false,
  creating: false,
};

// Async thunks for API calls
export const fetchPolls = createAsyncThunk<Poll[], void, AsyncThunkConfig>(
  'polls/fetchPolls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pollsApi.getPolls();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch polls');
    }
  }
);

export const fetchPollById = createAsyncThunk<Poll, string, AsyncThunkConfig>(
  'polls/fetchPollById',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollsApi.getPoll(pollId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch poll');
    }
  }
);

export const createPoll = createAsyncThunk<Poll, PollCreateData, AsyncThunkConfig>(
  'polls/createPoll',
  async (pollData, { rejectWithValue }) => {
    try {
      const response = await pollsApi.createPoll(pollData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create poll');
    }
  }
);

export const votePoll = createAsyncThunk<
  Poll,
  { pollId: string; optionId: string },
  AsyncThunkConfig
>(
  'polls/votePoll',
  async ({ pollId, optionId }, { rejectWithValue }) => {
    try {
      const response = await pollsApi.vote(pollId, { option_id: optionId });
      return response.data.poll;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to vote');
    }
  }
);

export const refreshPollResults = createAsyncThunk<Poll, string, AsyncThunkConfig>(
  'polls/refreshPollResults',
  async (pollId, { rejectWithValue }) => {
    try {
      const response = await pollsApi.getResults(pollId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh results');
    }
  }
);

// Create slice
const pollSlice = createSlice({
  name: 'polls',
  initialState,
  reducers: {
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear current poll
    clearCurrentPoll: (state) => {
      state.currentPoll = null;
    },
    
    // Set current poll
    setCurrentPoll: (state, action: PayloadAction<Poll>) => {
      state.currentPoll = action.payload;
    },
    
    // Update poll in the list
    updatePollInList: (state, action: PayloadAction<Poll>) => {
      if (Array.isArray(state.polls)) {
        const index = state.polls.findIndex(poll => poll.id === action.payload.id);
        if (index !== -1) {
          state.polls[index] = action.payload;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch polls
    builder
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle both paginated and direct array responses
        let polls: any = action.payload;
        if (polls && typeof polls === 'object' && 'results' in polls && Array.isArray(polls.results)) {
          // Paginated response from Django REST framework
          polls = polls.results;
        }
        
        state.polls = Array.isArray(polls) ? polls : [];
        state.error = null;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch polls';
      })

    // Fetch poll by ID
      .addCase(fetchPollById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPollById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload;
        state.error = null;
      })
      .addCase(fetchPollById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch poll';
      })

    // Create poll
      .addCase(createPoll.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.creating = false;
        // Ensure polls is an array before using unshift
        if (!Array.isArray(state.polls)) {
          state.polls = [];
        }
        state.polls.unshift(action.payload); // Add to beginning of list
        state.error = null;
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to create poll';
      })

    // Vote on poll
      .addCase(votePoll.pending, (state) => {
        state.voting = true;
        state.error = null;
      })
      .addCase(votePoll.fulfilled, (state, action) => {
        state.voting = false;
        state.currentPoll = action.payload;
        
        // Update poll in the polls list
        const index = state.polls.findIndex(poll => poll.id === action.payload.id);
        if (index !== -1 && Array.isArray(state.polls)) {
          state.polls[index] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(votePoll.rejected, (state, action) => {
        state.voting = false;
        state.error = action.payload || 'Failed to vote';
      })

    // Refresh poll results
      .addCase(refreshPollResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshPollResults.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload;
        
        // Update poll in the polls list
        const index = state.polls.findIndex(poll => poll.id === action.payload.id);
        if (index !== -1 && Array.isArray(state.polls)) {
          state.polls[index] = action.payload;
        }
      })
      .addCase(refreshPollResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to refresh results';
      });
  },
});

// Export actions
export const { 
  clearError, 
  clearCurrentPoll, 
  setCurrentPoll, 
  updatePollInList 
} = pollSlice.actions;

// Export reducer
export default pollSlice.reducer;