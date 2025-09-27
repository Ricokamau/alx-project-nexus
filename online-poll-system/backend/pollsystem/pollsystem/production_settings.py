# backend/pollsystem/pollsystem/production_settings.py
import os
from .settings import *  # import base settings

# SECURITY
DEBUG = False
SECRET_KEY = os.environ.get("SECRET_KEY")  # set on Railway

# Hosts (set via env var or default to allow Railway domain temporarily)
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

# Database via DATABASE_URL (Railway provides DATABASE_URL for Postgres)
import dj_database_url
DATABASES = {
    "default": dj_database_url.parse(os.environ.get("DATABASE_URL"), conn_max_age=600)
}

# Static files (WhiteNoise)
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_URL = "/static/"
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

# Add WhiteNoise middleware directly after SecurityMiddleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
] + MIDDLEWARE[1:]

# CORS: read comma-separated origins from env var (set on Railway)
from corsheaders.defaults import default_headers
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")
# (Alternatively use CORS_ALLOW_ALL_ORIGINS=True temporarily while testing)

# Security headers (optional but recommended)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Logging -> stream to console (Railway will capture logs)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
