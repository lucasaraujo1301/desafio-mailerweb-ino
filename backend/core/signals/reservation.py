from django.core.exceptions import ValidationError
from django.db.models.signals import m2m_changed, post_save
from django.dispatch import receiver

from core.choices import Status
from core.enums import EventTypeEnum
from core.models import Reservation
from core.tasks import send_reservation_email_task


@receiver(m2m_changed, sender=Reservation.users.through)
def validate_room_capacity(sender, instance, action, pk_set, **kwargs):
    if action == "pre_add":
        total_users = instance.users.count() + len(pk_set)

        if total_users > instance.room.capacity:
            raise ValidationError(f"Room capacity is {instance.room.capacity}.")

        return

    if action == "post_add":
        # Get all emails after users added
        to_emails = list(instance.users.values_list("email", flat=True))
        if not to_emails:
            return

        # If instance was just created, treat as "criada"
        if getattr(instance, "_just_created", False):
            event_type = EventTypeEnum.CREATED
            del instance._just_created  # remove the flag
        else:
            event_type = EventTypeEnum.UPDATED

        send_reservation_email_task.delay(
            to_emails=to_emails,
            title=instance.title,
            room_name=instance.room.name,
            start_datetime=instance.start_datetime,
            end_datetime=instance.end_datetime,
            event_type=event_type,
        )
        return


@receiver(post_save, sender=Reservation)
def reservation_saved(sender, instance, created, **kwargs):
    if created:
        # Mark instance as just created so m2m can detect first users
        instance._just_created = True
    elif instance.status == Status.CANCELED:
        # Send cancel email even if users already exist
        to_emails = list(instance.users.values_list("email", flat=True))
        if to_emails:
            send_reservation_email_task.delay(
                to_emails=to_emails,
                title=instance.title,
                room_name=instance.room.name,
                start_datetime=instance.start_datetime,
                end_datetime=instance.end_datetime,
                event_type=EventTypeEnum.CANCELED,
            )
