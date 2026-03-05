from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.validators import MinValueValidator
from django.db import models


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
        # Constraints put the validation in SQL level, that's why it works with .create() and raise IntegrityError
        constraints = [
            models.CheckConstraint(
                condition=models.Q(capacity__gt=0),
                name="capacity_must_be_positive",
                violation_error_message="Capacity must be greater than zero.",
            )
        ]
