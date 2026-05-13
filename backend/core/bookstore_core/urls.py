from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

def health_check(request):
    return JsonResponse({"status": "OK", "service": "Django Core"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
]