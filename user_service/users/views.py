from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer
from .models import Skill, UserSkill, Profile
from .serializers import SkillSerializer

@api_view(['GET'])
def get_profile(request, user_id):
    profile = Profile.objects.filter(user_id=user_id).first()
    if not profile:
        return Response({'error': 'Not found'}, status=404)

    return Response(ProfileSerializer(profile).data)


@api_view(['POST'])
def create_profile(request):
    serializer = ProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def create_skill(request):
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_skills(request):
    skills = Skill.objects.all()
    return Response(SkillSerializer(skills, many=True).data)



@api_view(['POST'])
def assign_skill(request):
    profile_id = request.data.get('profile_id')
    skill_id = request.data.get('skill_id')
    experience = request.data.get('experience')
    try:
        profile = Profile.objects.get(profile_id=profile_id)
        skill = Skill.objects.get(id_skill=skill_id)
        user_skill, created = UserSkill.objects.get_or_create(
            profile=profile,
            skill=skill,
            defaults={'experience': experience}
        )
        if not created:
            user_skill.experience = experience
            user_skill.save()
        return Response({"message": "Skill asignada correctamente"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)