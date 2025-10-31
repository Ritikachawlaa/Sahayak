from django.urls import path
# Add the new views to this import line
from .views import (
    recommend_internships, 
    signup_user, 
    login_user, 
    get_dashboard_stats,
    get_saved_internships,
    save_internship,
    unsave_internship,
    upload_resume
)

urlpatterns = [
    path('recommend/', recommend_internships, name='recommend_internships'),
    path('signup/', signup_user, name='signup_user'),
    path('login/', login_user, name='login_user'),
    path('stats/', get_dashboard_stats, name='get_dashboard_stats'),
    path('upload-resume/<int:user_id>/', upload_resume, name='upload_resume'),
    # These paths will now work correctly
    path('saved/', get_saved_internships, name='get_saved_internships'),
    path('saved/save/', save_internship, name='save_internship'),
    path('saved/unsave/<str:internship_id>/', unsave_internship, name='unsave_internship'),
]