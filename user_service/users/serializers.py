from rest_framework import serializers
from .models import Profile, Skill, UserSkill

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'


class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer()

    class Meta:
        model = UserSkill
        fields = ['skill', 'experience']


class ProfileSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = '__all__'

    def get_skills(self, obj):
        user_skills = UserSkill.objects.filter(profile=obj)
        return UserSkillSerializer(user_skills, many=True).data