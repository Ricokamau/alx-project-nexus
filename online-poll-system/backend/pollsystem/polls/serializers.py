from rest_framework import serializers
from .models import Poll, Option, Vote


class OptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.ReadOnlyField()

    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count']


class PollSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)

    class Meta:
        model = Poll
        fields = ['id', 'question', 'description', 'options', 'total_votes', 'created_at', 'expires_at']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        poll = Poll.objects.create(**validated_data)

        for option_data in options_data:
            Option.objects.create(poll=poll, **option_data)

        return poll


class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()

    def validate_option_id(self, value):
        if not Option.objects.filter(id=value).exists():
            raise serializers.ValidationError("Option does not exist")
        return value
