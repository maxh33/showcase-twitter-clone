from rest_framework import serializers
from .models import Tweet, MediaAttachment, Comment, CommentMediaAttachment
from users.serializers import UserProfileSerializer
import re
from django.utils.html import escape

class MediaAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAttachment
        fields = ['id', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommentMediaAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentMediaAttachment
        fields = ['id', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    media = CommentMediaAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'media', 'media_count']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'media_count']
    
    def validate_content(self, value):
        """
        Validate the comment content:
        - Escape HTML to prevent XSS attacks
        - Check that content is not empty after stripping
        - Ensure it doesn't exceed 140 characters
        """
        # Escape HTML to prevent XSS attacks
        value = escape(value)
        
        # Check content is not empty after stripping
        if not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty")
        
        # Check length limit
        if len(value) > 140:
            raise serializers.ValidationError("Comment content cannot exceed 140 characters")
        
        # Check for any potentially malicious scripts
        if re.search(r'<script|javascript:|on\w+\s*=', value, re.IGNORECASE):
            raise serializers.ValidationError("Content contains potentially unsafe elements")
            
        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)


class TweetSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    media = MediaAttachmentSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True, source='comments.all')
    comments_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Tweet
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 
                  'likes_count', 'retweet_count', 'comments_count', 
                  'media', 'comments', 'comments_preview']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 
                           'likes_count', 'retweet_count', 'comments_count']
    
    def get_comments_preview(self, obj):
        """Get the latest 3 comments for preview"""
        latest_comments = obj.comments.filter(is_deleted=False).order_by('-created_at')[:3]
        return CommentSerializer(latest_comments, many=True).data
    
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