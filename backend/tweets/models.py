from django.db import models
from django.conf import settings

class Tweet(models.Model):
    content = models.TextField(max_length=280)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tweets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes_count = models.PositiveIntegerField(default=0)
    retweet_count = models.PositiveIntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author.username}: {self.content[:50]}"
    
    def soft_delete(self):
        self.is_deleted = True
        self.save()

class MediaAttachment(models.Model):
    tweet = models.ForeignKey(Tweet, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='tweet_media/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Media for {self.tweet.id}"
