from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

CREATE_USER_URL = reverse("user:create")
TOKEN_URL = reverse("user:token")
ME_URL = reverse("user:me")


def create_user(**params):
    """
    The create_user function creates a user with the given username, email and password.


    :param **params: Pass in a dictionary of parameters to the create_user function
    :return: A user object
    :doc-author: Trelent
    """
    return get_user_model().objects.create_user(**params)


class PublicUserApiTests(TestCase):
    def setUp(self):
        """
        The setUp function is a special function that gets run before each test.
        It's used to set up any state specific to the execution of the given test case.
        In this case, we're using it to create an APIClient instance, which will be used for making API requests.

        :param self: Represent the instance of the class
        :return: The client
        :doc-author: Trelent
        """
        self.client = APIClient()

    def test_create_user_success(self):
        """
        The test_create_user_success function tests that the create user API endpoint works as expected.
        It does this by making a POST request to the CREATE_USER_URL, passing in a payload containing valid data.
        The test then asserts that we get back a 201 response (indicating success), and that the user was created
         correctly.

        :param self: Refer to the class instance
        :return: A 201 status code,
        :doc-author: Trelent
        """
        payload = {
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test Name",
        }

        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        user = get_user_model().objects.get(email=payload["email"])
        self.assertIsNotNone(user)
        self.assertTrue(user.check_password(payload["password"]))
        self.assertNotIn("password", res.data)

    def test_user_with_email_exists_error(self):
        """
        The test_user_with_email_exists_error function tests that the create user API endpoint
        returns a 400 bad request status code if the email already exists in the database.
        It also checks that an error message is returned and that it contains &quot;Email already exist.

        :param self: Access the instance of the class
        :return: The status code of 400,
        :doc-author: Trelent
        """
        payload = {
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test Name",
        }

        create_user(**payload)
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data)
        self.assertIn("user with this email already exists.", res.data["email"])

    def test_password_too_short_error(self):
        """
        The test_password_too_short_error function tests that the user creation endpoint returns a 400 bad request error
         if the password is too short.
        It also asserts that an error message is returned and that no user was created.

        :param self: Access the instance of the class
        :return: A 400 status code and a message that the password is too short
        :doc-author: Trelent
        """
        payload = {"email": "test@example.com", "password": "pw", "name": "Test Name"}
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data)
        self.assertIn("Ensure this field has at least 5 characters.", res.data["password"])

        user_exists = get_user_model().objects.filter(email=payload["email"]).exists()
        self.assertFalse(user_exists)

    def test_get_user_jwt_token(self):
        """
        The test_get_user_jwt_token function tests the following:
            1. It creates a user with valid credentials (name, email, password)
            2. It then sends a POST request to the token endpoint with those same credentials as payload data
            3. The response should contain an access and refresh token for that user

        :param self: Access the instance of the class
        :return: The access and refresh tokens, the user's email, name and id
        :doc-author: Trelent
        """
        user_details = {
            "name": "Test Name",
            "email": "test@example.com",
            "password": "test123",
        }
        create_user(**user_details)

        payload = {
            "email": user_details["email"],
            "password": user_details["password"],
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(user_details["email"], res.data["user_email"])
        self.assertEqual(user_details["name"], res.data["user_name"])

    def test_get_user_jwt_token_with_wrong_credentials(self):
        """
        The test_get_user_jwt_token_with_wrong_credentials function tests that a user cannot obtain a JWT token if they
         provide the wrong credentials.

        :param self: Represent the instance of the class
        :return: The http status code 401
        :doc-author: Trelent
        """
        user_details = {
            "name": "Test Name",
            "email": "test@example.com",
            "password": "test123",
        }
        create_user(**user_details)

        payload = {
            "email": user_details["email"],
            "password": "wrongpass",
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual("No active account found with the given credentials", res.data["detail"])

    def test_get_user_jwt_token_with_empty_password(self):
        """
        The test_get_user_jwt_token_with_empty_password function tests that the user cannot get a JWT token if they
         provide an empty password.

        :param self: Represent the instance of the class
        :return: A 400 status code
        :doc-author: Trelent
        """
        user_details = {
            "name": "Test Name",
            "email": "test@example.com",
            "password": "test123",
        }
        create_user(**user_details)

        payload = {
            "email": user_details["email"],
            "password": "",
        }
        res = self.client.post(TOKEN_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("This field may not be blank.", res.data["password"])

    def test_retrieve_user_unauthorized(self):
        """
        The test_retrieve_user_unauthorized function tests that authentication is required for users.
        The test:
        - Makes a GET request to the ME_URL endpoint (which requires authentication)
        - Asserts that the response status code is 401 unauthorized

        :param self: Represent the instance of the class
        :return: A 401 unauthorized status code
        :doc-author: Trelent
        """
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual("Authentication credentials were not provided.", res.data["detail"])


class PrivateUserApiTests(TestCase):
    def setUp(self):
        """
        The setUp function is run before each test.
        It creates a new user and authenticates the client with that user.

        :param self: Represent the instance of the object that is being created
        :return: The user and the client
        :doc-author: Trelent
        """
        self.user = create_user(email="test@example.com", password="testpass123", name="Test Name")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_retrieve_profile_success(self):
        """
        The test_retrieve_profile_success function tests that the profile is retrieved successfully.
        It does this by making a GET request to the ME_URL, which should return a 200 OK response with
        the user's name and email address in the body of the response.

        :param self: Represent the instance of the class
        :return: A 200 status code and a dictionary containing the name and email of the user
        :doc-author: Trelent
        """
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, {"name": self.user.name, "email": self.user.email})

    def test_post_me_not_allowed(self):
        """
        The test_post_me_not_allowed function tests that the POST method is not allowed on the me/ URL.
        The test_post_me_not_allowed function makes a POST request to the me/ URL and checks that it returns
         a 405 status code.

        :param self: Represent the instance of the class
        :return: A 405 status code
        :doc-author: Trelent
        """
        res = self.client.post(ME_URL, {})

        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_profile(self):
        """
        The test_update_user_profile function tests that the PATCH request to the /users/me endpoint
        updates a user's profile. The test first creates a payload dictionary with new values for name and password,
        then sends a PATCH request to the /users/me endpoint using this payload. It then refreshes our user object from
        the database and checks that its email, name, and password have been updated accordingly.

        :param self: Access the class attributes and methods
        :return: The user’s updated email, name, and password
        :doc-author: Trelent
        """
        payload = {"name": "Updated Name", "password": "newpassword123"}

        res = self.client.patch(ME_URL, payload)

        self.user.refresh_from_db()

        self.assertEqual(self.user.name, payload["name"])
        self.assertTrue(self.user.check_password(payload["password"]))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
