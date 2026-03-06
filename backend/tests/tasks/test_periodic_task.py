from datetime import datetime, timezone
from unittest.mock import patch

import pytest

from core.choices import OutboxEventType
from core.models import OutboxEvent
from core.tasks.periodic_task import MAX_RETRIES, process_outbox_events


@pytest.mark.django_db
class TestProcessOutboxEvents:
    @pytest.fixture(autouse=True)
    def mock_send_email(self):
        with patch("core.tasks.periodic_task.send_reservation_email_task") as mocked:
            yield mocked

    @pytest.fixture
    def pending_event(self):
        return OutboxEvent.objects.create(
            event_type=OutboxEventType.BOOKING_CREATED,
            payload={
                "to_emails": ["test@example.com"],
                "title": "Test Reservation",
                "room_name": "Room 101",
                "start_datetime": "2026-03-05T14:00:00",
                "end_datetime": "2026-03-05T15:00:00",
                "event_type": "BOOKING_CREATED",
            },
        )

    def test_processes_pending_event(self, mock_send_email, pending_event):
        process_outbox_events()

        mock_send_email.assert_called_once_with(
            to_emails=["test@example.com"],
            title="Test Reservation",
            room_name="Room 101",
            start_datetime=datetime(2026, 3, 5, 14, 0),
            end_datetime=datetime(2026, 3, 5, 15, 0),
            event_type="BOOKING_CREATED",
        )

        pending_event.refresh_from_db()
        assert pending_event.processed_at is not None

    def test_skips_already_processed_event(self, mock_send_email, pending_event):
        pending_event.processed_at = datetime.now(tz=timezone.utc)
        pending_event.save()

        process_outbox_events()

        mock_send_email.assert_not_called()

    def test_skips_event_with_max_retries(self, mock_send_email, pending_event):
        pending_event.retries = MAX_RETRIES
        pending_event.save()

        process_outbox_events()

        mock_send_email.assert_not_called()

    def test_increments_retries_on_failure(self, mock_send_email, pending_event):
        mock_send_email.side_effect = Exception("SMTP error")

        process_outbox_events()

        pending_event.refresh_from_db()
        assert pending_event.retries == 1
        assert pending_event.processed_at is None

    def test_stops_retrying_after_max_retries(self, mock_send_email, pending_event):
        mock_send_email.side_effect = Exception("SMTP error")

        for _ in range(MAX_RETRIES):
            process_outbox_events()

        pending_event.refresh_from_db()
        assert pending_event.retries == MAX_RETRIES
        assert pending_event.processed_at is None

        mock_send_email.reset_mock()
        process_outbox_events()
        mock_send_email.assert_not_called()

    def test_processes_multiple_pending_events(self, mock_send_email):
        OutboxEvent.objects.create(
            event_type=OutboxEventType.BOOKING_CREATED,
            payload={
                "to_emails": ["a@example.com"],
                "title": "Reservation A",
                "room_name": "Room 1",
                "start_datetime": "2026-03-05T14:00:00",
                "end_datetime": "2026-03-05T15:00:00",
                "event_type": "BOOKING_CREATED",
            },
        )
        OutboxEvent.objects.create(
            event_type=OutboxEventType.BOOKING_UPDATED,
            payload={
                "to_emails": ["b@example.com"],
                "title": "Reservation B",
                "room_name": "Room 2",
                "start_datetime": "2026-03-05T16:00:00",
                "end_datetime": "2026-03-05T17:00:00",
                "event_type": "BOOKING_UPDATED",
            },
        )

        process_outbox_events()

        assert mock_send_email.call_count == 2
        assert OutboxEvent.objects.filter(processed_at__isnull=False).count() == 2
