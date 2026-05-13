from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView,
    CustomTokenRefreshView, UserDetailView, ChangePasswordView,
    UserProfileView
)

urlpatterns = [
    # 认证相关
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # 用户相关
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('me/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('me/profile/', UserProfileView.as_view(), name='user_profile'),
]