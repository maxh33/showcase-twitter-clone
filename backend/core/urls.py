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
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.views.static import serve

schema_view = get_schema_view(
    openapi.Info(
        title="Twitter Clone API",
        default_version='v1',
        description="API documentation for Twitter Clone project",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def api_root(request):
    """Root endpoint for API"""
    return JsonResponse({
        "status": "success",
        "message": "API is running",
        "endpoints": {
            "auth": "/api/v1/auth/",
            "users": "/api/v1/users/",
            "tweets": "/api/v1/tweets/",
            "docs": "/api/v1/docs/",
            "swagger": "/api/v1/swagger/",
        }
    })

urlpatterns = [
    # API root
    path('api/v1/', api_root, name='api-root'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/auth/', include('authentication.urls', namespace='auth')),
    path('api/v1/users/', include('users.urls', namespace='users')),
    path('api/v1/tweets/', include('tweets.urls', namespace='tweets')),
    
    # API documentation
    path('api/v1/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/v1/docs/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # In production, serve media files through Django
    urlpatterns += [
        path('media/<path:path>', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
