from core.models import Room
from core.serializers import BaseModelSerializer


class RoomSerializer(BaseModelSerializer):
    class Meta(BaseModelSerializer.Meta):
        model = Room
        fields = BaseModelSerializer.Meta.fields + ["id", "name", "capacity"]
