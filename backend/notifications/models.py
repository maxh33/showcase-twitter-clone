from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    FOLLOW = 'follow', 'Follow'
    LIKE = 'like', 'Like'
    MENTION = 'mention', 'Mention'
    RETWEET = 'retweet', 'Retweet'

class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications_received'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications_sent'
    )
    notification_type = models.CharField(
        max_length=10,
        choices=NotificationType.choices
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} notification from {self.sender.username} to {self.recipient.username}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])
