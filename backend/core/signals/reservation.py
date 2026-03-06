from django.core.exceptions import ValidationError
from django.db.models.signals import m2m_changed
from django.dispatch import receiver

from core.models import Reservation


@receiver(m2m_changed, sender=Reservation.users.through)
def validate_room_capacity(sender, instance, action, pk_set, **kwargs):
    if action == "pre_add":
        total_users = instance.users.count() + len(pk_set)

        if total_users > instance.room.capacity:
            raise ValidationError(f"Room capacity is {instance.room.capacity}.")

        return
