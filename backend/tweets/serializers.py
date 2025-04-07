from rest_framework import serializers
from .models import Tweet, MediaAttachment, Comment, CommentMediaAttachment
from users.serializers import UserProfileSerializer
import re
from django.utils.html import escape
import bleach

def extract_hashtags(content):
    """Extract hashtags from content"""
    return re.findall(r'#(\w+)', content)

class MediaAttachmentSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = MediaAttachment
        fields = ['id', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_file(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class CommentMediaAttachmentSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = CommentMediaAttachment
        fields = ['id', 'file', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_file(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None


class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    media = CommentMediaAttachmentSerializer(many=True, read_only=True)
    hashtags = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'media', 'media_count', 'hashtags']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'media_count', 'hashtags']
    
    def get_hashtags(self, obj):
        """Get hashtags from comment content"""
        return extract_hashtags(obj.content)
    
    def validate_content(self, value):
        """
        Validate the comment content:
        - Sanitize HTML while preserving hashtags and normal characters
        - Check that content is not empty after stripping
        - Ensure it doesn't exceed 140 characters
        """
        # Store hashtags before cleaning
        hashtags = extract_hashtags(value)
        
        # Clean the content using bleach, allowing only basic formatting
        allowed_tags = []  # No HTML tags allowed
        allowed_attributes = {}  # No attributes allowed
        cleaned_value = bleach.clean(value, tags=allowed_tags, attributes=allowed_attributes, strip=True)
        
        # Check content is not empty after stripping
        if not cleaned_value.strip():
            raise serializers.ValidationError("Comment content cannot be empty")
        
        # Check length limit
        if len(cleaned_value) > 140:
            raise serializers.ValidationError("Comment content cannot exceed 140 characters")
        
        # Check for any potentially malicious patterns
        if re.search(r'<script|javascript:|on\w+\s*=', cleaned_value, re.IGNORECASE):
            raise serializers.ValidationError("Content contains potentially unsafe elements")
        
        return cleaned_value
    
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
    hashtags = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_retweeted = serializers.SerializerMethodField()
    
    class Meta:
        model = Tweet
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 
                  'likes_count', 'retweet_count', 'comments_count', 
                  'media', 'comments', 'comments_preview', 'hashtags',
                  'is_liked', 'is_retweeted']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 
                           'likes_count', 'retweet_count', 'comments_count', 'hashtags',
                           'is_liked', 'is_retweeted']
    
    def get_hashtags(self, obj):
        """Get hashtags from tweet content"""
        return extract_hashtags(obj.content)
    
    def get_comments_preview(self, obj):
        """Get the latest 3 comments for preview"""
        latest_comments = obj.comments.filter(is_deleted=False).order_by('-created_at')[:3]
        return CommentSerializer(latest_comments, many=True).data
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_is_retweeted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.retweets.filter(user=request.user).exists()
        return False
    
    def validate_content(self, value):
        """
        Validate the tweet content:
        - Sanitize HTML while preserving hashtags and normal characters
        - Check that content is not empty after stripping
        - Ensure it doesn't exceed 280 characters
        """
        # Store hashtags before cleaning
        hashtags = extract_hashtags(value)
        
        # Clean the content using bleach, allowing only basic formatting
        allowed_tags = []  # No HTML tags allowed
        allowed_attributes = {}  # No attributes allowed
        cleaned_value = bleach.clean(value, tags=allowed_tags, attributes=allowed_attributes, strip=True)
        
        # Check content is not empty after stripping
        if not cleaned_value.strip():
            raise serializers.ValidationError("Tweet content cannot be empty")
        
        # Check length limit (280 characters for Twitter-like experience)
        if len(cleaned_value) > 280:
            raise serializers.ValidationError("Tweet content cannot exceed 280 characters")
        
        # Check for any potentially malicious patterns
        if re.search(r'<script|javascript:|on\w+\s*=', cleaned_value, re.IGNORECASE):
            raise serializers.ValidationError("Content contains potentially unsafe elements")
            
        return cleaned_value
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data) 