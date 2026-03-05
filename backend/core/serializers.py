from rest_framework import serializers


class BaseModelSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ["created_at", "updated_at", "is_active"]
