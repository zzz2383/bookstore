from .base import *

DEBUG = True
SECRET_KEY = 'dev-secret-key-12345'  # 仅开发使用

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

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