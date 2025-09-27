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
        fields = ['id', 'question', 'description', 'options', 'total_votes', 'created_at', 'expires_at']
    
    def create(self, validated_data):
        # Create the poll first
        poll = Poll.objects.create(
            question=validated_data['question'],
            description=validated_data.get('description', ''),
            expires_at=validated_data.get('expires_at', None)
        )
        
        # Get options from request data
        request = self.context.get('request')
        if request and hasattr(request, 'data'):
            options_data = request.data.get('options', [])
            
            # Handle different option formats
            for option_data in options_data:
                if isinstance(option_data, dict) and 'text' in option_data:
                    # Format: {"text": "option"}
                    option_text = option_data['text']
                elif isinstance(option_data, str):
                    # Format: "option"
                    option_text = option_data
                else:
                    continue  # Skip invalid format
                
                # Create option
                if option_text and option_text.strip():
                    Option.objects.create(poll=poll, text=option_text.strip())
        
        return poll

class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()
    
    def validate_option_id(self, value):
        if not Option.objects.filter(id=value).exists():
            raise serializers.ValidationError("Option does not exist")
        return value