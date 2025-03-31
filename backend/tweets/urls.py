from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TweetViewSet, CommentViewSet

app_name = 'tweets'

router = DefaultRouter()
router.register(r'', TweetViewSet, basename='tweet')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:tweet_pk>/comments/', CommentViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='tweet-comments'),
    path('<int:tweet_pk>/comments/<int:pk>/', CommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='tweet-comment-detail'),
] 