import logging

from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import UserProfile
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer,
    UserSerializer, ChangePasswordSerializer, UserProfileSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """用户注册视图"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # 创建用户资料
        UserProfile.objects.create(user=user)

        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)

        logger.info(f"新用户注册: {user.email}")

        return Response({
            "message": "注册成功",
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """用户登录视图"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        # 认证用户
        user = authenticate(request, email=email, password=password)

        if user is None:
            logger.warning(f"登录失败: {email}")
            return Response(
                {"detail": "邮箱或密码错误"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"detail": "账户已被禁用"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 更新最后登录时间
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        # 生成JWT令牌
        refresh = RefreshToken.for_user(user)

        logger.info(f"用户登录成功: {user.email}")

        return Response({
            "message": "登录成功",
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        })


class UserLogoutView(APIView):
    """用户登出视图"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # 将令牌加入黑名单
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            logger.info(f"用户登出: {request.user.email}")
            return Response({"message": "登出成功"})
        except Exception as e:
            logger.error(f"登出异常: {str(e)}")
            return Response(
                {"detail": "登出失败"},
                status=status.HTTP_400_BAD_REQUEST
            )


class CustomTokenRefreshView(TokenRefreshView):
    """自定义令牌刷新视图"""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            logger.info("令牌刷新成功")
        return response


class UserDetailView(generics.RetrieveUpdateAPIView):
    """用户详情视图"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # 部分更新
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # 处理头像上传
        if 'avatar' in request.FILES:
            instance.avatar = request.FILES['avatar']

        self.perform_update(serializer)

        logger.info(f"用户资料更新: {instance.email}")

        return Response(serializer.data)


class ChangePasswordView(generics.UpdateAPIView):
    """修改密码视图"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 更新密码
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        logger.info(f"用户修改密码: {user.email}")

        return Response({"message": "密码修改成功"})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """用户资料视图"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        logger.info(f"用户扩展资料更新: {request.user.email}")

        return Response(serializer.data)