import pytest

from room.serializers import RoomSerializer


@pytest.mark.django_db
class TestRoomSerializer:
    serializer_class = RoomSerializer

    def test_room_serializer_validation(self):
        invalid_data = {"name": "Suite 101", "capacity": 0}

        serializer = self.serializer_class(data=invalid_data)
        assert serializer.is_valid() is False

        assert "capacity" in serializer.errors
        assert "Ensure this value is greater than or equal to 1." == str(serializer.errors["capacity"][0])

    def test_room_serializer_validation_success(self):
        invalid_data = {"name": "Suite 101", "capacity": 2}

        serializer = self.serializer_class(data=invalid_data)
        assert serializer.is_valid()
