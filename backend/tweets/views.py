from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from django.core.files.uploadedfile import UploadedFile
import os
from .models import Tweet, MediaAttachment, Comment, CommentMediaAttachment, Like, Retweet
from .serializers import (
    TweetSerializer, 
    MediaAttachmentSerializer, 
    CommentSerializer,
    CommentMediaAttachmentSerializer
)
from users.models import User
from django.conf import settings
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

# Custom throttle classes
class TweetCreateThrottle(UserRateThrottle):
    rate = '100/day'
    scope = 'tweet_create'

class TweetLikeRateThrottle(UserRateThrottle):
    rate = '200/hour'
    scope = 'tweet_like'

class TweetRetweetRateThrottle(UserRateThrottle):
    rate = '100/hour'
    scope = 'tweet_retweet'

class TweetSearchRateThrottle(UserRateThrottle):
    rate = '300/hour'
    scope = 'tweet_search'


class TweetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling tweet operations
    """
    queryset = Tweet.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = TweetSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated]
    
    # Maximum file size: 5MB
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    # Dictionary of allowed MIME types to file extensions
    ALLOWED_MIME_TYPES = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'video/mp4': '.mp4',
        'video/quicktime': '.mov',
    }
    
    def get_throttles(self):
        """
        Instantiate and return the list of throttles that apply to the request.
        Different throttles for different actions.
        """
        if self.action == 'create':
            throttle_classes = [TweetCreateThrottle]
        elif self.action == 'like':
            throttle_classes = [TweetLikeRateThrottle]
        elif self.action == 'retweet':
            throttle_classes = [TweetRetweetRateThrottle]
        elif self.action == 'search':
            throttle_classes = [TweetSearchRateThrottle]
        else:
            throttle_classes = []
        return [throttle() for throttle in throttle_classes]
    
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        logger.info("Creating tweet with data: %s", self.request.data)
        logger.info("Files in request: %s", self.request.FILES)
        
        # Check if user is a demo user
        if getattr(self.request.user, 'is_demo_user', False):
            raise ValidationError(
                {'error': 'This feature is not available for demo accounts'}
            )
        
        # Create the tweet first
        tweet = serializer.save(author=self.request.user)
        logger.info("Created tweet with ID: %s", tweet.id)
        
        try:
            # Handle media attachments
            files = self.request.FILES.getlist('media')
            logger.info("Processing %s media files", len(files))
            
            for file in files:
                logger.info("Processing file: %s (%s, %s bytes)", file.name, file.content_type, file.size)
                
                # Validate file size
                if file.size > self.MAX_FILE_SIZE:
                    tweet.delete()
                    raise ValidationError(f"File size cannot exceed {self.MAX_FILE_SIZE / (1024*1024)}MB")
                
                # Validate file type
                if file.content_type not in self.ALLOWED_MIME_TYPES:
                    tweet.delete()
                    raise ValidationError(f"File type {file.content_type} not allowed")
                
                # Create media attachment
                try:
                    media = MediaAttachment.objects.create(
                        tweet=tweet,
                        file=file
                    )
                    logger.info("Created media attachment: %s", media.id)
                except Exception as e:
                    logger.error("Error creating media attachment: %s", str(e))
                    tweet.delete()
                    raise
                    
        except Exception as e:
            logger.error("Error processing media: %s", str(e))
            if tweet.id:
                tweet.delete()
            raise
            
        return tweet
    
    def perform_destroy(self, instance):
        """Soft delete a tweet instead of actually deleting it"""
        instance.soft_delete()
    
    @action(detail=False, methods=['get'])
    def feed(self, request):
        """
        Get tweets for home feed
        
        Currently returns all tweets, but later will filter based on:
        - Tweets from users the current user follows
        - Popular tweets
        - Recent tweets
        """
        # For now, just get all tweets ordered by creation date
        tweets = Tweet.objects.filter(is_deleted=False).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(tweets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tweets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_tweets(self, request):
        """Get tweets from a specific user"""
        username = request.query_params.get('username')
        
        if not username:
            return Response(
                {'error': 'Username parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the user
        user = get_object_or_404(User, username=username, is_deleted=False)
        
        # Get their tweets
        tweets = Tweet.objects.filter(
            author=user,
            is_deleted=False
        ).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(tweets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tweets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search tweets by content, username, or hashtag"""
        query = request.query_params.get('q', '')
        
        if not query:
            return Response(
                {'error': 'Search query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if searching for hashtag
        if query.startswith('#'):
            hashtag = query[1:]  # Remove the # symbol
            tweets = Tweet.objects.filter(
                content__iregex=rf'#\b{hashtag}\b',  # Match exact hashtag
                is_deleted=False
            ).order_by('-created_at')
        else:
            # Search tweets by content or author username
            tweets = Tweet.objects.filter(
                Q(content__icontains=query) | 
                Q(author__username__icontains=query),
                is_deleted=False
            ).order_by('-created_at')
        
        # Apply pagination
        page = self.paginate_queryset(tweets)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(tweets, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        tweet = self.get_object()
        user = request.user

        # Check if user has already liked the tweet
        if Like.objects.filter(tweet=tweet, user=user).exists():
            return Response(
                {'error': 'You have already liked this tweet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create like and increment counter
        Like.objects.create(tweet=tweet, user=user)
        tweet.likes_count = F('likes_count') + 1
        tweet.save()
        tweet.refresh_from_db()
        
        serializer = self.get_serializer(tweet)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def retweet(self, request, pk=None):
        tweet = self.get_object()
        user = request.user

        # Check if user is a demo user
        if getattr(user, 'is_demo_user', False):
            return Response(
                {'error': 'This feature is not available for demo accounts'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user has already retweeted the tweet
        if Retweet.objects.filter(tweet=tweet, user=user).exists():
            return Response(
                {'error': 'You have already retweeted this tweet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create retweet and increment counter
        Retweet.objects.create(tweet=tweet, user=user)
        tweet.retweet_count = F('retweet_count') + 1
        tweet.save()
        tweet.refresh_from_db()
        
        serializer = self.get_serializer(tweet)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get all comments for a specific tweet"""
        tweet = self.get_object()
        comments = Comment.objects.filter(tweet=tweet, is_deleted=False).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a tweet"""
        # Check if user is a demo user
        if getattr(request.user, 'is_demo_user', False):
            return Response(
                {'error': 'This feature is not available for demo accounts'},
                status=status.HTTP_403_FORBIDDEN
            )

        tweet = self.get_object()
        serializer = CommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(tweet=tweet, author=request.user)
            
            # Update comment count
            tweet.comments_count = F('comments_count') + 1
            tweet.save()
            tweet.refresh_from_db()
            
            # Return updated tweet with new comment
            tweet_serializer = self.get_serializer(tweet)
            return Response(tweet_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_media(self, request, tweet_id):
        """Add media attachment to a tweet"""
        tweet = get_object_or_404(Tweet, id=tweet_id, author=request.user)
        
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure media directory exists
        media_dir = os.path.join(settings.MEDIA_ROOT, 'tweet_media')
        os.makedirs(media_dir, exist_ok=True)
        
        file = request.FILES['file']
        media = MediaAttachment.objects.create(tweet=tweet, file=file)
        
        serializer = MediaAttachmentSerializer(media)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for handling comment operations"""
    queryset = Comment.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = CommentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated]
    
    # Maximum file size: 5MB
    MAX_FILE_SIZE = 5 * 1024 * 1024
    
    # Dictionary of allowed MIME types to file extensions
    ALLOWED_MIME_TYPES = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
    }
    
    def perform_create(self, serializer):
        # Check if user is a demo user
        if getattr(self.request.user, 'is_demo_user', False):
            raise serializers.ValidationError(
                {'error': 'This feature is not available for demo accounts'}
            )
            
        # Get the tweet ID from the URL or request data
        tweet_id = self.kwargs.get('tweet_pk') or self.request.data.get('tweet_id')
        if not tweet_id:
            raise ValueError("Tweet ID is required")
        
        tweet = get_object_or_404(Tweet, pk=tweet_id)
        comment = serializer.save(author=self.request.user, tweet=tweet)
        
        # Handle any media files if present
        if 'media' in self.request.FILES:
            for file in self.request.FILES.getlist('media'):
                if file.size > self.MAX_FILE_SIZE:
                    raise serializers.ValidationError(
                        f"File size cannot exceed {self.MAX_FILE_SIZE / (1024 * 1024)}MB"
                    )
                
                if file.content_type not in self.ALLOWED_MIME_TYPES:
                    raise serializers.ValidationError(
                        f"File type {file.content_type} is not supported"
                    )
                
                CommentMediaAttachment.objects.create(comment=comment, file=file)
                comment.increment_media_count()
        
        # Update comment count on the tweet
        tweet.comments_count = F('comments_count') + 1
        tweet.save()
        tweet.refresh_from_db()
    
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        tweet = comment.tweet
        
        # Soft delete the comment
        comment.soft_delete()
        
        # Update comment count
        tweet.comments_count = F('comments_count') - 1
        tweet.save()
        tweet.refresh_from_db()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def add_media(self, request, pk=None):
        """Add media attachment to a comment"""
        comment = self.get_object()
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file size
        if file.size > self.MAX_FILE_SIZE:
            return Response(
                {'error': f"File size cannot exceed {self.MAX_FILE_SIZE / (1024 * 1024)}MB"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type
        if file.content_type not in self.ALLOWED_MIME_TYPES:
            return Response(
                {'error': f"File type {file.content_type} is not supported"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure media directory exists
        media_dir = os.path.join(settings.MEDIA_ROOT, 'comment_media')
        os.makedirs(media_dir, exist_ok=True)
        
        # Create media attachment
        media = CommentMediaAttachment.objects.create(comment=comment, file=file)
        comment.increment_media_count()
        
        serializer = CommentMediaAttachmentSerializer(media)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
