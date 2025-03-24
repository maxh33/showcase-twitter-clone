from rest_framework import serializers
from .models import Tweet, MediaAttachment
from users.serializers import UserProfileSerializer

class MediaAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAttachment
        fields = ['id', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']

class TweetSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    media = MediaAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tweet
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 
                  'likes_count', 'retweet_count', 'media']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 
                           'likes_count', 'retweet_count']
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data) 