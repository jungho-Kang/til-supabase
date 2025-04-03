# SEO

## 섬네일

- /public 폴더에 배치합니다 (thumnail.png)

## 아이콘

- /src/app 폴더에 배치합니다 (icon.ico)

## 메타데이터 설정하기

### 1. 기본 메타데이터 설정

- http://localhost:3000
- /src/app/layout.tsx

```tsx
export const metadata: Metadata = {
  title: "Todo",
  description: "Todo Supabase",
  openGraph: {
    title: "Todo",
    description: "Todo Supabase",
    images: [{ url: "/thumnail.png" }],
  },
};
```

### 2. 페이지별 메타데이터 설정

- /src/app/(with-side)/layout.tsx

```tsx
export const metadata: Metadata = {
  title: "Blog",
  description: "Blog Supabase",
  openGraph: {
    title: "Blog",
    description: "Blog Supabase",
    images: [{ url: "/thumbnail.png" }],
  },
};
```

### 3. 동적 페이지 메타데이터 설정

- next-15 깃허브 (deploy) 부분 참조

# Vercel Deploy

- https://vercel.com
- 환경변수 등록 주의
  - `SITE_URL`은 로그인 이후 이동할 주소

```
.env.production에 배치
- SITE_URL=https://til-supabase-three.vercel.app
```
