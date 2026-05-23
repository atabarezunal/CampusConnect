from django.urls import path
from .views import get_profile, create_profile, create_skill, get_skills, assign_skill, get_user_skills, update_profile

urlpatterns = [
    path('profile/<int:user_id>/', get_profile),
    path('profile/<int:user_id>/update/', update_profile),
    path('profile/<int:user_id>/skills/', get_user_skills),
    path('profile/', create_profile),
    path('skills/', get_skills),
    path('skills/create/', create_skill),
    path('skills/assign/', assign_skill),
]
