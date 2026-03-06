from datetime import datetime
from unittest.mock import patch

import pytest

from core.enums import EventTypeEnum
from core.tasks import send_reservation_email_task


@pytest.mark.django_db
class TestEmailTask:
    @patch("django.core.mail.EmailMultiAlternatives.send")
    def test_send_email(self, mock_send, reservation, user):
        result = send_reservation_email_task(
            to_emails=[user],
            title=reservation.title,
            room_name=reservation.room.name,
            start_datetime=reservation.start_datetime,
            end_datetime=reservation.end_datetime,
            event_type=EventTypeEnum.CREATED,
        )

        mock_send.assert_called_once()

        message = (
            f"Email successfully sent to {[user]} for reservation '{reservation.title}' ({EventTypeEnum.CREATED})."
        )
        assert result == {
            "status": "success",
            "message": message,
        }

    @patch("django.core.mail.EmailMultiAlternatives.send")
    @patch("core.tasks.send_reservation_email_task.retry")
    def test_send_email_retry_3_times(self, mock_retry, mock_send):
        mock_send.side_effect = Exception("SMTP error")

        max_retries = 4
        attempts = {"count": 0}

        def fake_retry(exc, countdown=None):
            attempts["count"] += 1
            if attempts["count"] < max_retries:
                return send_reservation_email_task(
                    to_emails=["test@example.com"],
                    title="Test Reservation",
                    room_name="Room 101",
                    start_datetime=datetime(2026, 3, 5, 14, 0),
                    end_datetime=datetime(2026, 3, 5, 15, 0),
                    event_type=EventTypeEnum.CREATED,
                )
            else:
                raise exc

        mock_retry.side_effect = fake_retry

        with pytest.raises(Exception):
            send_reservation_email_task(
                to_emails=["test@example.com"],
                title="Test Reservation",
                room_name="Room 101",
                start_datetime=datetime(2026, 3, 5, 14, 0),
                end_datetime=datetime(2026, 3, 5, 15, 0),
                event_type=EventTypeEnum.CREATED,
            )

        assert mock_send.call_count == 4
        assert mock_retry.call_count == 4
