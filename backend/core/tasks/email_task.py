from datetime import datetime

from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


@shared_task(bind=True, queue="emails", max_retries=3, default_retry_delay=60)
def send_reservation_email_task(
    self, to_emails: list[str], title: str, room_name: str, start_datetime: datetime, end_datetime, event_type: str
):
    try:
        context = {
            "title": title,
            "room": room_name,
            "event_type": event_type,
            "date": start_datetime.strftime("%d/%m/%Y"),
            "start_time": start_datetime.strftime("%H:%M"),
            "end_time": end_datetime.strftime("%H:%M"),
        }

        html_content = render_to_string("emails/reservation/reservation.html", context)
        text_content = render_to_string("emails/reservation/reservation.txt", context)

        email = EmailMultiAlternatives(
            subject=f"Reserva {event_type}",
            body=text_content,
            to=to_emails,
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        return {
            "status": "success",
            "message": f"Email successfully sent to {to_emails} for reservation '{title}' ({event_type}).",
        }
    except Exception as e:
        self.retry(exc=e)
