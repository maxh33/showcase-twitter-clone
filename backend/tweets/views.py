from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Tweet, MediaAttachment
from .serializers import TweetSerializer, MediaAttachmentSerializer
from users.models import User


class TweetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling tweet operations
    """
    serializer_class = TweetSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Return tweets that aren't deleted"""
        return Tweet.objects.filter(is_deleted=False)
    
    def perform_create(self, serializer):
        """Create a new tweet with the current user as author"""
        serializer.save(author=self.request.user)
    
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
        """Search tweets by content or username"""
        query = request.query_params.get('q', '')
        
        if not query:
            return Response(
                {'error': 'Search query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        """Toggle like status for a tweet"""
        tweet = self.get_object()
        
        # Implement a more complex like system later with a Like model
        # For now, just increment the likes count
        tweet.likes_count += 1
        tweet.save()
        
        return Response({'status': 'tweet liked'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def retweet(self, request, pk=None):
        """Retweet functionality"""
        tweet = self.get_object()
        
        # Implement a more complex retweet system later with a Retweet model
        # For now, just increment the retweet count
        tweet.retweet_count += 1
        tweet.save()
        
        return Response({'status': 'tweet retweeted'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def add_media(self, request, pk=None):
        """Add media to a tweet"""
        tweet = self.get_object()
        
        # Check if the user is the author of the tweet
        if tweet.author != request.user:
            return Response({'error': 'You can only add media to your own tweets'},
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get the file from request
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create media attachment
        media = MediaAttachment.objects.create(tweet=tweet, file=file)
        serializer = MediaAttachmentSerializer(media)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
