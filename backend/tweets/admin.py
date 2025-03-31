from django.contrib import admin
from .models import Tweet, MediaAttachment

@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content', 'created_at', 'likes_count', 'retweet_count', 'is_deleted')
    list_filter = ('is_deleted', 'created_at')
    search_fields = ('content', 'author__username', 'author__email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MediaAttachment)
class MediaAttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'tweet', 'file', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('tweet__content', 'tweet__author__username')
