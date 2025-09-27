from rest_framework import serializers
from .models import Poll, Option, Vote

class OptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count']

class PollSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)  # Read-only for GET requests
    total_votes = serializers.ReadOnlyField()
    
    # Add a write-only field for creating options
    option_texts = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False,
        help_text="List of option texts for creating a poll"
    )
    
    class Meta:
        model = Poll
        fields = [
            'id', 'question', 'description', 'options', 'total_votes', 
            'created_at', 'expires_at', 'option_texts'
        ]
    
    def create(self, validated_data):
        # Extract option texts if provided (for backward compatibility)
        option_texts = validated_data.pop('option_texts', [])
        
        # Handle the case where options are sent as objects with 'text' field
        options_data = validated_data.pop('options', [])
        
        # Create the poll
        poll = Poll.objects.create(**validated_data)
        
        # Create options from option_texts (new way)
        for option_text in option_texts:
            Option.objects.create(poll=poll, text=option_text)
        
        # Create options from options data (for the current frontend format)
        for option_data in options_data:
            if isinstance(option_data, dict) and 'text' in option_data:
                Option.objects.create(poll=poll, text=option_data['text'])
            elif isinstance(option_data, str):
                Option.objects.create(poll=poll, text=option_data)
        
        return poll
    
    def to_internal_value(self, data):
        """
        Custom method to handle the frontend sending options as [{"text": "..."}]
        """
        # If options are sent as objects with 'text' field, extract just the texts
        if 'options' in data and isinstance(data['options'], list):
            options = data['options']
            if options and isinstance(options[0], dict) and 'text' in options[0]:
                # Convert [{"text": "option1"}] to ["option1"]
                data = data.copy()
                data['option_texts'] = [opt['text'] for opt in options]
                data.pop('options', None)
        
        return super().to_internal_value(data)

class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()
    
    def validate_option_id(self, value):
        if not Option.objects.filter(id=value).exists():
            raise serializers.ValidationError("Option does not exist")
        return value