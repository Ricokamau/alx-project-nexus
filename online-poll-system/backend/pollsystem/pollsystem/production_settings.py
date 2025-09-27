import os
import dj_database_url
from .settings import *

# Production-specific settings
DEBUG = False

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Allowed hosts - Railway will set this
ALLOWED_HOSTS = ['*']  # Railway handles this securely

# Database configuration for production
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }

# Static files configuration
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Add whitenoise middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
] + MIDDLEWARE[1:]

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.vercel.app",  # Will update this later
]

# Use environment variables for sensitive data
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-fallback-secret-key')

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}