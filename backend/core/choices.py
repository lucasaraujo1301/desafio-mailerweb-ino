from django.db.models.enums import TextChoices


class Status(TextChoices):
    ACTIVE = "active", "Active"
    CANCELED = "canceled", "Canceled"
