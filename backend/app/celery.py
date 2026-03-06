import os

from celery import Celery
from kombu import Queue

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

app = Celery("config")

# Read settings from Django settings, using CELERY_ prefix
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

CELERY_TASK_QUEUES = (
    Queue("default"),
    Queue("emails"),
    Queue("notifications"),
)

CELERY_TASK_DEFAULT_QUEUE = "default"
