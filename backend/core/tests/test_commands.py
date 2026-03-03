from unittest.mock import patch

from django.core.management import call_command
from django.db.utils import OperationalError
from django.test import SimpleTestCase
from psycopg2 import OperationalError as Psycopg2OpError


@patch("core.management.commands.wait_for_db.Command.check")
class TestCommands(SimpleTestCase):
    def test_wait_for_db_ready(self, patched_check):
        """
        The test_wait_for_db_ready function is a test case that checks whether the wait_for_db command works as
        expected.
        It does so by patching django.db.utils.ConnectionHandler._check_conn() and setting its return value to True,
        which simulates a successful database connection check.

        :param self: Access the instance of the class
        :param patched_check: Patch the check function
        :return: True
        :doc-author: Trelent
        """
        patched_check.return_value = True

        call_command("wait_for_db")

        patched_check.assert_called_once_with(databases=["default"])

    @patch("time.sleep")
    def test_wait_for_db_delay(self, patched_sleep, patched_check):
        """
        The test_wait_for_db_delay function tests the wait_for_db command.
        It does this by patching the sleep function and check database functions,
        and then calling the wait_for_db command. It asserts that:
            - The patched check function was called 6 times (5 times for errors + 1 time for success)
            - The patched check function was called with 'default' as an argument

        :param self: Access the class instance
        :param patched_sleep: Mock the sleep function
        :param patched_check: Mock the check function
        :return: The number of times patched_check was called
        :doc-author: Trelent
        """
        patched_check.side_effect = [Psycopg2OpError] * 2 + [OperationalError] * 3 + [True]

        call_command("wait_for_db")

        self.assertEqual(patched_check.call_count, 6)
        patched_check.assert_called_with(databases=["default"])
