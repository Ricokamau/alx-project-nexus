from django.db import models


class Poll(models.Model):
    question = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    @property
    def total_votes(self):
        return sum(option.votes.count() for option in self.options.all())

    def __str__(self):
        return self.question


class Option(models.Model):
    poll = models.ForeignKey(Poll, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)

    @property
    def vote_count(self):
        return self.votes.count()

    def __str__(self):
        return f"{self.text} ({self.vote_count} votes)"


class Vote(models.Model):
    option = models.ForeignKey(Option, related_name='votes', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vote for {self.option.text}"
