from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db import IntegrityError
from .models import Poll, Option, Vote
from .serializers import PollSerializer, PollCreateSerializer, VoteSerializer

class PollListCreateView(generics.ListCreateAPIView):
    queryset = Poll.objects.filter(is_active=True).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PollCreateSerializer
        return PollSerializer

class PollDetailView(generics.RetrieveAPIView):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    lookup_field = 'id'

@api_view(['POST'])
def vote_view(request, poll_id):
    try:
        poll = Poll.objects.get(id=poll_id, is_active=True)
        option_id = request.data.get('option_id')
        
        if not option_id:
            return Response({'error': 'Option ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        option = Option.objects.get(id=option_id, poll=poll)
        voter_ip = request.META.get('REMOTE_ADDR')
        
        # Check if user already voted in this poll
        existing_vote = Vote.objects.filter(poll=poll, voter_ip=voter_ip).first()
        
        if existing_vote:
            return Response({'error': 'You have already voted in this poll'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the vote
        Vote.objects.create(option=option, poll=poll, voter_ip=voter_ip)
        
        # Return updated poll results
        serializer = PollSerializer(poll)
        return Response({'message': 'Vote recorded successfully', 'poll': serializer.data})
        
    except Poll.DoesNotExist:
        return Response({'error': 'Poll not found'}, status=status.HTTP_404_NOT_FOUND)
    except Option.DoesNotExist:
        return Response({'error': 'Option not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def poll_results(request, poll_id):
    try:
        poll = Poll.objects.get(id=poll_id)
        serializer = PollSerializer(poll)
        return Response(serializer.data)
    except Poll.DoesNotExist:
        return Response({'error': 'Poll not found'}, status=status.HTTP_404_NOT_FOUND)