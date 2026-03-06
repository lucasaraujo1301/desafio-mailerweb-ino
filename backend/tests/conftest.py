import pytest

from .fixtures.api import *
from .fixtures.factories import *
from .fixtures.reservation import *
from .fixtures.room import *
from .fixtures.shared import *
from .fixtures.user import *


@pytest.fixture(autouse=True)
def celery_eager(settings):
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
