# TOPTI — Web (EngViet)

Next.js 16 frontend cho **TOPTI**, nền tảng SaaS cho giáo viên tiếng Anh / IELTS tự do ở Việt Nam:
giáo viên tạo lớp, học sinh vào lớp bằng mã 6 ký tự, giáo viên import từ vựng, hệ thống tự sinh
bài trắc nghiệm ABCD + minigame ghép từ có bấm giờ, tự chấm điểm và hiện bảng xếp hạng.

Song ngữ Việt/Anh (`next-intl`, URL có tiền tố `/vi` `/en`), PWA, giao diện sáng/tối.

## Kiến trúc

- **Next.js 16 App Router** (`src/app/[locale]/...`), không có `src/app/layout.tsx` — root layout là `[locale]/layout.tsx`.
- **Dữ liệu**: gọi thẳng API NestJS (`../Backend-EngViet`) qua `src/lib/api/*` (Server Components) và
  `src/lib/actions.ts` (Server Actions cho mọi lệnh ghi). Không có mock layer.
- **Auth**: BFF session — app tự set 2 cookie httpOnly (`topti_at` / `topti_rt`); middleware `src/proxy.ts`
  tự refresh token hết hạn và chặn khu vực `/teacher` `/student` `/admin`.
- **UI**: `components/ui/*` (kit tự viết, các trang cũ) + `antd` (mọi UI mới). Icon từ `@ant-design/icons`
  chỉ qua `src/components/icons.tsx`.

## Chạy local

```bash
corepack pnpm install
cp .env.example .env.local   # điền NEXT_PUBLIC_API_URL (mặc định http://localhost:4000/api/v1)
corepack pnpm dev            # http://localhost:3000  → 307 sang /vi
```
Cần backend chạy (xem `../Backend-EngViet` — không cần Redis, cache chạy in-process). Chạy `corepack pnpm seed` bên backend để có
dữ liệu mẫu; đăng nhập `teacher2@topti.seed` / `Topti@12345`.

```bash
corepack pnpm typecheck   # tsc --noEmit
corepack pnpm lint        # eslint
corepack pnpm build && corepack pnpm start
```

## Deploy

Render Blueprint: `render.yaml` (service `topti-web`). Runbook đầy đủ: **`../Backend-EngViet/DEPLOY.md`**.

## Biến môi trường

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | URL API gồm `/api/v1`. **Nhúng lúc build** — đổi phải build lại. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL công khai của web (canonical / OG / sitemap). |
| `API_URL` | — | URL API cho lời gọi phía server; mặc định = `NEXT_PUBLIC_API_URL`. |
