from django.db import models

class Profile(models.Model):
    profile_id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    bio = models.TextField()
    career = models.CharField(max_length=100)
    semester = models.IntegerField()

    def __str__(self):
        return f"Profile {self.user_id}"


class Skill(models.Model):
    id_skill = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    experience = models.IntegerField()

    class Meta:
        unique_together = ('profile', 'skill')