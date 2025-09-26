# Online Poll System - Technical Documentation

This document provides detailed technical information about the poll system architecture, implementation decisions, and development practices.

## Architecture Overview

### System Design
The application follows a modern full-stack architecture with clear separation of concerns:

- **Frontend**: React SPA with Redux state management
- **Backend**: Django REST API with PostgreSQL database
- **Communication**: RESTful APIs with JSON data exchange
- **Real-time**: Polling-based updates (can be extended to WebSockets)

### Technology Choices

#### Frontend Stack Rationale
- **React + TypeScript**: Type safety and component reusability
- **Redux Toolkit**: Predictable state management with immutable updates
- **Recharts**: Lightweight, responsive chart library
- **Axios**: Promise-based HTTP client with interceptors

#### Backend Stack Rationale
- **Django REST Framework**: Rapid API development with built-in features
- **PostgreSQL**: ACID compliance and UUID support
- **django-cors-headers**: Secure cross-origin resource sharing
- **drf-yasg**: Automatic API documentation generation

## Database Design

### Key Design Decisions

1. **UUID Primary Keys**: Prevents ID enumeration attacks and supports distributed systems
2. **IP-based Vote Tracking**: Simple duplicate prevention without user accounts
3. **Soft Delete Pattern**: `is_active` field instead of hard deletes
4. **Denormalized Vote Counts**: Cached for performance (computed properties)

### Model Relationships
```
Poll (1) -> (Many) Option (1) -> (Many) Vote
Poll (1) -> (Many) Vote (direct relationship for queries)
```

### Constraints
- **Unique Constraint**: `(poll, voter_ip)` prevents duplicate voting
- **Cascade Deletes**: Maintains referential integrity
- **Index on created_at**: Optimizes chronological queries

## API Design

### RESTful Principles
- **Resource-based URLs**: `/polls/`, `/polls/{id}/`
- **HTTP Methods**: GET, POST following semantic meaning
- **Status Codes**: Proper 200, 201, 400, 404, 500 responses
- **Consistent JSON**: Standardized response format

### Pagination Strategy
```python
# Django REST Framework pagination
{
  "count": 25,
  "next": "http://localhost:8000/api/polls/?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Handling
- **Client Errors (4xx)**: Validation errors, duplicate votes
- **Server Errors (5xx)**: Database issues, unexpected failures
- **Consistent Format**: All errors return JSON with error messages

## Frontend Architecture

### Component Hierarchy
```
App
├── Header (navigation)
├── Routes
│   ├── HomePage (poll list + search/filter)
│   ├── CreatePollPage (form with validation)
│   ├── PollDetailPage (voting + results)
│   └── NotFoundPage (404 handling)
└── Footer
```

### State Management Strategy
- **Redux Slices**: Feature-based organization
- **Async Thunks**: API calls with loading states
- **Immutable Updates**: Redux Toolkit + Immer
- **Normalized State**: Flat structure for performance

### Component Design Patterns
- **Container/Presenter**: Logic separation
- **Custom Hooks**: Reusable stateful logic
- **Error Boundaries**: Graceful error handling
- **Memoization**: Performance optimization with useMemo

## Performance Optimizations

### Backend Optimizations
```python
# Efficient vote counting
@property
def total_votes(self):
    return Vote.objects.filter(option__poll=self).count()

# Select related for joins
Poll.objects.select_related('created_by').prefetch_related('options')
```

### Frontend Optimizations
```typescript
// Memoized selectors
const selectSortedPolls = createSelector(
  [selectPolls],
  polls => [...polls].sort((a, b) => b.created_at - a.created_at)
);

// Component memoization
const PollCard = React.memo(({ poll, onClick }) => { ... });
```

### Database Optimizations
- **Indexes**: `created_at`, `is_active`, composite indexes
- **Query Optimization**: Use `select_related` and `prefetch_related`
- **Connection Pooling**: Configured for concurrent requests

## Security Implementation

### Backend Security
```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# SQL Injection Prevention
# Django ORM automatically parameterizes queries

# XSS Prevention
# DRF automatically escapes output
```

### Frontend Security
```typescript
// Input Sanitization
const sanitizeInput = (input: string) => 
  input.trim().slice(0, MAX_LENGTH);

// XSS Prevention
// React automatically escapes JSX content
```

### Rate Limiting Strategy
- **IP-based**: Prevent spam voting
- **Time Windows**: Configurable limits per hour/day
- **Progressive Delays**: Exponential backoff for repeated attempts

## Testing Strategy

### Backend Testing
```python
# Model Tests
class PollModelTest(TestCase):
    def test_poll_creation(self):
        poll = Poll.objects.create(question="Test?")
        self.assertTrue(poll.is_active)

# API Tests
class PollAPITest(APITestCase):
    def test_create_poll(self):
        response = self.client.post('/api/polls/', data)
        self.assertEqual(response.status_code, 201)
```

### Frontend Testing
```typescript
// Component Tests
import { render, screen } from '@testing-library/react';

test('renders poll question', () => {
  render(<PollCard poll={mockPoll} onClick={jest.fn()} />);
  expect(screen.getByText('Test Question?')).toBeInTheDocument();
});

// Redux Tests
test('should handle poll creation', () => {
  const state = pollReducer(initialState, createPoll.fulfilled(mockPoll));
  expect(state.polls).toHaveLength(1);
});
```

## Error Handling Strategy

### Backend Error Handling
```python
# Custom Exception Handler
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        custom_response_data = {
            'error': response.data,
            'status_code': response.status_code
        }
        response.data = custom_response_data
    return response
```

### Frontend Error Handling
```typescript
// Redux Error Handling
.addCase(fetchPolls.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || 'Failed to fetch polls';
});

// Component Error Boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
}
```

## Deployment Considerations

### Environment Configuration
```python
# Production Settings
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
```

### Static File Handling
```python
# Django Settings
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Build Process
```bash
# Frontend Build
npm run build
# Creates optimized production build in build/

# Backend Collection
python manage.py collectstatic
# Collects static files for serving
```

## Monitoring and Logging

### Backend Logging
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'polls.log',
        },
    },
    'loggers': {
        'polls': {
            'handlers': ['file'],
            'level': 'DEBUG',
        },
    },
}
```

### Frontend Error Tracking
```typescript
// Error Reporting
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to monitoring service
});
```

## Future Enhancements

### Planned Features
1. **WebSocket Integration**: Real-time updates
2. **User Authentication**: Account-based voting
3. **Advanced Analytics**: Detailed voting patterns
4. **Mobile App**: React Native implementation
5. **Admin Dashboard**: Advanced poll management

### Scalability Considerations
1. **Database Sharding**: Partition by poll creation date
2. **Caching Layer**: Redis for frequently accessed polls
3. **CDN Integration**: Static asset optimization
4. **Load Balancing**: Multiple backend instances

## Development Workflow

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code style
- **Prettier**: Automatic formatting
- **Pre-commit Hooks**: Lint and test before commits

### Git Workflow
```bash
# Feature Development
git checkout -b feature/poll-expiration
git commit -m "feat: add poll expiration functionality"
git push origin feature/poll-expiration

# Code Review
# Create Pull Request
# Merge after approval
```

This technical documentation should be kept updated as the system evolves and new features are added.