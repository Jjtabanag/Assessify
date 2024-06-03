from rest_framework import serializers
from .models import User, Assessment, Question_Type, Section, Learning_Outcomes, Question, Option

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'password']
        
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ['id', 'name', 'type', 'description', 'lesson_path', 'no_of_questions', 'user', 'date_created']
    
    def create(self, validated_data):
        if(self.type == 'quiz'):
            return Assessment.objects.create_quiz(**validated_data)
        elif(self.type == 'exam'):
            return Assessment.objects.create_exam(**validated_data)
        
class QuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question_Type
        fields = ['type']

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'section_no', 'name', 'description', 'length', 'type', 'assessment']

class LearningOutcomesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learning_Outcomes
        fields = ['id', 'learning_outcome', 'section']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_no', 'question', 'answer', 'section']

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'question', 'option_no', 'option']