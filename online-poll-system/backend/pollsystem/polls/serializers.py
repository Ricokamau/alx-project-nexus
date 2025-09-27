from rest_framework import serializers
from .models import Poll, Option, Vote
import json

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
        fields = ['id', 'question', 'description', 'options', 'total_votes', 'created_at', 'expires_at']
    
    def create(self, validated_data):
        # Create poll without options first
        poll = Poll.objects.create(**validated_data)
        
        # Try to get options from initial_data (raw request data)
        try:
            initial_data = self.initial_data
            options_data = initial_data.get('options', [])
            
            for option_data in options_data:
                if isinstance(option_data, dict) and 'text' in option_data:
                    option_text = option_data['text']
                elif isinstance(option_data, str):
                    option_text = option_data
                else:
                    continue
                
                if option_text and option_text.strip():
                    Option.objects.create(poll=poll, text=option_text.strip())
        
        except Exception as e:
            # If options creation fails, at least return the poll
            print(f"Options creation failed: {e}")
        
        return poll

class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()
    
    def validate_option_id(self, value):
        if not Option.objects.filter(id=value).exists():
            raise serializers.ValidationError("Option does not exist")
        return value