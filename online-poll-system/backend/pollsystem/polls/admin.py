from django.contrib import admin
from .models import Poll, Option, Vote

class OptionInline(admin.TabularInline):
    model = Option
    extra = 3  # Show 3 empty option fields by default
    fields = ['text']

class VoteInline(admin.TabularInline):
    model = Vote
    extra = 0
    readonly_fields = ['voter_ip', 'created_at']
    fields = ['option', 'voter_ip', 'created_at']

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question', 'created_at', 'expires_at', 'is_active', 'total_votes']
    list_filter = ['is_active', 'created_at', 'expires_at']
    search_fields = ['question', 'description']
    readonly_fields = ['id', 'created_at', 'total_votes']
    fields = ['question', 'description', 'expires_at', 'is_active', 'id', 'created_at', 'total_votes']
    inlines = [OptionInline, VoteInline]
    
    def total_votes(self, obj):
        return obj.total_votes
    total_votes.short_description = 'Total Votes'

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'vote_count', 'created_at']
    list_filter = ['created_at', 'poll']
    search_fields = ['text', 'poll__question']
    readonly_fields = ['id', 'created_at', 'vote_count']
    fields = ['poll', 'text', 'id', 'created_at', 'vote_count']
    inlines = [VoteInline]
    
    def vote_count(self, obj):
        return obj.vote_count
    vote_count.short_description = 'Votes'

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['option', 'poll', 'voter_ip', 'created_at']
    list_filter = ['created_at', 'poll', 'option']
    search_fields = ['voter_ip', 'option__text', 'poll__question']
    readonly_fields = ['id', 'created_at', 'poll']
    fields = ['poll', 'option', 'voter_ip', 'id', 'created_at']
    
    def poll(self, obj):
        return obj.option.poll
    poll.short_description = 'Poll'