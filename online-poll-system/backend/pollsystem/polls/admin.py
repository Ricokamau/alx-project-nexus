from django.contrib import admin
from .models import Poll, Option, Vote

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question', 'created_at', 'expires_at', 'total_votes']
    list_filter = ['created_at', 'expires_at']
    search_fields = ['question', 'description']

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'vote_count']
    list_filter = ['poll']

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['poll', 'option', 'ip_address', 'created_at']
    list_filter = ['created_at', 'poll']