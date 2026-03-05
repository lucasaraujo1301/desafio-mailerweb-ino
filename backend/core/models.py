from datetime import timedelta

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.postgres.constraints import ExclusionConstraint
from django.contrib.postgres.fields import RangeOperators
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Func

from core.choices import Status


class BaseModel(models.Model):
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.is_active = False
        self.save()


class UserManager(BaseUserManager):
    def create_user(self, email: str, password: str = None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided.")
        if not isinstance(email, str):
            raise TypeError("Email must be an string.")

        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email: str, password: str):
        return self.create_user(email, password, is_staff=True, is_superuser=True)


class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"

    def is_admin(self):
        return self.is_staff and self.is_superuser


class Room(BaseModel):
    name = models.CharField(max_length=100, null=False, blank=False, unique=True)
    capacity = models.PositiveIntegerField(null=False, blank=False, default=5, validators=[MinValueValidator(1)])

    class Meta:
        # Constraints put the validation in SQL level, with this works with .create() and raise IntegrityError
        constraints = [
            models.CheckConstraint(
                condition=models.Q(capacity__gt=0),
                name="capacity_must_be_positive",
                violation_error_message="Capacity must be greater than zero.",
            )
        ]


class Reservation(BaseModel):
    title = models.CharField(max_length=100, null=False, blank=False)
    start_datetime = models.DateTimeField(null=False, blank=False)
    end_datetime = models.DateTimeField(null=False, blank=False)
    status = models.CharField(choices=Status, default=Status.ACTIVE.value)

    # Relations
    room = models.ForeignKey(Room, null=False, blank=False, on_delete=models.CASCADE, related_name="reservations")
    users = models.ManyToManyField(User, related_name="reservations")

    class Meta:
        # Adding constraints to force the rule in the database.
        constraints = [
            ExclusionConstraint(
                name="prevent_room_overlap",
                violation_error_message="Already have an reservation for that room between these time.",
                expressions=[
                    (
                        Func(
                            F("start_datetime"),
                            F("end_datetime"),
                            function="tstzrange",
                        ),
                        RangeOperators.OVERLAPS,
                    ),
                    ("room", RangeOperators.EQUAL),
                ],
            ),
        ]

    def clean(self):
        if self.start_datetime >= self.end_datetime:
            raise ValidationError({"end_datetime": "End datetime must be after start datetime."})

        duration = self.end_datetime - self.start_datetime

        if duration < timedelta(minutes=15):
            raise ValidationError("Reservation must be at least 15 minutes.")

        if duration > timedelta(hours=8):
            raise ValidationError("Reservation cannot exceed 8 hours.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        self.is_active = False
        self.status = Status.CANCELED
        self.save()
