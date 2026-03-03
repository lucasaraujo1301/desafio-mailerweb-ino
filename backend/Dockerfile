FROM python:3.12-alpine
LABEL maintainer="Lucas Medeiros"

ENV PYTHONUNBUFFERED 1

COPY pyproject.toml ./uv.lock /app/
WORKDIR /app
EXPOSE 8000

RUN apk add --update --no-cache postgresql-client curl && \
    apk add --update --no-cache --virtual .build-deps \
     build-base postgresql-dev musl-dev

ARG DEV=false
RUN if [ "$DEV" = "true" ]; then \
        uv sync --frozen; \
    else \
        uv sync --frozen --no-dev; \
    fi && \
    apk del .tmp-build-deps && \
    adduser \
        --disabled-password \
        --no-create-home \
        django-user

# ---- Activate virtual environment automatically ----
ENV PATH="/app/.venv/bin:$PATH"

USER django-user
