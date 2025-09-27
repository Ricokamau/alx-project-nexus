from django.db import transaction
from rest_framework import serializers
from .models import Poll, Option, Vote

class OptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.ReadOnlyField()  # uses Option.vote_count property

    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count']


class PollSerializer(serializers.ModelSerializer):
    # Keep read-only representation for existing polls
    options = OptionSerializer(many=True, read_only=True)
    total_votes = serializers.ReadOnlyField()

    class Meta:
        model = Poll
        fields = ['id', 'question', 'description', 'options', 'total_votes', 'created_at', 'expires_at']

    def create(self, validated_data):
        """
        Create a poll, then create Option rows from the raw incoming request data.
        This method is defensive: it accepts either:
          - options: [{ "text": "A" }, { "text": "B" }]
          - options: ["A", "B"]
          - options: [{ "value": "A" }] (tolerates 'value' field)
        It skips invalid/empty entries and avoids raising a 500.
        """
        # Create poll first
        poll = Poll.objects.create(**validated_data)

        # Attempt to extract raw options from the request payload
        try:
            initial_data = getattr(self, 'initial_data', {}) or {}
            options_data = initial_data.get('options', []) or []
        except Exception:
            options_data = []

        # Build a cleaned list of option texts
        cleaned_texts = []
        for option_data in options_data:
            option_text = None
            if isinstance(option_data, dict):
                # accept { "text": "..."} or { "value": "..." }
                option_text = option_data.get('text') or option_data.get('value')
            elif isinstance(option_data, str):
                option_text = option_data
            # else ignore other types

            if option_text is not None:
                option_text = str(option_text).strip()
            if option_text:
                cleaned_texts.append(option_text)

        # Create Option objects inside a transaction (defensive)
        if cleaned_texts:
            try:
                with transaction.atomic():
                    for text in cleaned_texts:
                        # extra guard: ensure text not empty
                        if text:
                            Option.objects.create(poll=poll, text=text)
            except Exception as e:
                # If options creation fails for any reason, log (print) and continue.
                # We avoid crashing the whole request; return poll to the client.
                # In production use proper logging instead of print().
                print(f"Options creation error (non-fatal): {e}")

        # Return the poll object (existing behaviour preserved)
        return poll


class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()

    def validate_option_id(self, value):
        if not Option.objects.filter(id=value).exists():
            raise serializers.ValidationError("Option does not exist")
        return value
