# Default Django Project 🚀

A modern Django starter template for building APIs with JWT authentication, powered by **uv**, **Ruff**, and **python-dotenv**.

This template is designed to give you a fast, scalable, and quality-checked foundation for backend development — so you can spend more time building features and less time configuring tooling.

---

## 🧠 About

This project provides:
- A clean Django API layout
- JWT authentication support
- Custom User model
- Environment variable management using **python-dotenv**
- Fast dependency & environment management with **uv**
- Code linting & formatting with **Ruff**
- Docker + Docker Compose setup

It’s perfect as a **forkable starter project** for backend APIs.

---

## ⚙️ Features

✨ **Modern tooling**
- **uv** for blazing-fast dependency management and virtual environment handling :contentReference[oaicite:1]{index=1}
- **Ruff** for fast linting and formatting replacing legacy tools like Black and Flake8 :contentReference[oaicite:2]{index=2}
- **python-dotenv** for loading environment variables from a `.env` file

🧩 **Ready-to-develop**
- JWT support ready for API authentication
- Docker & Docker Compose included
- Clean and extensible project structure

🛡️ **Code quality**
- Pre-configured **Ruff** rules
- Configured pre-commit hooks for consistent code style

---

## 🧪 Prerequisites

Make sure you have installed:
- Docker & Docker Compose
- **uv** (optional if you want to use uv locally)
- Python 3.12+ (recommended)

You can install `uv` using their installer, package manager, or via your shell tools (see uv [docs](https://docs.astral.sh/uv/)).

---

## 🪶 Environment Variables

This project uses **python-dotenv** to manage environment variables.

Create a `.env` file from the example:
```bash
cp .env.example .env
```
Edit `.env` and configure as you need.

> ⚠️ Never commit your `.env` file. ⚠️
>
> Keep the .env inside .gitignore

## 🚀 Development Setup

### 1️⃣ Install dependencies (using uv)

```bash
uv sync
```

This will create the virtual environment and install all dependencies defined in `pyproject.toml`.

---

### 2️⃣ Run with Docker

```bash
docker compose up --build
```

This will:
- Build the Docker image
- Start the database
- Wait for the DB
- Apply migrations
- Run the development server

Application will be available at:

```
http://localhost:8000
```

---

### 3️⃣ Apply migrations manually (if needed)

```bash
docker compose exec app python manage.py migrate
```

---

### 4️⃣ Create a superuser

```bash
docker compose exec app python manage.py createsuperuser
```

---
## 🔎 Code Quality

This project uses **Ruff** for linting and formatting.

### Run linter

```bash
uv run ruff check .
```

### Auto-format code

```bash
uv run ruff format .
```

---

## 🛠️ Development Workflow

- Create new apps:

```bash
uv run python manage.py startapp <app_name>
```

- Update models
- Run migrations
- Implement API logic
- Keep code clean using Ruff

---

## 📦 Project Structure

```
├── app/                # Main Django project (settings, urls, wsgi/asgi)
├── core/               # Core reusable logic (models, utilities, custom commands)
├── user/               # user app (serializers, views and urls)
├── manage.py
├── pyproject.toml      # uv + Ruff configuration
├── uv.lock             # Locked dependencies
├── .env.example        # Environment template
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🤝 Contributing

Feel free to fork this template and adapt it to your needs.

Pull requests with improvements are welcome.

---
