from django.http import JsonResponse
import json
import re
import os
from zipfile import ZipFile
from urllib.parse import unquote, urlencode
from django.forms.models import model_to_dict
from django.contrib.auth import get_user_model, login, logout
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.shortcuts import redirect, render, get_object_or_404
from django.urls import reverse
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.db.utils import IntegrityError
from django.views.generic.base import View
from django.db import transaction
from django.core import serializers
from rest_framework.authtoken.models import Token
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect

from django.contrib.auth import authenticate, login

from .serializers import UserSerializer
from .serializers import AssessmentSerializer, SectionSerializer, QuestionSerializer, OptionSerializer

from .converter import Converter
from .models import Assessment, Question_Type, User, Question, Option, Section
from .file_handler import download_file, handle_uploaded_file


# Notes:
# permission_classes - specifies what kind of user can enter the view
# authentication_classes - requires authentication to enter the view specifically the presence of the sessionid
# return Response() - returns a dictionary in json

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):

    permission_classes = (permissions.AllowAny, )

    def get(self, request):
        return Response({'csrftoken': request.META.get('CSRF_COOKIE')})

@method_decorator(csrf_protect, name='dispatch')
class UserRegisterView(APIView):

    permission_classes = (permissions.AllowAny, )

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        
        return JsonResponse({'message': 'User registration page'})

    def post(self, request):
        
        data = json.loads(request.body)
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        re_password = data.get('repassword')
        error = ''
        
        if password == re_password:
            try:
                serializer = UserSerializer(data={'email': email, 'username': username, 'password': password})
                serializer.is_valid(raise_exception=True)
                serializer.save()
                os.makedirs(fr'backend\api\media\{username}\lessons', exist_ok=True)
                os.makedirs(fr'backend\api\media\{username}\exports', exist_ok=True)

                # If the user is created successfully, you can redirect
                return JsonResponse({'status': 'success', 'message': 'User created successfully'}, status=201)
            
            except Exception as e:
                if 'email' in str(e):
                    error = 'Email already exists'
                else:
                    error = 'Username already exists'
        else:
            error = 'Incorrect password'
            
        return JsonResponse({'status': 'error', 'message': error}, status=403)

@method_decorator(csrf_protect, name='dispatch')
class UserLoginView(APIView):
    
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        data = request.data

        emailorusername = data.get('emailorusername')
        password = data.get('password')

        if not emailorusername or not password:
            return Response({'status': 'error', 'message': 'Email/Username and password are required'}, status=400)

        if re.match(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)", emailorusername):
            print('Input is email')
            user = authenticate(request, email=emailorusername, password=password)
        else:
            print('Input is username')
            user = authenticate(request, username=emailorusername, password=password)

        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            print('Token:', token)
            return Response({'status': 'success', 'message': 'User logged in', 'token': token.key}, status=202)
        else:
            return Response({'status': 'error', 'message': 'Incorrect username/email or password'}, status=403)

@method_decorator(csrf_protect, name='dispatch')
class UserLogoutView(APIView):

    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request):
        logout(request)
        return JsonResponse({'status': 'success', 'message': 'User logged out'})

@method_decorator(csrf_protect, name='dispatch')    
class AssessmentsView(APIView):

    permission_classes = (permissions.IsAuthenticated, )

    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request):
        # Get the token from the Authorization header
        token_key = request.META.get('HTTP_AUTHORIZATION')
        try:
            # Authenticate the token to get the user
            token = Token.objects.get(key=token_key)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invalid token'}, status=403)
        user = token.user
        assessments = Assessment.objects.filter(user_id=user.user_id)

        username = user.username
        assessments_json = serializers.serialize('json', assessments)
        print('User:', user)
        print('Assessments:', assessments)
        return JsonResponse({'username': username, 'assessments': assessments_json})
@method_decorator(csrf_protect, name='dispatch')
class CreateAssessmentView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        user_id = request.session['_auth_user_id']
        user = User.objects.get(pk=user_id)

        data = request.POST

        print('Data:', data)

        assessment_name = data.get('assessment_name')
        assessment_description = data.get('assessment_description')

        print('Assessment Name:', assessment_name)
        print('Assessment Description:', assessment_description)

        lesson = data.get('lesson')
        assessment_type = data.get('type')

        print('Lesson:', lesson)
        print('Assessment Type:', assessment_type)

        no_of_questions = 0

        section = {}
        section_types = []
        section_lengths = []
        learning_outcomes = []

        sections = json.loads(request.POST.get('sections', '[]'))

        for sec in sections:
            section_type = sec.get('sectionType')
            section_length = int(sec.get('sectionLength'))
            section_outcomes = sec.get('learningOutcomes')

            section_types.append(section_type)
            section_lengths.append(section_length)
            learning_outcomes.append(section_outcomes)
            no_of_questions += section_length

        lesson_path = os.path.join(settings.MEDIA_ROOT, f'{user.username}/lessons/{assessment_name}')
        if not os.path.exists(lesson_path):
            os.makedirs(lesson_path)

        if 'lesson_file' in request.FILES:
            file = request.FILES['lesson_file']
            file_name = file.name
            path = os.path.join(lesson_path, file_name)
            with open(path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            file_name = file.name
            path = os.path.join(lesson_path, file_name)
            with open(path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
        else:
            if not lesson:
                lesson = ""
            with open(os.path.join(lesson_path, 'lesson.txt'), 'w') as f:
                f.write(lesson)

        section['section_types'] = section_types
        section['section_lengths'] = section_lengths
        section['learning_outcomes'] = learning_outcomes

        assessment = Assessment.objects.create(name=assessment_name,
                                               type=assessment_type,
                                               description=assessment_description,
                                               lesson_path=lesson_path,
                                               no_of_questions=no_of_questions,
                                               user=user)


        if assessment_type == 'quiz':
            assessment.create_quiz(section)
        elif assessment_type == 'exam':
            assessment.create_exam(section)

        return JsonResponse({'assessment_id': assessment.pk})

class ViewAssessmentView(APIView):

    def get(self, request, id):
        action = request.GET.get('page')
        assessment = get_object_or_404(Assessment, id=id)
        sections = Section.objects.filter(assessment=assessment)
        assessment_data = []

        for section in sections:
            questions = Question.objects.filter(section=section).order_by('question_no')
            section_data = {
                'section': SectionSerializer(section).data,
                'questions': []
            }
            for question in questions:
                options = Option.objects.filter(question=question).order_by('option_no')
                question_data = QuestionSerializer(question).data
                question_data['options'] = OptionSerializer(options, many=True).data
                section_data['questions'].append(question_data)
            assessment_data.append(section_data)

        return Response({'action': action, 'assessment': AssessmentSerializer(assessment).data,
                         'assessment_data': assessment_data})
    
    def post(self, request, id):
        data = request.data
        question_id = data.get('question_id')
        answer = data.get('answer')

        if question_id is None or answer is None:
            return Response({'error': 'Both question_id and answer are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(pk=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

        question.answer = answer
        question.save()

        assessment = get_object_or_404(Assessment, id=id)
        sections = Section.objects.filter(assessment=assessment)
        assessment_data = []

        for section in sections:
            questions = Question.objects.filter(section=section).order_by('question_no')
            section_data = {
                'section': SectionSerializer(section).data,
                'questions': [QuestionSerializer(question).data for question in questions]
            }
            assessment_data.append(section_data)

        return Response({'action': 'edit', 'assessment': AssessmentSerializer(assessment).data,
                         'assessment_data': assessment_data}, status=status.HTTP_200_OK)
    
# class ViewAssessmentView(APIView):

#     permission_classes = (permissions.IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         assessment_id = kwargs.get('id')
#         try:
#             assessment = Assessment.objects.get(id=assessment_id)
#             sections = list(Section.objects.filter(assessment=assessment))
#             question_types = []
#             question_group = []
#             # Populate question_types and question_group
#             # ...
#             # Return assessment data as JSON
#             return JsonResponse({
#                 'assessment': {
#                     'name': assessment.name,
#                     'description': assessment.description,
#                     'type': assessment.type,
#                     'id': assessment.id
#                 },
#                 'sections': sections,
#                 'question_types': question_types,
#                 'question_group': question_group
#             })
#         except Assessment.DoesNotExist:
#             return JsonResponse({'error': 'Assessment not found'}, status=404)
        
#     # edit assessment generated
#     def post(self, request):
#         assessment_id = request.GET.get('as')
#         for key, value in request.POST.items():
#             k = key.split('_')
        assessment = get_object_or_404(Assessment, id=id)
        sections = Section.objects.filter(assessment=assessment)
        assessment_data = []

        for section in sections:
            questions = Question.objects.filter(section=section).order_by('question_no')
            section_data = {
                'section': SectionSerializer(section).data,
                'questions': []
            }
            for question in questions:
                options = Option.objects.filter(question=question).order_by('option_no')
                question_data = QuestionSerializer(question).data
                question_data['options'] = OptionSerializer(options, many=True).data
                section_data['questions'].append(question_data)
            assessment_data.append(section_data)

        return Response({'action': action, 'assessment': AssessmentSerializer(assessment).data,
                         'assessment_data': assessment_data})
    
    def post(self, request, id):
        data = request.data
        question_id = data.get('question_id')
        answer = data.get('answer')

        if question_id is None or answer is None:
            return Response({'error': 'Both question_id and answer are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(pk=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

        question.answer = answer
        question.save()

        assessment = get_object_or_404(Assessment, id=id)
        sections = Section.objects.filter(assessment=assessment)
        assessment_data = []

        for section in sections:
            questions = Question.objects.filter(section=section).order_by('question_no')
            section_data = {
                'section': SectionSerializer(section).data,
                'questions': [QuestionSerializer(question).data for question in questions]
            }
            assessment_data.append(section_data)

        return Response({'action': 'edit', 'assessment': AssessmentSerializer(assessment).data,
                         'assessment_data': assessment_data}, status=status.HTTP_200_OK)
    
# class ViewAssessmentView(APIView):

#     permission_classes = (permissions.IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         assessment_id = kwargs.get('id')
#         try:
#             assessment = Assessment.objects.get(id=assessment_id)
#             sections = list(Section.objects.filter(assessment=assessment))
#             question_types = []
#             question_group = []
#             # Populate question_types and question_group
#             # ...
#             # Return assessment data as JSON
#             return JsonResponse({
#                 'assessment': {
#                     'name': assessment.name,
#                     'description': assessment.description,
#                     'type': assessment.type,
#                     'id': assessment.id
#                 },
#                 'sections': sections,
#                 'question_types': question_types,
#                 'question_group': question_group
#             })
#         except Assessment.DoesNotExist:
#             return JsonResponse({'error': 'Assessment not found'}, status=404)
        
#     # edit assessment generated
#     def post(self, request):
#         assessment_id = request.GET.get('as')
#         for key, value in request.POST.items():
#             k = key.split('_')
            
#             if k[0] == 'assessmentname':
#                 assessment = Assessment.objects.get(pk=k[1])
#                 assessment.name = value
#                 assessment.save()
                
#             elif k[0] == 'assessmentdescription':
#                 assessment = Assessment.objects.get(pk=k[1])
#                 assessment.description = value
#                 assessment.save()
            
#             elif k[0] == 'sectiondescription':
#                 section = Section.objects.get(pk=k[1])
#                 section.description = value
#                 section.save()
            
#             elif k[0] == 'question':
#                 question = Question.objects.get(pk=k[1])
#                 question.question = value
#                 question.save()
            
#             elif k[0] == 'answerwc':
#                 question = Question.objects.get(pk=k[1])
#                 # converts the letter to the number equivalent
#                 number = ord(value.split('.')[0]) - ord('A') + 1
#                 question.answer = number
#                 question.save()
                
#             elif k[0] == 'answer':
#                 question = Question.objects.get(pk=k[1])
#                 question.answer = value
#                 question.save()
            
#             elif k[0] == 'option':
#                 option = Option.objects.get(pk=k[1])
#                 option.option = value
#                 option.save()
            
#         return redirect(reverse('view_assessment') + '?' + urlencode({'as': assessment_id, 'page': 'view'}))

# exports assessment        
@method_decorator(login_required, name='dispatch')
class AssessmentExportView(View):
    
    def get(self, request):
        user_id = request.session['_auth_user_id']
        username = User.objects.get(user_id=user_id).username
        assessment_id = request.GET.get('as')
        file_format = request.GET.get('ff')
        assessment = Assessment.objects.get(id=assessment_id)
        sections = Section.objects.filter(assessment=assessment)
        
        if assessment.type == 'quiz':
            sec = sections[0]
            type = sec.type.type
            question_list = list(Question.objects.filter(section=sec))
            question_dict = {'type': type}
            question_data_list = []
            
            for q in question_list:
                question_data = {
                    'question': q.question,
                    'answer': q.answer
                }
                
                if type == 'Multiple Choice':
                    # gets the list of data from the column 'option'
                    options = list(Option.objects.filter(question=q).values_list('option', flat=True))
                    question_data['options'] = options
                    option_answer = Option.objects.get(question=q, option_no=q.answer)
                    question_data['answer'] = f'{chr(96 + option_answer.option_no)}. {option_answer}'
                    
                question_data_list.append(question_data)   
                
            question_dict['questions'] = question_data_list
            
            if file_format == 'pdf':
                Converter.quiz_to_pdf(assessment=question_dict, type=type, name=assessment.name, username=username)
                Converter.quiz_answer_key(assessment=question_dict, type=type, name=assessment.name, username=username)
                """
                if there is a custom file naming convention
                
                Converter.quiz_to_pdf(assessment=question_dict,
                                      username=username, 
                                      assessment_id=assessment_id, 
                                      type=type, 
                                      assessment_name=assessment.name)
                Converter.quiz_answer_key(assessment=question_dict,
                                          username=username, 
                                          assessment_id=assessment_id, 
                                          type=type, 
                                          assessment_name=assessment.name)
                """
            elif file_format == 'gift':
                Converter.quiz_to_gift(json_data=question_dict, name=assessment.name, username=username)
            elif file_format == 'word':
                Converter.quiz_to_docx(quiz=question_dict, name=assessment.name, username=username)
        
        else:
            exam_dict = {'type': 'exam'}
            section_list = []
            
            for s in sections:
                type = s.type.type
                section_data = {
                    'section_name': s.name, 
                    'section_description': s.description, 
                    'section_type': type
                }
                question_list = list(Question.objects.filter(section=s))
                question_data_list = []
                
                for q in question_list:
                    question_data = {
                        'question': q.question,
                        'answer': q.answer
                    }
                    
                    if type == 'Multiple Choice':
                        # gets the list of data from the column 'option'
                        options = list(Option.objects.filter(question=q).values_list('option', flat=True))
                        question_data['options'] = options
                        print(q.answer)
                        option_answer = Option.objects.get(question=q, option_no=q.answer)
                        question_data['answer'] = f'{chr(97 + option_answer.option_no)}. {option_answer}'
                        
                    question_data_list.append(question_data)   
                
                section_data['questions'] = question_data_list
                section_list.append(section_data)

            exam_dict['sections'] = section_list
            
            
            if file_format == 'pdf':
                Converter.exam_to_pdf(exam=exam_dict, name=assessment.name, username=username)
                Converter.exam_answer_key(exam=exam_dict, name=assessment.name, username=username)
                """
                if there is custom file naming convention
                Converter.exam_to_pdf(exam=exam_dict, 
                                      username=username, 
                                      assessment_id=assessment_id, 
                                      assessment_name=assessment.name)
                Converter.exam_answer_key(exam=exam_dict, 
                                          username=username, 
                                          assessment_id=assessment_id, 
                                          assessment_name=assessment.name)
                """
            elif file_format == 'gift':
                Converter.exam_to_gift(exam=exam_dict, name=assessment.name, username=username)

            if file_format == 'pdf':
                Converter.exam_to_pdf(exam=exam_dict, name=assessment.name, username=username)
                Converter.exam_answer_key(exam=exam_dict, name=assessment.name, username=username)
            elif file_format == 'gift':
                Converter.exam_to_gift(exam=exam_dict, name=assessment.name, username=username)
            elif file_format == 'word':
                Converter.exam_to_docx(exam=exam_dict, name=assessment.name, username=username)

        
        if file_format == 'pdf':
            # Create the zip file
            file_path = rf'{username}\exports\{assessment.name}_assessment.zip'
            
            with ZipFile(rf'{settings.MEDIA_ROOT}\{file_path}', 'w') as zip_object:
                # Adding files to the zip file
                assessment_file_name = ''
                answer_key_file_name = ''
                    
                if assessment.type == 'quiz':
                    assessment_file_name = 'quiz'
                    answer_key_file_name = 'quiz_answer-key'
                
                elif assessment.type == 'exam':
                    assessment_file_name = 'exam'
                    answer_key_file_name = 'exam_answer-key'
                
                assessment_file_path = rf'{settings.MEDIA_ROOT}\{username}\exports\{assessment.name}_{assessment_file_name}.{file_format}'
                answer_key_file_path = rf'{settings.MEDIA_ROOT}\{username}\exports\{assessment.name}_{answer_key_file_name}.{file_format}'
                        
                zip_object.write(assessment_file_path, os.path.basename(assessment_file_path))
                zip_object.write(answer_key_file_path, os.path.basename(answer_key_file_path))
        
        elif file_format == 'word':
            file_path = rf"{username}\exports\{assessment.name}_{assessment.type}.docx"
        else:
            file_path = rf"{username}\exports\{assessment.name}_{assessment.type}-gift.txt"
                        
        return download_file(request, file_path)