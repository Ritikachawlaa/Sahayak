import json
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .recommendation_engine import InternshipRecommender
from .models import User, SavedInternship
import math
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# --- NOTE: We no longer import from skill_gap_analyzer.py ---

# Initialize the self-contained Recommendation Engine
recommender = InternshipRecommender()

# --- User Authentication and Profile Views ---

@csrf_exempt
def signup_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'User with this email already exists.'}, status=400)

        # In a real application, always hash the password!
        user = User.objects.create(name=name, email=email, password=password)
        
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'isOnboarded': False,
            'resume': None
        }
        return JsonResponse(user_data, status=201)
    return JsonResponse({'error': 'Only POST requests are accepted'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            if user.password == password:
                 user_data = {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'isOnboarded': True, # This should ideally be based on user data
                    'resume': user.resume.url if user.resume else None
                }
                 return JsonResponse(user_data, status=200)
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Only POST requests are accepted'}, status=405)

@csrf_exempt
def upload_resume(request, user_id):
    if request.method == 'POST':
        try:
            user = User.objects.get(pk=user_id)
            resume_file = request.FILES.get('resumeFile')

            if not resume_file:
                return JsonResponse({'error': 'No file provided.'}, status=400)

            user.resume = resume_file
            user.save()

            return JsonResponse({'message': 'Resume uploaded successfully.', 'filePath': user.resume.url})

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Only POST requests are accepted'}, status=405)


# --- Internship and Recommendation Views ---

@csrf_exempt
def recommend_internships(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are accepted'}, status=405)
    
    if recommender.internships_df is None:
        return JsonResponse({'error': 'Internship data not loaded on server.'}, status=500)
    
    try:
        profile = json.loads(request.body)
        
        # Simplified Logic: The engine now does all the work.
        recommendations_df = recommender.recommend(profile)
        
        recommendations = recommendations_df.to_dict('records')

        return JsonResponse(recommendations, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def get_dashboard_stats(request):
    if recommender.internships_df is None:
        return JsonResponse({'error': 'Internship data not available'}, status=500)

    try:
        df = recommender.internships_df
        
        total_internships = len(df)
        unique_cities = df['location'].nunique()
        paid_opportunities = df[df['type'] == 'paid'].shape[0]
        
        df['duration_months'] = df['duration'].str.extract(r'(\d+)').astype(float)
        avg_duration = df['duration_months'].mean()
        avg_duration = math.ceil(avg_duration) if not pd.isna(avg_duration) else 0

        stats = {
            'totalInternships': total_internships,
            'uniqueCities': unique_cities,
            'paidOpportunities': paid_opportunities,
            'avgDuration': f"{avg_duration} months"
        }
        return JsonResponse(stats)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# --- Saved Internship Views ---
@api_view(['GET'])
def get_saved_internships(request):
    user = request.user
    if user.is_anonymous:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    saved_internships = SavedInternship.objects.filter(user=user)
    saved_ids = [item.internship_id for item in saved_internships]
    return Response(saved_ids)

@api_view(['POST'])
def save_internship(request):
    user = request.user
    if user.is_anonymous:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
    internship_id = request.data.get('internship_id')
    if not internship_id:
        return Response({'error': 'Internship ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    saved_internship, created = SavedInternship.objects.get_or_create(user=user, internship_id=internship_id)

    if created:
        return Response({'message': 'Internship saved successfully'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'message': 'Internship already saved'}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def unsave_internship(request, internship_id):
    user = request.user
    if user.is_anonymous:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        saved_internship = SavedInternship.objects.get(user=user, internship_id=internship_id)
        saved_internship.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except SavedInternship.DoesNotExist:
        return Response({'error': 'Saved internship not found'}, status=status.HTTP_404_NOT_FOUND)

