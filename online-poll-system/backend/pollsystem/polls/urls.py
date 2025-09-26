from django.urls import path
from . import views

urlpatterns = [
    path('polls/', views.PollListCreateView.as_view(), name='poll-list-create'),
    path('polls/<uuid:id>/', views.PollDetailView.as_view(), name='poll-detail'),
    path('polls/<uuid:poll_id>/vote/', views.vote_view, name='vote'),
    path('polls/<uuid:poll_id>/results/', views.poll_results, name='poll-results'),
]