from .base import *

DEBUG = True
SECRET_KEY = 'dev-secret-key-12345'  # 仅开发使用

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# 开发环境允许所有跨域
CORS_ALLOW_ALL_ORIGINS = True

# 开发环境使用控制台输出日志
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

AUTH_PASSWORD_VALIDATORS = [
    # 注释掉 CommonPasswordValidator
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 6,  # 降低最小长度要求
        }
    },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    # },
]