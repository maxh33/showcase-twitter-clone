from rest_framework import serializers
from .models import Tweet, MediaAttachment
from users.serializers import UserProfileSerializer
import re
from django.utils.html import escape

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
    
    def validate_content(self, value):
        """
        Validate the tweet content:
        - Escape HTML to prevent XSS attacks
        - Check that content is not empty after stripping
        - Ensure it doesn't exceed 280 characters
        """
        # Escape HTML to prevent XSS attacks
        value = escape(value)
        
        # Check content is not empty after stripping
        if not value.strip():
            raise serializers.ValidationError("Tweet content cannot be empty")
        
        # Check length limit (280 characters for Twitter-like experience)
        if len(value) > 280:
            raise serializers.ValidationError("Tweet content cannot exceed 280 characters")
        
        # Check for any potentially malicious scripts
        if re.search(r'<script|javascript:|on\w+\s*=', value, re.IGNORECASE):
            raise serializers.ValidationError("Content contains potentially unsafe elements")
            
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data) 