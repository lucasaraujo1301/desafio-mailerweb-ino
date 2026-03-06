FROM python:3.12-alpine

LABEL maintainer="Lucas Medeiros"

# ---- Python settings ----
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# ---- System dependencies ----
RUN apk add --no-cache \
        postgresql-client \
        curl \
    && apk add --no-cache --virtual .build-deps \
        build-base \
        postgresql-dev \
        musl-dev

# ---- Install uv ----
RUN pip install --no-cache-dir uv

# ---- Copy dependency files first (better caching) ----
COPY pyproject.toml uv.lock ./

# ---- Install Python dependencies ----
ARG DEV=false
RUN if [ "$DEV" = "true" ]; then \
        uv sync --frozen; \
    else \
        uv sync --frozen --no-dev; \
    fi

# ---- Remove build dependencies ----
RUN apk del .build-deps

# ---- Copy project source ----
COPY . /app

# ---- Create non-root user ----
RUN adduser -D -H django-user

USER django-user

EXPOSE 8000
