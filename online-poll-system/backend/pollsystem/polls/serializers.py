from rest_framework import serializers
from .models import Poll, Option, Vote


class OptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.ReadOnlyField()

    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count']


class PollSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=True)  # allow write + read
    total_votes = serializers.ReadOnlyField()

    class Meta:
        model = Poll
        fields = [
            'id',
            'question',
            'description',
            'options',
            'total_votes',
            'created_at',
            'expires_at'
        ]

    def create(self, validated_data):
        # Extract options from validated data
        options_data = validated_data.pop('options', [])
        poll = Poll.objects.create(**validated_data)

        # Create each option safely
        for option_data in options_data:
            if isinstance(option_data, dict) and 'text' in option_data:
                text = option_data['text'].strip()
                if text:
                    Option.objects.create(poll=poll, text=text)

        return poll


class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()

    def validate_option_id(self, value):
        if not Option.objects.filter(id=value).exists():
            raise serializers.ValidationError("Option does not exist")
        return value
