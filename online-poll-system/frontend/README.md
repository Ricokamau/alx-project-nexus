# React Frontend - Online Poll System

This is the React TypeScript frontend for the Online Poll System. It provides a modern, responsive user interface for creating polls, voting, and viewing real-time results.

## Quick Start

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env  # Edit with your API URL

# 4. Start development server
npm start

# App will open at http://localhost:3000
```

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Running Django backend (see backend/README.md)

## Installation

### 1. Node.js Dependencies

```bash
# Install core dependencies
npm install react react-dom react-router-dom
npm install @reduxjs/toolkit react-redux
npm install axios recharts date-fns uuid

# Install TypeScript dependencies
npm install --save-dev @types/react @types/react-dom @types/uuid
npm install --save-dev @types/node

# Install development tools
npm install --save-dev eslint prettier
```

### 2. Environment Setup

Create `.env` file in the `frontend/` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# Optional: Enable source maps in production
GENERATE_SOURCEMAP=false

# Optional: Disable ESLint during builds
ESLINT_NO_DEV_ERRORS=true
```

## Development

### Development Server

```bash
# Start development server
npm start

# Start with custom port
PORT=3001 npm start

# Start with HTTPS (development)
HTTPS=true npm start
```

### Build Process

```bash
# Production build
npm run build

# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build && npx webpack-bundle-analyzer build/static/js/*.js
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Run Prettier
npm run format

# Type checking
npm run type-check
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Footer.tsx      # Page footer  
│   │   ├── LoadingSpinner.tsx  # Loading states
│   │   └── ErrorMessage.tsx    # Error display
│   └── poll/           # Poll-specific components
│       ├── PollCard.tsx        # Poll preview card
│       ├── PollForm.tsx        # Poll creation form
│       ├── VoteForm.tsx        # Voting interface
│       └── PollResults.tsx     # Results with charts
├── pages/              # Route components
│   ├── HomePage.tsx        # Main poll list
│   ├── CreatePollPage.tsx  # Poll creation
│   ├── PollDetailPage.tsx  # Poll voting/results
│   └── NotFoundPage.tsx    # 404 handling
├── store/              # Redux state management
│   ├── index.ts           # Store configuration
│   ├── pollSlice.ts       # Poll state slice
│   └── types.ts           # Redux type definitions
├── services/           # API integration
│   └── api.ts             # HTTP client & endpoints
├── types/              # TypeScript definitions
│   └── index.ts           # Global type definitions
├── styles/             # Global styling
│   └── globals.css        # CSS custom properties
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
└── App.tsx             # Root component
```

## State Management

### Redux Store Structure

```typescript
// Global state shape
interface RootState {
  polls: {
    polls: Poll[];
    currentPoll: Poll | null;
    loading: boolean;
    error: string | null;
    voting: boolean;
    creating: boolean;
  }
}
```

### Redux Toolkit Slices

```typescript
// pollSlice.ts - Example async thunk
export const fetchPolls = createAsyncThunk(
  'polls/fetchPolls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/polls/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Usage in component
const dispatch = useAppDispatch();
const { polls, loading, error } = useAppSelector(state => state.polls);

useEffect(() => {
  dispatch(fetchPolls());
}, [dispatch]);
```

### Custom Hooks

```typescript
// hooks/usePolls.ts
export const usePolls = () => {
  const dispatch = useAppDispatch();
  const pollState = useAppSelector(state => state.polls);
  
  const fetchPolls = useCallback(() => {
    dispatch(fetchPollsThunk());
  }, [dispatch]);
  
  const createPoll = useCallback((pollData: PollCreateData) => {
    return dispatch(createPollThunk(pollData));
  }, [dispatch]);
  
  return {
    ...pollState,
    fetchPolls,
    createPoll,
  };
};
```

## Components

### Component Architecture

**Presentational Components**: Pure components that receive props
```typescript
interface PollCardProps {
  poll: Poll;
  onClick: () => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onClick }) => {
  return (
    <div className="poll-card" onClick={onClick}>
      <h3>{poll.question}</h3>
      <p>{poll.total_votes} votes</p>
    </div>
  );
};
```

**Container Components**: Connected to Redux state
```typescript
const HomePage: React.FC = () => {
  const { polls, loading, error } = usePolls();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {polls.map(poll => (
        <PollCard key={poll.id} poll={poll} onClick={() => navigate(`/poll/${poll.id}`)} />
      ))}
    </div>
  );
};
```

### Component Patterns

**Error Boundaries**
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage message="Something went wrong." />;
    }

    return this.props.children;
  }
}
```

**Memoization for Performance**
```typescript
// Memoize expensive components
const PollCard = React.memo<PollCardProps>(({ poll, onClick }) => {
  return (
    <div className="poll-card" onClick={onClick}>
      {/* Component content */}
    </div>
  );
});

// Memoize expensive calculations
const sortedPolls = useMemo(() => {
  return polls.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}, [polls]);
```

## Styling

### CSS Architecture

**CSS Custom Properties (Variables)**
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
```

**Component Styling Strategy**
```css
/* Component-specific styles */
.poll-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: var(--spacing-lg);
  transition: transform 0.2s ease;
}

.poll-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Responsive design */
@media (max-width: 768px) {
  .poll-card {
    padding: var(--spacing-md);
  }
}
```

### Responsive Design

**Breakpoint Strategy**
```css
/* Mobile First Approach */
.component {
  /* Mobile styles (320px+) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}

@media (min-width: 1200px) {
  .component {
    /* Large desktop styles */
  }
}
```

**Grid Systems**
```css
.polls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .polls-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

## API Integration

### HTTP Client Configuration

```typescript
// services/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    }
    throw new Error(error.response?.data?.error || 'Network error');
  }
);
```

### API Service Layer

```typescript
// Centralized API calls
export const pollsApi = {
  getPolls: (): Promise<AxiosResponse<Poll[]>> => 
    api.get('/polls/'),
    
  getPoll: (id: string): Promise<AxiosResponse<Poll>> => 
    api.get(`/polls/${id}/`),
    
  createPoll: (data: PollCreateData): Promise<AxiosResponse<Poll>> => 
    api.post('/polls/', data),
    
  vote: (pollId: string, optionId: string): Promise<AxiosResponse<VoteResponse>> => 
    api.post(`/polls/${pollId}/vote/`, { option_id: optionId }),
};
```

### Error Handling Strategy

```typescript
// Centralized error handling
const handleApiError = (error: any): string => {
  if (error.response?.status === 400) {
    return error.response.data?.error || 'Invalid request';
  }
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return 'Network error. Please check your connection.';
};

// Usage in Redux thunks
export const fetchPolls = createAsyncThunk(
  'polls/fetchPolls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pollsApi.getPolls();
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading pages
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const CreatePollPage = lazy(() => import('./pages/CreatePollPage'));
const PollDetailPage = lazy(() => import('./pages/PollDetailPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/poll/:id" element={<PollDetailPage />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization Strategies

```typescript
// Expensive calculations
const sortedAndFilteredPolls = useMemo(() => {
  return polls
    .filter(poll => poll.question.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}, [polls, searchTerm]);

// Callback memoization
const handlePollClick = useCallback((pollId: string) => {
  navigate(`/poll/${pollId}`);
}, [navigate]);

// Component memoization
const PollCard = React.memo<PollCardProps>(({ poll, onClick }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.poll.id === nextProps.poll.id &&
         prevProps.poll.total_votes === nextProps.poll.total_votes;
});
```

### Bundle Optimization

```typescript
// Tree shaking - import only what you need
import { formatDistanceToNow } from 'date-fns';
// Instead of: import * as dateFns from 'date-fns';

// Dynamic imports for large libraries
const loadChartLibrary = async () => {
  const { LineChart } = await import('recharts');
  return LineChart;
};
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev jest-environment-jsdom
```

### Component Testing

```typescript
// __tests__/components/PollCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import PollCard from '../components/poll/PollCard';
import pollReducer from '../store/pollSlice';

const mockPoll = {
  id: '123',
  question: 'Test Question?',
  description: 'Test Description',
  total_votes: 5,
  created_at: '2024-01-01T00:00:00Z',
  expires_at: null,
  is_active: true,
  options: [
    { id: '1', text: 'Option 1', vote_count: 3 },
    { id: '2', text: 'Option 2', vote_count: 2 },
  ],
};

const renderWithProviders = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: { polls: pollReducer },
    preloadedState: { polls: { polls: [], currentPoll: null, loading: false, error: null, voting: false, creating: false } },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

describe('PollCard', () => {
  test('renders poll question and vote count', () => {
    const mockOnClick = jest.fn();
    
    renderWithProviders(
      <PollCard poll={mockPoll} onClick={mockOnClick} />
    );
    
    expect(screen.getByText('Test Question?')).toBeInTheDocument();
    expect(screen.getByText('5 votes')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    
    renderWithProviders(
      <PollCard poll={mockPoll} onClick={mockOnClick} />
    );
    
    fireEvent.click(screen.getByText('Test Question?'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

### Redux Testing

```typescript
// __tests__/store/pollSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import pollReducer, { fetchPolls, createPoll } from '../store/pollSlice';

describe('pollSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { polls: pollReducer },
    });
  });

  test('should handle fetchPolls.pending', () => {
    const action = { type: fetchPolls.pending.type };
    const state = pollReducer(undefined, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  test('should handle fetchPolls.fulfilled', () => {
    const mockPolls = [mockPoll];
    const action = { type: fetchPolls.fulfilled.type, payload: mockPolls };
    const state = pollReducer(undefined, action);
    
    expect(state.loading).toBe(false);
    expect(state.polls).toEqual(mockPolls);
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/PollFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock API server
const server = setupServer(
  rest.get('/api/polls/', (req, res, ctx) => {
    return res(ctx.json({ results: [mockPoll] }));
  }),
  
  rest.post('/api/polls/:id/vote/', (req, res, ctx) => {
    return res(ctx.json({ 
      message: 'Vote recorded',
      poll: { ...mockPoll, total_votes: 6 }
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('complete poll voting flow', async () => {
  render(<App />);
  
  // Wait for polls to load
  await waitFor(() => {
    expect(screen.getByText('Test Question?')).toBeInTheDocument();
  });
  
  // Click on poll
  fireEvent.click(screen.getByText('Test Question?'));
  
  // Vote on option
  await waitFor(() => {
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });
  
  fireEvent.click(screen.getByText('Option 1'));
  fireEvent.click(screen.getByText('Submit Vote'));
  
  // Verify vote was recorded
  await waitFor(() => {
    expect(screen.getByText('6 votes')).toBeInTheDocument();
  });
});
```

## Accessibility

### Semantic HTML

```tsx
// Use proper semantic elements
<main role="main">
  <section aria-labelledby="polls-heading">
    <h2 id="polls-heading">Available Polls</h2>
    <ul role="list">
      {polls.map(poll => (
        <li key={poll.id} role="listitem">
          <article>
            <h3>{poll.question}</h3>
            <p>{poll.description}</p>
          </article>
        </li>
      ))}
    </ul>
  </section>
</main>
```

### ARIA Labels

```tsx
// Proper ARIA labeling
<button
  aria-label={`Vote on poll: ${poll.question}`}
  aria-describedby={`poll-description-${poll.id}`}
  onClick={() => handleVote(poll.id)}
>
  Vote Now
</button>

<div id={`poll-description-${poll.id}`} className="sr-only">
  This poll has {poll.total_votes} votes and {poll.options.length} options
</div>
```

### Keyboard Navigation

```tsx
// Handle keyboard events
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleClick}
  className="poll-card"
>
  {/* Content */}
</div>
```

### Screen Reader Support

```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Deployment

### Build Configuration

```bash
# Production build
npm run build

# Build with source maps (for debugging)
GENERATE_SOURCEMAP=true npm run build

# Build with custom public URL
PUBLIC_URL=/polls npm run build
```

### Environment Configuration

```typescript
// Different configs for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:8000/api',
    logLevel: 'debug',
  },
  production: {
    apiUrl: 'https://api.yourapp.com',
    logLevel: 'error',
  },
  staging: {
    apiUrl: 'https://staging-api.yourapp.com',
    logLevel: 'warn',
  },
};

export default config[process.env.NODE_ENV as keyof typeof config];
```

### Static File Optimization

```typescript
// Service worker for caching
// public/sw.js
const CACHE_NAME = 'poll-system-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## Browser Compatibility

### Polyfills

```typescript
// src/polyfills.ts
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Add polyfills for older browsers
if (!window.Promise) {
  window.Promise = require('es6-promise').Promise;
}
```

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

## Troubleshooting

### Common Issues

**1. CORS Errors**
```typescript
// Ensure backend CORS is configured
// Check network tab for preflight requests
// Verify API_URL in .env file
```

**2. Bundle Size Issues**
```bash
# Analyze bundle
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Check for duplicate dependencies
npm ls --depth=0
```

**3. Performance Issues**
```typescript
// Use React DevTools Profiler
// Check for unnecessary re-renders
// Implement proper memoization
// Use lazy loading for heavy components
```

**4. Memory Leaks**
```typescript
// Clean up subscriptions in useEffect
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  
  return () => clearInterval(interval); // Cleanup
}, []);

// Cancel API requests on unmount
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(handleResponse);
    
  return () => controller.abort();
}, []);
```

## Development Best Practices

### Code Organization
- Keep components small and focused
- Use TypeScript strictly
- Follow consistent naming conventions
- Implement proper error boundaries
- Write comprehensive tests

### Performance
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Optimize image loading with lazy loading
- Use service workers for caching

### Security
- Sanitize user input
- Validate data from API
- Use HTTPS in production
- Implement Content Security Policy

This frontend is built for scalability, maintainability, and excellent user experience. Follow these practices for optimal development workflow.