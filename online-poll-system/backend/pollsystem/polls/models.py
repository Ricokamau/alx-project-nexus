from django.db import models
from django.utils import timezone

class Poll(models.Model):
    question = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return self.question
    
    @property
    def total_votes(self):
        return Vote.objects.filter(poll=self).count()
    
    def has_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

class Option(models.Model):
    poll = models.ForeignKey(Poll, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.poll.question} - {self.text}"
    
    @property
    def vote_count(self):
        return Vote.objects.filter(option=self).count()

class Vote(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    option = models.ForeignKey(Option, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Prevent multiple votes from same IP on same poll
        unique_together = ['poll', 'ip_address']
    
    def __str__(self):
        return f"Vote for {self.option.text} in {self.poll.question}"