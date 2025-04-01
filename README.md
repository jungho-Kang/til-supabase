# 카카오 인증

- 참조 : https://www.youtube.com/watch?v=iWQEK8pS2kU

## 카카오 개발자 설정

- https://developers.kakao.com
- REST API Key, Client Secret Code, Redirect URI 설정 진행

## 카카오 로그인 코드 추가

- /src/lib/supabase/actions.ts 추가

```ts
"use server";

import { Provider } from "@supabase/supabase-js";
import { createServerSideClient } from "./server";
import { redirect } from "next/navigation";

const signInWith = (provider: Provider) => async () => {
  const supabase = await createServerSideClient();

  const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: auth_callback_url,
    },
  });

  console.log(data);

  if (error) {
    console.log(error);
  }

  redirect(data.url as string);
};

// 구글
const signInWithGoogle = signInWith("google");
// 카카오
const signInWithKakao = signInWith("kakao");

const signOut = async () => {
  const supabase = await createServerSideClient();
  await supabase.auth.signOut();
};

// 외부 활용
export { signInWithGoogle, signInWithKakao, signOut };
```

## 로그인 버튼 배치

- /src/components/auth/loginform.tsx

```tsx
const handleKakaoLogin = async () => {
  try {
    setIsLoading(true);
    await signInWithKakao();
    toast.success("로그인 성공!", {
      description: "메인 페이지로 이동합니다.",
    });

    // router.push("/");
    // router.refresh();
  } catch (error) {
    toast.error("로그인 실패", {
      description: "Kakao 로그인 중 오류가 발생했습니다.",
    });
  } finally {
    setIsLoading(false);
  }
};
```

```tsx
<Button
  variant="outline"
  type="button"
  className="w-full"
  onClick={handleKakaoLogin}
  disabled={isLoading}
>
  Kakao로 계속하기
</Button>
```
