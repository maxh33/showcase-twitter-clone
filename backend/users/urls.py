from django.urls import path
from django.http import JsonResponse

app_name = 'users'

def user_api_root(request):
    """Placeholder for users API root"""
    return JsonResponse({
        "status": "success",
        "message": "Users API endpoints coming soon",
    })

urlpatterns = [
    path('', user_api_root, name='user-api-root'),
] 