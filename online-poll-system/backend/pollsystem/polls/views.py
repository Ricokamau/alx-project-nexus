from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from .models import Poll, Option, Vote
from .serializers import PollSerializer, VoteSerializer

class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer

    def get_queryset(self):
        return Poll.objects.all().order_by('-created_at')

    def retrieve(self, request, pk=None):
        poll = get_object_or_404(Poll, pk=pk)
        serializer = PollSerializer(poll)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        poll = get_object_or_404(Poll, pk=pk)

        if poll.has_expired():
            return Response({'error': 'This poll has expired'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = VoteSerializer(data=request.data)
        if serializer.is_valid():
            option_id = serializer.validated_data['option_id']
            try:
                option = Option.objects.get(id=option_id, poll=poll)
            except Option.DoesNotExist:
                return Response({'error': 'Invalid option for this poll'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                Vote.objects.create(
                    poll=poll,
                    option=option,
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
            except IntegrityError:
                # e.g., unique_together violation — return friendly message
                return Response({'error': 'You have already voted from this IP'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # Unexpected DB error — return server error but avoid exposing internals
                print(f"Vote creation error: {e}")
                return Response({'error': 'Failed to record vote'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'message': 'Vote submitted successfully'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        poll = get_object_or_404(Poll, pk=pk)
        options_data = []
        total_votes = poll.total_votes

        for option in poll.options.all():
            vote_count = option.vote_count
            percentage = (vote_count / total_votes * 100) if total_votes > 0 else 0

            options_data.append({
                'option_id': option.id,
                'option_text': option.text,
                'vote_count': vote_count,
                'percentage': round(percentage, 1)
            })

        return Response({
            'poll_id': poll.id,
            'question': poll.question,
            'total_votes': total_votes,
            'results': options_data,
            'created_at': poll.created_at,
            'expires_at': poll.expires_at
        })
