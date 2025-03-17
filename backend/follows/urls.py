from django.urls import path
from django.http import JsonResponse

app_name = 'follows'

def follow_api_root(request):
    """Placeholder for follows API root"""
    return JsonResponse({
        "status": "success",
        "message": "Follows API endpoints coming soon",
    })

urlpatterns = [
    path('', follow_api_root, name='follow-api-root'),
] 