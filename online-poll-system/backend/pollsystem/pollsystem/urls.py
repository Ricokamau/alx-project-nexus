from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# Simple home view for root URL
def home_view(request):
    return HttpResponse('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Poll System API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #2c3e50; }
            a { color: #3498db; text-decoration: none; }
            a:hover { text-decoration: underline; }
            ul { list-style-type: none; padding: 0; }
            li { margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>🚀 Poll System API is Running!</h1>
        <p>Your Django backend is successfully deployed on Render.</p>
        <h3>Available endpoints:</h3>
        <ul>
            <li>📊 <a href="/api/">API Root</a> - Browse API endpoints</li>
            <li>📖 <a href="/api/docs/">Swagger Documentation</a> - Interactive API docs</li>
            <li>🗳️ <a href="/api/polls/">Polls API</a> - Manage polls</li>
            <li>⚙️ <a href="/admin/">Admin Panel</a> - Django administration</li>
        </ul>
        <p><strong>Backend URL for frontend:</strong> <code>https://pollsystem-backend.onrender.com/api/</code></p>
    </body>
    </html>
    ''')

# Swagger configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Online Poll System API",
        default_version='v1',
        description="REST API for online polling system with real-time voting",
        contact=openapi.Contact(email="admin@pollsystem.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('', home_view, name='home'),  # Root URL fix
    path('admin/', admin.site.urls),
    path('api/', include('polls.urls')),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-docs'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc-docs'),
]