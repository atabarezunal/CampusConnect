from django.urls import path
from .views import get_profile, create_profile

urlpatterns = [
    path('profile/<int:user_id>/', get_profile),
    path('profile/', create_profile),
]