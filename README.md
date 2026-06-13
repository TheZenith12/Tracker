# Finance Tracker

Хувийн орлого, зарлагаа хянах вэб апп. Дансаа удирдах, гүйлгээгээ ангилах, төсөв тавих, тайлан харах, мөн AI-аар зөвлөгөө авах боломжтой. Монгол хэл, dark/light mode дэмжинэ.

## Технологи

**Backend** — `backend/`
- NestJS + TypeScript
- MongoDB + Mongoose
- JWT auth (access + refresh)
- Anthropic Claude API — AI зөвлөгөө, ангилал
- Swagger — API баримтжуулалт
- Nodemailer — и-мэйл

**Frontend** — `frontend-new/`
- React + Vite + TypeScript
- React Router
- TanStack Query — server state
- Zustand — client state
- React Hook Form + Zod — форм, валидаци
- Recharts — график
- Tailwind CSS

## Боломжууд

- Олон данс (бэлэн мөнгө, банк, карт) удирдах
- Орлого/зарлагын гүйлгээ, ангилал
- Сар бүрийн төсөв, давтагдах гүйлгээ
- Аналитик тайлан, график
- AI туслах — зарлагаа задлан шинжлэх, зөвлөгөө
- И-мэйл баталгаажуулалт, нууц үг сэргээх

## Бүтэц

```
backend/                NestJS API
  src/
    auth/               нэвтрэлт, JWT
    accounts/           данс
    transactions/       гүйлгээ
    categories/         ангилал
    budgets/            төсөв
    recurring/          давтагдах гүйлгээ
    reports/            тайлан
    ai/                 Anthropic AI module
    mail/               и-мэйл
    users/              хэрэглэгч
frontend-new/           React + Vite клиент
docker-compose.yml
```

## Эхлүүлэх

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # доорх хувьсагчдыг бөглөнө
npm run start:dev           # http://localhost:4000 (Swagger: /api/docs)

# 2. Frontend (шинэ терминал)
cd frontend-new
npm install
npm run dev                 # Vite dev server
```

## Орчны хувьсагч (`backend/.env`)

```env
DATABASE_URL=mongodb://localhost:27017/finance_tracker

JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=

APP_URL=http://localhost:3000
PORT=4000
NODE_ENV=development

ANTHROPIC_API_KEY=          # AI боломжид шаардлагатай
```
