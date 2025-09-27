from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Poll, Option, Vote
from .serializers import PollSerializer, VoteSerializer


class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all().order_by('-created_at')
    serializer_class = PollSerializer

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        serializer = VoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        option_id = serializer.validated_data['option_id']
        try:
            option = Option.objects.get(id=option_id, poll_id=pk)
        except Option.DoesNotExist:
            return Response({'error': 'Invalid option'}, status=status.HTTP_400_BAD_REQUEST)

        Vote.objects.create(option=option)
        return Response({'message': 'Vote recorded'}, status=status.HTTP_201_CREATED)
