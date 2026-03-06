from django.db.models.enums import TextChoices


class Status(TextChoices):
    ACTIVE = "active", "Active"
    CANCELED = "canceled", "Canceled"


class OutboxEventType(TextChoices):
    BOOKING_CREATED = "BOOKING_CREATED", "Booking Created"
    BOOKING_UPDATED = "BOOKING_UPDATED", "Booking Updated"
    BOOKING_CANCELED = "BOOKING_CANCELED", "Booking Canceled"
