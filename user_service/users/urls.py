from django.urls import path
from .views import get_profile, create_profile, create_skill, get_skills, assign_skill

urlpatterns = [
    path('profile/<int:user_id>/', get_profile),
    path('profile/', create_profile),
    path('skills/', get_skills),
    path('skills/create/', create_skill),
    path('skills/assign/', assign_skill),
]
