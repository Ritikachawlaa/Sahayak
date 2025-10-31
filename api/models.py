from django.db import models
from django.conf import settings

# Create your models here.
class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100) # In production, always use hashed passwords!
    
    # --- THIS FIELD HAS BEEN ADDED ---
    # This will store the path to the user's uploaded resume file.
    # `upload_to='resumes/'` tells Django to save these files in a 'media/resumes/' directory.
    # `null=True, blank=True` makes this field optional, so existing users don't break.
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)

    def __str__(self):
        return self.email
    
class SavedInternship(models.Model):
    # --- IMPORTANT: Corrected the ForeignKey to reference your custom User model ---
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    internship_id = models.CharField(max_length=255) # Assuming internship ID is a string

    class Meta:
        unique_together = ('user', 'internship_id') # Prevents duplicate saves

    def __str__(self):
        return f"{self.user.email} saved internship {self.internship_id}"
