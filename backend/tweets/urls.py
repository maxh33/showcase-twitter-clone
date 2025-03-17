from django.urls import path
from django.http import JsonResponse

app_name = 'tweets'

def tweet_api_root(request):
    """Placeholder for tweets API root"""
    return JsonResponse({
        "status": "success",
        "message": "Tweets API endpoints coming soon",
    })

urlpatterns = [
    path('', tweet_api_root, name='tweet-api-root'),
] 