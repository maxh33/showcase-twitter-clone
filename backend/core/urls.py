"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """
    A simple view to confirm the API is working
    """
    return JsonResponse({
        "status": "success",
        "message": "Twitter Clone API is running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/v1/auth/",
            "users": "/api/v1/users/",
            "tweets": "/api/v1/tweets/",
            "notifications": "/api/v1/notifications/",
            "follows": "/api/v1/follows/",
        }
    })

# Define the API v1 URL patterns
api_v1_patterns = [
    path("auth/", include("authentication.urls")),
    path("users/", include("users.urls", namespace="users")),
    path("tweets/", include("tweets.urls", namespace="tweets")),
    path("notifications/", include("notifications.urls", namespace="notifications")),
    path("follows/", include("follows.urls", namespace="follows")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    # Both /api and /api/ will show the API root response
    path("api", api_root),
    path("api/", api_root, name="api-root"),
    # All API v1 endpoints will be under /api/v1/
    path("api/v1/", include(api_v1_patterns)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
