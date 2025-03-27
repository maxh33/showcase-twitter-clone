from django.db import models
from django.conf import settings

class Tweet(models.Model):
    content = models.TextField(max_length=280)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tweets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes_count = models.PositiveIntegerField(default=0)
    retweet_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"
    
    def soft_delete(self):
        self.is_deleted = True
        self.save()
    
    def increment_comments_count(self):
        self.comments_count += 1
        self.save()

class MediaAttachment(models.Model):
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='tweet_media/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Media for {self.tweet.id}"

class Comment(models.Model):
    """Model for comments on tweets"""
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=140)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    media_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on tweet {self.tweet.id}"
    
    def soft_delete(self):
        self.is_deleted = True
        self.save()
    
    def increment_media_count(self):
        self.media_count += 1
        self.save()

class CommentMediaAttachment(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='comment_media/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Media for comment {self.comment.id}"
