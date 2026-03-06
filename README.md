# 📅 Sistema de Reserva de Salas

Sistema fullstack para gerenciamento de reservas de salas com notificações assíncronas por e-mail.

## 🗂 Estrutura do Projeto

```
/
├── backend/        # API Django + Celery
├── frontend/       # Next.js
└── docker-compose.yml
```

---

## ⚙️ Pré-requisitos

- [Docker](https://www.docker.com/) 24+
- [Docker Compose](https://docs.docker.com/compose/) 2.20+

---

## 🚀 Rodando o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/lucasaraujo1301/desafio-mailerweb-ino.git
cd desafio-mailerweb-ino
```

### 2. Configure as variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

Edite os arquivos com os valores adequados (veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente)).

### 3. Suba todos os serviços

```bash
docker-compose up
```

> Adicione `-d` para rodar em background: `docker-compose up -d`

---

## 🔧 Serviços disponíveis

| Serviço       | URL                   | Descrição                     |
|---------------|-----------------------|-------------------------------|
| Backend (API) | http://localhost:8000 | Django REST Framework         |
| Frontend      | http://localhost:3000 | Next.js (hot-reload)          |
| MailHog       | http://localhost:8025 | Visualizador de e-mails (dev) |
| PostgreSQL    | localhost:5432        | Banco de dados                |
| Redis         | localhost:6379        | Broker de mensagens           |

---

## 🖥 Backend

O backend sobe automaticamente com o `docker-compose up`. Ele executa na ordem:

1. Aguarda o banco de dados estar pronto (`wait_for_db`)
2. Roda as migrations (`migrate`)
3. Inicia o servidor (`runserver`)

Para rodar **apenas** o backend:

```bash
docker-compose up app db redis
```

Para acessar o container:

```bash
docker-compose exec app sh
```

Para criar um superusuário:

```bash
docker-compose exec app python manage.py createsuperuser
```

---

## 🌐 Frontend

O frontend roda em modo de desenvolvimento com hot-reload automático via volume mount.

Para rodar **apenas** o frontend:

```bash
docker-compose up frontend
```

Para acessar o container:

```bash
docker-compose exec frontend sh
```

Para rodar os testes:

```bash
docker-compose exec frontend npm test
```

---

## ⚙️ Workers (Celery)

O projeto possui dois workers Celery:

- **`celery_worker`** — processa tarefas assíncronas (ex: envio de e-mails)
- **`celery_beat`** — agendador de tarefas periódicas

Eles sobem automaticamente com `docker-compose up`. Para rodar apenas os workers:

```bash
docker-compose up celery_worker celery_beat redis
```

Para verificar os logs do worker:

```bash
docker-compose logs -f celery_worker
```

---

## 🌍 Variáveis de Ambiente

### `backend/.env`

| Variável     | Exemplo                | Descrição                    |
|--------------|------------------------|------------------------------|
| `DB_HOST`    | `db`                   | Host do banco de dados       |
| `DB_NAME`    | `devdb`                | Nome do banco de dados       |
| `DB_USER`    | `devuser`              | Usuário do banco de dados    |
| `DB_PASS`    | `changeme`             | Senha do banco de dados      |
| `BROKER_URL` | `redis://redis:6379/0` | URL do broker Redis (Celery) |
| `EMAIL_HOST` | `mailhog`              | Host do servidor de e-mail   |
| `EMAIL_PORT` | `1025`                 | Porta do servidor de e-mail  |

```env
DB_HOST=db
DB_NAME=devdb
DB_USER=devuser
DB_PASS=changeme
BROKER_URL=redis://redis:6379/0
EMAIL_HOST=mailhog
EMAIL_PORT=1025
```

### `frontend/.env.local`

| Variável              | Exemplo           | Descrição               |
|-----------------------|-------------------|-------------------------|
| `NEXT_PUBLIC_API_URL` | `http://app:8000` | URL base da API backend |

```env
NEXT_PUBLIC_API_URL=http://app:8000
```

> As variáveis do PostgreSQL (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) são usadas apenas internamente pelo serviço `db` no `docker-compose.yml` e não precisam ser definidas em nenhum `.env` das aplicações.

---

## 🛑 Parando os serviços

```bash
# Para e mantém os volumes
docker-compose down

# Para e remove os volumes (apaga o banco de dados)
docker-compose down -v
```

---

## 📋 Comandos úteis

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f app

# Rebuildar um serviço após mudanças
docker-compose up --build frontend

# Rodar migrations manualmente
docker-compose exec app python manage.py migrate

# Acessar o banco de dados
docker-compose exec db psql -U devuser -d devdb
```

🧠 Decisões Técnicas

Esta seção documenta as principais decisões de arquitetura e tecnologia do projeto, com o contexto e a motivação por trás de cada escolha.

Backend

- Uso do `uv` como gerenciamento de pacotes do python, por ser mais rápido que o `pip`
- Uso do `ruff` como lint para manter um padrão no projeto
- Django + DRF — escolhido pela facilidade e velocidade de desenvolvimento de APIs REST.
- PostgreSQL — banco de dados principal, aproveitando recursos avançados como constraints e extensões nativas.
- Celery + Redis — Celery como worker e Redis como broker para processamento assíncrono de mensagens.
- Celery Beat — agendador de tarefas periódicas. A task process_outbox_events roda a cada 1 minuto para processar o envio assíncrono de e-mails.
- Pytest — utilizado para os testes unitários do backend.
- Constraints no nível do banco de dados — garantia de integridade além da camada de aplicação:
  - Reservation — uso da extensão BtreeGistExtension do PostgreSQL para resolver o problema de overlap entre reservas, adicionando suporte a índices GiST para tipos como timestamp. 
  - Room — constraint que impede a criação de salas com capacidade menor que 1.

Frontend

- Next.js 14 com App Router — layouts aninhados e separação clara entre rotas públicas (auth) e autenticadas (dashboard).
- Axios com instância centralizada — token JWT injetado via request interceptor e redirecionamento automático para /login em 401 via response interceptor.
- JWT em cookie via js-cookie — flag secure ativado apenas em produção para não bloquear o cookie em localhost HTTP.
- React Hook Form + Zod — validação de formulários sem re-renders desnecessários, com o schema como única fonte de verdade para validação e tipos TypeScript.
- Context + hooks locais — sem Redux ou Zustand. O AuthContext gerencia a sessão e useRooms/useReservations o estado local de cada página.
- PaginatedResponse<T> genérico — tipo reutilizável para tratar a paginação do backend ({ count, next, previous, results }) de forma consistente em todos os serviços.
- Jest + Testing Library — testes orientados ao comportamento do usuário. axios-mock-adapter mocka a camada HTTP sem precisar subir um servidor real.
- Multi-stage Dockerfile — stages deps → builder → runner para imagem de produção enxuta, e stage dev com next dev e hot-reload via volume mount.

---

Infraestrutura

- Docker + Docker Compose - Escolhido por ser uma configuração mais facilitada, sem a necessidade de ter todas as tecnologias instaladas localmente. 
