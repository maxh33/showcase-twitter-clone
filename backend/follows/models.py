from django.db import models
from django.conf import settings

class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='following'
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('follower', 'following')
        
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
    
    def save(self, *args, **kwargs):
        # Check to make sure users don't follow themselves
        if self.follower == self.following:
            return
        
        # Update counts on save
        if self.pk is None:  # Only on create
            self.follower.following_count += 1
            self.follower.save(update_fields=['following_count'])
            
            self.following.followers_count += 1
            self.following.save(update_fields=['followers_count'])
            
        super().save(*args, **kwargs)
        
    def delete(self, *args, **kwargs):
        # Update counts on delete
        self.follower.following_count = max(0, self.follower.following_count - 1)
        self.follower.save(update_fields=['following_count'])
        
        self.following.followers_count = max(0, self.following.followers_count - 1)
        self.following.save(update_fields=['followers_count'])
        
        super().delete(*args, **kwargs)
