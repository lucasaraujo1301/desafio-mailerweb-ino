from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import AuthUser, TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import Token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["email", "password", "name"]
        extra_kwargs = {"password": {"write_only": True, "min_length": 5}}

    def create(self, validated_data):
        """
        The create function is used to create a new user.
        It takes the validated data and creates a new user object using the create_user function from Django's built-in
         User model.
        The **validated_data argument unpacks all the key/value pairs in validated_data into keyword arguments for
         create_user.

        :param self: Refer to the current instance of the class
        :param validated_data: Pass the data that has been validated by the serializer
        :return: A user object
        :doc-author: Trelent
        """
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """
        The update function is used to update an existing user.
        It takes in the instance of the user that we want to update, and a dictionary containing all of the fields that
         we want to change.
        The validated_data argument contains all of our data after it has been validated by our serializer's
         validation functions.

        :param self: Represent the instance of the object
        :param instance: Pass in the existing user object that is being updated
        :param validated_data: Update the user object
        :return: The user object
        :doc-author: Trelent
        """
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: AuthUser) -> Token:
        """
        The get_token function is used to create a JWT token for the user.
        The default implementation of this function uses the TokenObtainPairSerializer class to generate a token.
        This method can be overridden if you need more control over how tokens are generated.

        :param cls: Pass the class that is calling this function
        :param user: AuthUser: Pass the user object to the get_token function
        :return: A token that has the user's email and name
        :doc-author: Trelent
        """
        token = super().get_token(user)

        token["user_email"] = user.email
        token["user_name"] = user.name

        return token

    def validate(self, attrs):
        """
        The validate function is called when the serializer is being validated.
        It receives a dictionary of field values that have been validated and deserialized,
        and it can raise a ValidationError if any validation fails. The validate function
        is also passed the instance of the object being updated or created (if available).

        :param self: Refer to the current instance of a class
        :param attrs: Pass the validated data to the serializer
        :return: A dictionary of validated data
        :doc-author: Trelent
        """
        data = super().validate(attrs)

        # Add custom user information to the response data
        user = self.user
        data["user_name"] = user.name
        data["user_email"] = user.email

        return data
