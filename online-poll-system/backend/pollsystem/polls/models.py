from django.db import models
from django.contrib.auth.models import User
import uuid

class Poll(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Poll'
        verbose_name_plural = 'Polls'
    
    def __str__(self):
        return self.question
    
    @property
    def total_votes(self):
        return Vote.objects.filter(option__poll=self).count()

class Option(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    poll = models.ForeignKey(Poll, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = 'Option'
        verbose_name_plural = 'Options'
    
    def __str__(self):
        return f"{self.poll.question} - {self.text}"
    
    @property
    def vote_count(self):
        return self.votes.count()
    
    @property
    def vote_percentage(self):
        total = self.poll.total_votes
        if total == 0:
            return 0
        return (self.vote_count / total) * 100

class Vote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    option = models.ForeignKey(Option, related_name='votes', on_delete=models.CASCADE)
    poll = models.ForeignKey(Poll, related_name='votes', on_delete=models.CASCADE)  # Direct reference to poll
    voter_ip = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # This prevents a user from voting multiple times in the same poll
        unique_together = [['poll', 'voter_ip']]
        ordering = ['-created_at']
        verbose_name = 'Vote'
        verbose_name_plural = 'Votes'
    
    def __str__(self):
        return f"Vote for {self.option.text} by {self.voter_ip}"
    
    def save(self, *args, **kwargs):
        # Automatically set the poll field based on the option
        if not self.poll_id:
            self.poll = self.option.poll
        super().save(*args, **kwargs)