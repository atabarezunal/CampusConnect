from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile
from .serializers import ProfileSerializer

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