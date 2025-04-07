from rest_framework import serializers
from .models import User

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'location', 
                  'profile_picture', 'followers_count', 'following_count', 'tweets_count', 'is_verified']
        read_only_fields = ['id', 'email', 'followers_count', 'following_count', 'tweets_count', 'is_verified'] 