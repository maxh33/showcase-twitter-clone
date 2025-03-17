from django.urls import path
from django.http import JsonResponse

app_name = 'notifications'

def notification_api_root(request):
    """Placeholder for notifications API root"""
    return JsonResponse({
        "status": "success",
        "message": "Notifications API endpoints coming soon",
    })

urlpatterns = [
    path('', notification_api_root, name='notification-api-root'),
] 