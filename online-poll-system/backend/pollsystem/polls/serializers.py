from rest_framework import serializers
from .models import Poll, Option, Vote

class OptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count']

class PollSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    total_votes = serializers.ReadOnlyField()
    
    class Meta:
        model = Poll
        fields = ['id', 'question', 'description', 'created_at', 'expires_at', 'is_active', 'options', 'total_votes']

class PollCreateSerializer(serializers.ModelSerializer):
    options = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        min_length=2
    )
    
    class Meta:
        model = Poll
        fields = ['question', 'description', 'expires_at', 'options']
    
    def create(self, validated_data):
        options_data = validated_data.pop('options')
        poll = Poll.objects.create(**validated_data)
        
        for option_text in options_data:
            Option.objects.create(poll=poll, text=option_text)
        
        return poll

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['option']
    
    def create(self, validated_data):
        request = self.context.get('request')
        voter_ip = request.META.get('REMOTE_ADDR')
        validated_data['voter_ip'] = voter_ip
        return super().create(validated_data)