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

- .env.production에 배치

```
SITE_URL=https://til-supabase-three.vercel.app
```

## 배포 에러 처리

- eslint.config.mjs

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Prettier 플러그인 추가
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      prettier: eslintPluginPrettier, //  Prettier 플러그인 추가
    },
    rules: {
      ...eslintConfigPrettier.rules, //  Prettier와 충돌하는 ESLint 규칙 비활성화
      "prettier/prettier": ["off", { endOfLine: "auto" }], //  Prettier 스타일을 강제 적용 (오류 발생 시 ESLint에서 표시)
      "@typescript-eslint/no-unused-vars": "off", //  기존 TypeScript 규칙 유지
      "@typescript-eslint/no-explicit-any": "off", //  any 타입 사용 허용
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
```

## 구글 로그인 Redirects 처리

- https://cloud.google.com/developers?hl=ko
- `콘솔`로 이동
- `프로젝트` 선택
- `API 및 서비스` → `OAuth 동의 화면` → `클라이언트` → `해당 클라이언트 선택`
- `승인된 리디렉션 URI`에 `https://til-supabase-three.vercel.app` (vercel 주소) 추가

# 네이버 서치 어드바이저 등록하기

- https://searchadvisor.naver.com/
- [`웹 마스터 도구`](https://searchadvisor.naver.com/console/board)
- `사이트 소유확인` → `HTML 태그`에서 메타 태그 복사하기

```html
<meta
  name="naver-site-verification"
  content="75d0ebd7ba50c42db041df212eec136177627ba6"
/>
```

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
  other: {
    "naver-site-verification": "75d0ebd7ba50c42db041df212eec136177627ba6",
  },
};
```
