import pytest
from freezegun import freeze_time


@pytest.fixture
def frozen_time():
    with freeze_time("2026-03-05 10:00:00"):
        yield
