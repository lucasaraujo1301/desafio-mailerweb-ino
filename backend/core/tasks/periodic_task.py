from datetime import datetime, timezone

from celery import shared_task
from django.db import transaction

from core.models import OutboxEvent
from core.tasks.email_task import send_reservation_email_task

MAX_RETRIES = 3


@shared_task
def process_outbox_events():
    with transaction.atomic():
        pending_events = OutboxEvent.objects.select_for_update(skip_locked=True).filter(
            processed_at__isnull=True,
            retries__lt=MAX_RETRIES,
        )
        print(f"{pending_events = }")
        for event in pending_events:
            try:
                result = send_reservation_email_task(
                    to_emails=event.payload["to_emails"],
                    title=event.payload["title"],
                    room_name=event.payload["room_name"],
                    start_datetime=datetime.fromisoformat(event.payload["start_datetime"]),
                    end_datetime=datetime.fromisoformat(event.payload["end_datetime"]),
                    event_type=event.payload["event_type"],
                )
                print(f"{result = }")
                event.processed_at = datetime.now(tz=timezone.utc)
                event.save(update_fields=["processed_at"])
            except Exception:
                event.retries += 1
                event.save(update_fields=["retries"])
