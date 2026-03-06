# RoomBook — Frontend

Sistema de gerenciamento de reservas de salas, construído com **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS** e **Axios**.

## Arquitetura

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/              # Login e Cadastro (sem sidebar)
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/         # Área autenticada
│       ├── rooms/
│       └── reservations/
├── components/
│   ├── ui/                  # Componentes base reutilizáveis
│   ├── layout/              # Sidebar, AuthGuard
│   ├── rooms/               # Componentes específicos de salas
│   └── reservations/        # Componentes de reservas
├── contexts/                # AuthContext (estado global de autenticação)
├── hooks/                   # useRooms, useReservations
├── services/                # Camada de serviços API
│   ├── api.ts               # Instância Axios (interceptors, token)
│   ├── authService.ts
│   ├── roomService.ts
│   └── reservationService.ts
├── lib/
│   └── utils.ts             # cn, formatters, extractApiError
├── types/
│   └── index.ts             # Todos os tipos TypeScript
└── __tests__/               # Testes unitários (Jest + RTL)
```

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente
cp .env.local.example .env.local
# Edite NEXT_PUBLIC_API_URL para apontar para o backend

# 3. Rodar em dev
npm run dev

# 4. Rodar testes
npm test

# 5. Ver cobertura
npm run test:coverage
```

## Variáveis de ambiente

| Variável              | Padrão                  | Descrição              |
|-----------------------|-------------------------|------------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL base do backend    |

## Rotas mapeadas

| Rota frontend     | Página                   |
|-------------------|--------------------------|
| `/login`          | Login                    |
| `/register`       | Cadastro                 |
| `/rooms`          | Lista de salas           |
| `/reservations`   | Lista de reservas        |

## Regras de negócio implementadas

- ✅ Apenas `is_staff=true` vê os botões de Criar / Editar / Excluir salas  
- ✅ Qualquer usuário autenticado pode criar uma reserva  
- ✅ O criador da reserva é adicionado automaticamente nos participantes  
- ✅ Botão de cancelar exibido para todos — ao cancelar, status vira `cancelled` para todos os participantes  
- ✅ Reserva pode ser criada diretamente pela tabela de salas (botão "Reservar")  
- ✅ Redirecionamento automático para `/login` em caso de 401  

## Testes

Cobertura dos testes unitários:

| Módulo                  | Tipo           |
|-------------------------|----------------|
| `services/api.ts`       | Token, headers |
| `services/authService`  | Login, register, logout, getProfile |
| `services/roomService`  | CRUD completo  |
| `services/reservationService` | CRUD + cancel |
| `lib/utils`             | Formatters, extractApiError, cn |
| `components/Button`     | Render, click, states |
| `components/Input`      | Render, error, onChange |
| `components/Badge`      | Variantes, StatusBadge |
