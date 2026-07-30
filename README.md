# Finance Tracker

Хувийн орлого, зарлагаа хянах вэб апп. Дансаа удирдах, гүйлгээгээ ангилах, төсөв тавих, тайлан харах, мөн AI-аар зөвлөгөө авах боломжтой. Монгол хэл, dark/light mode дэмжинэ.

Энэ төслийг би ганцаараа, бие даан судалж хөгжүүлсэн. Anthropic Claude API-тай интеграц хийж, хэрэглэгчийн бодит данс/гүйлгээ/төсвийн өгөгдлөөс Монгол хэлээр санхүүгийн зөвлөгөө үүсгэдэг AI функцийг бүрэн ажилтай болгосон. Мөн NestJS дээр модульчлагдсан backend бичиж, JWT-ийн access/refresh token сэлгэлт, cron job-оор ажилладаг давтагдах гүйлгээний систем зэргийг гараар хийж сурсан.

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


NODE_ENV=development

ANTHROPIC_API_KEY=          # AI боломжид шаардлагатай
```
