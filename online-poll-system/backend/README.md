# Django Backend - Online Poll System

This is the Django REST Framework backend for the Online Poll System. It provides a robust API for creating polls, voting, and displaying real-time results.

[Poll System API](https://pollsystem-backend.onrender.com).

## Quick Start

```bash
# 1. Activate virtual environment
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env  # Edit with your settings

# 4. Set up database
cd pollsystem
python manage.py migrate

# 5. Create admin user
python manage.py createsuperuser

# 6. Run development server
python manage.py runserver
```

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher (or SQLite for development)
- pip (Python package manager)

## Installation

### 1. Virtual Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Verify activation
which python  # Should point to venv/Scripts/python
```

### 2. Dependencies Installation

```bash
# Install all required packages
pip install django==4.2
pip install djangorestframework
pip install python-decouple
pip install psycopg2-binary
pip install django-cors-headers
pip install drf-yasg

# Or install from requirements.txt
pip install -r requirements.txt

# Save current dependencies
pip freeze > requirements.txt
```

### 3. Environment Configuration

Create `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_NAME=pollsystem
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-very-long-secret-key-minimum-50-characters-recommended
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS=True

# Optional: Use SQLite for development
USE_SQLITE=False

# Poll System Configuration
MAX_OPTIONS_PER_POLL=10
MAX_POLL_DURATION_DAYS=30
ALLOW_ANONYMOUS_VOTING=True
RATE_LIMIT_VOTES_PER_IP=100

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

### 4. Database Setup

#### Option A: PostgreSQL (Recommended)

```bash
# Install PostgreSQL first, then:
createdb pollsystem

# Or using psql:
psql -U postgres
CREATE DATABASE pollsystem;
\q
```

#### Option B: SQLite (Development)

Set in `.env`:
```env
USE_SQLITE=True
```

### 5. Django Setup

```bash
cd pollsystem

# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Collect static files (production)
python manage.py collectstatic
```

## Development

### Running the Server

```bash
# Development server
python manage.py runserver

# Custom port
python manage.py runserver 8080

# All interfaces
python manage.py runserver 0.0.0.0:8000
```

### Django Admin

Access at `http://localhost:8000/admin/`

**Features:**
- Poll management
- Option editing
- Vote monitoring
- User administration

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/polls/` | List all polls (paginated) |
| POST | `/api/polls/` | Create new poll |
| GET | `/api/polls/{id}/` | Get poll details |
| POST | `/api/polls/{id}/vote/` | Vote on poll |
| GET | `/api/polls/{id}/results/` | Get poll results |

### API Documentation

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

## Testing

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test polls

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Creates htmlcov/ directory
```

### Test Structure

```python
# polls/tests.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from .models import Poll, Option, Vote

class PollModelTests(TestCase):
    def setUp(self):
        self.poll = Poll.objects.create(
            question="Test Question?",
            description="Test Description"
        )
    
    def test_poll_creation(self):
        self.assertTrue(self.poll.is_active)
        self.assertEqual(str(self.poll), "Test Question?")

class PollAPITests(APITestCase):
    def test_create_poll(self):
        url = reverse('poll-list-create')
        data = {
            'question': 'Test Poll?',
            'description': 'Test Description',
            'options': ['Option 1', 'Option 2']
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
```

## Database Management

### Migrations

```bash
# Create migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Reverse migration
python manage.py migrate polls 0001
```

### Database Commands

```bash
# Database shell
python manage.py dbshell

# Django shell
python manage.py shell

# Reset database (development only)
python manage.py flush
```

### Backup and Restore

```bash
# Backup
python manage.py dumpdata > backup.json

# Restore
python manage.py loaddata backup.json

# Backup specific app
python manage.py dumpdata polls > polls_backup.json
```

## Configuration

### Settings Structure

```python
# pollsystem/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',        # DRF
    'corsheaders',          # CORS
    'drf_yasg',            # Swagger
    'polls',               # Our app
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

### CORS Configuration

```python
# Allow frontend connections
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "https://your-frontend-domain.com",  # Production
]

# Development only
CORS_ALLOW_ALL_ORIGINS = True  # Don't use in production
```

## Performance

### Database Optimization

```python
# Use select_related for foreign keys
polls = Poll.objects.select_related('created_by')

# Use prefetch_related for reverse foreign keys
polls = Poll.objects.prefetch_related('options', 'votes')

# Optimize vote counting
class Poll(models.Model):
    @property
    def total_votes(self):
        return self.votes.count()  # Uses direct relationship
```

### Caching

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# views.py
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def poll_results(request, poll_id):
    # ...
```

## Security

### Security Settings

```python
# Production security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Rate Limiting

```python
# Install django-ratelimit
pip install django-ratelimit

# views.py
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
def vote_view(request, poll_id):
    # Limit voting to 5 per minute per IP
    pass
```

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set secure `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up static file serving
- [ ] Configure HTTPS
- [ ] Set up monitoring
- [ ] Configure backup strategy

### Environment Variables

```bash
# Production .env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgres://user:password@localhost/pollsystem
CORS_ALLOW_ALL_ORIGINS=False
```

### Static Files

```python
# settings.py for production
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Collect static files
python manage.py collectstatic --noinput
```

## Monitoring

### Logging Configuration

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'polls.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'polls': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

### Health Checks

```python
# polls/views.py
@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'version': '1.0.0'
    })
```

## Troubleshooting

### Common Issues

**1. Migration Errors**
```bash
# Reset migrations (development only)
rm polls/migrations/0001_initial.py
python manage.py makemigrations polls
python manage.py migrate
```

**2. Database Connection Issues**
```bash
# Check PostgreSQL is running
systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Test connection
psql -U postgres -d pollsystem
```

**3. CORS Issues**
```python
# Ensure CORS is properly configured
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

**4. Import Errors**
```bash
# Verify virtual environment
which python
pip list | grep django
```

### Debug Mode

```python
# Enable Django debug toolbar
pip install django-debug-toolbar

# settings.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
```

## Contributing

### Code Style

```bash
# Install development tools
pip install black flake8 isort

# Format code
black .
isort .

# Lint code
flake8 .
```

### Pre-commit Setup

```bash
pip install pre-commit
pre-commit install

# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8
```


This backend is designed to be scalable, maintainable, and secure. Follow the development practices outlined here for best results.
