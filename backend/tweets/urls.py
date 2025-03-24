from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TweetViewSet

app_name = 'tweets'

router = DefaultRouter()
router.register(r'', TweetViewSet, basename='tweet')

urlpatterns = [
    path('', include(router.urls)),
] 