# React Query

- v3, v4, v5 각 버전이 사용법 및 설치법이 다릅니다.
- 현재는 `v5`를 사용함.
- https://tanstack.com/query/v5
- https://tanstack.com/query/v5/docs/framework/react/overview
- https://velog.io/@kandy1002/React-Query-푹-찍어먹기

## 1. 설치

- 라이브러리

```bash
npm install @tanstack/react-query --legacy-peer-deps
```

- DevTool 설치

```bash
npm i @tanstack/react-query-devtools --legacy-peer-deps
```

## 2. 개념

- 데이터를 쉽게 가져오고, 자동으로 업데이트해 주는 도구 라이브러리입니다
- `fresh` 한 데이터 : 최신 데이터
- `stale` 한 데이터 : 기존 데이터 (상해버린 데이터)
- 서버 상태를 불러오고, 캐싱하고, 지속적으로 동기화하고 업데이트 도움 라이브러리
- 캐싱기능과, Window Focus Reftching 등의 기능이 존재

## 3. 환경설정

### 3.1. ReactQueryProvider 생성

- 이 파일의 용도는 App 전체에서 React Query를 사용하기 위한 provider 역할
- `/src/providers` 폴더 생성
- `/src/providers/ReactQueryProvider.tsx` 파일 생성

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 개발자 도구
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
export const queryClient = new QueryClient();
export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Dev Tool : React Query DevTools를 세팅 */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
```

### 3.2. ReactQueryProvider 적용

- 앱 전체에서 활용할 것이므로
- /src/app/layout.tsx에 설정

```tsx
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
// shadcn/ui
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Todo",
  description: "Todo Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${roboto.variable}  antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

## 4. 기능 살펴보기 라우터구성

- 간단한 Todo로 실습

### 4.1. Server Action 생성

- `/src/app/actions/text-action.ts` 파일 생성

```ts
"use server";
const TODOS: string[] = [];
// 할일 목록 가져오기
export const getTodos = async (): Promise<string[]> => {
  // 일부로 서버 지연되는 것처럼 1초 소비
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return TODOS;
};
// 할일 목록 추가하기
export const createTodos = async (data: string): Promise<string[]> => {
  // 일부로 서버 지연되는 것처럼 1초 소비
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 새로운 todo를 추가해서 return
  TODOS.push(data);
  return TODOS;
};
```

### 4.2. test 라우터를 생성

- http://localhost:3000/test 접근
- `/src/app/test` 폴더 생성
- `/src/app/test/page.tsx` 파일 생성

```tsx
const Page = () => {
  return (
    <div>
      <h1>Test Todo</h1>
    </div>
  );
};
export default Page;
```

## 5. useQuery() 살펴보기 (데이터 가져오기)

- /src/app/test/page.tsx

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getTodos } from "@/app/actions/test-action";

const Page = () => {
  // 데이터 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unique"],
    queryFn: getTodos,
  });

  return (
    <div>
      <h1>Test Todo</h1>
      {isLoading && <div>데이터 로딩중 ...</div>}
      {error && <div>Error : {error.message}</div>}
      {data && (
        <div>
          {data.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Page;
```

### 5.1. queryKey 옵션

- queryKey
  - 데이터를 구분하는 이름, 구분자 역할, 유일한 이름
  - 이름이 중복되면 요청은 한 번만 하므로 의미없는 API 호출을 방지

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
});
```

- userId가 1이라는 값이라면 ["unique", 1]
- userId가 2이라는 값이라면 ["unique", 2]
- 각 사용자별 목록을 별도로 관리가능

- `const { data, isLoading, error, refetch, isFetching }`
  - data : 가져온 데이터 (성공하면 데이터가 저장됨)
  - isLoading : 데이터를 가지고 오는 중이면 true
  - error : 에러가 발생하면 에러 정보가 담겨있음
  - isFetching : 데이터를 새로 요청 중일 때 true
  - refetch : 데이터를 다시 가져오도록 함수 호출
    - `<button onClick={() => refetch()}>다시호출</button>`

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique", userId],
  queryFn: getTodos,
});
```

### 5.2. staleTime 옵션

- 일정한 시간만큼 새로운 데이터를 가져오지 않는다
- 일정한 시간만큼 캐싱이 되어있는 데이터를 사용한다

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  staleTime: 5000,
});
```

### 5.3. refetchInterval 옵션

- 일정한 시간마다 새로운 데이터를 다시 가져오기

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchInterval: 5000,
});
```

### 5.4. enabled 옵션

- 조건에 따라서 true인 경우 데이터를 가져온다

```tsx
const [isFetch, setIsFetch] = useState<boolean>(false);
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  enabled: isFetch,
});
```

### 5.5. refetchOnWindowFocus 옵션

- 브라우저 창이 다시 활성화될 때(`focus`될 때) 자동으로 데이터 새로고침

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchOnWindowFocus: true, // 창 포커스 시 자동 새로고침
});
```

### 5.6. refetchOnMount 옵션

- 컴포넌트가 마운트될 때(`mount` 시) 자동으로 데이터 새로고침

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchOnMount: true, // 컴포넌트 마운트 시 자동 새로고침
});
```

### 5.7. refetchOnReconnect 옵션

- 네트워크 연결이 끊어졌다가 다시 연결될 때(`reconnect` 시) 자동으로 데이터 새로고침

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchOnReconnect: true, // 네트워크 재연결 시 자동 새로고침
});
```

### 5.8. refetchIntervalInBackground 옵션

- 브라우저가 백그라운드(비활성) 상태일 때도 `refetchInterval`이 동작하도록 설정
- 기본적으로 브라우저가 비활성 상태이면 `refetchInterval`이 멈추지만, true로 설정하면 계속 실행됨

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["unique"],
  queryFn: getTodos,
  refetchIntervalInBackground: true, // 백그라운드에서도 주기적 새로고침 유지
});
```

### 5.9. gcTime 옵션

- 데이터를 캐시에 유지하는 시간

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["uniq"],
  queryFn: getTodos,
  gcTime: 1000 * 60 * 5, // 캐시 유지 시간: 5분
});
```

### 5.10. retry 옵션

- 요청이 실패했을 때 자동으로 재시도하는 횟수를 설정하는 옵션

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["uniq"],
  queryFn: getTodos,
  retry: 3, // 실패 시 최대 3번 재시도
});
```

### 5.11. retryDelay 옵션

- 재시도하기 전에 대기할 시간설정

```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["uniq"],
  queryFn: getTodos,
  retryDelay: 3, // 재시도 간 3초 대기
});
```

## 6. useMutation() 살펴보기 (데이터 조작하기)

- 데이터 생성, 수정, 삭제 등의 작업을 처리함
- 데이터를 변경하는 작업
- mutation.mutate(데이터)

  - 서버로 데이터를 보내는 작업을 수행
  - `onClick={() => createMutation.mutate()}`

- mutation.data: 서버에서 성공적으로 반환된 데이터
- mutation.isLoading: 서버 요청 중일 때 true
- mutation.isError: 에러가 발생했을 때 true
- mutation.isSuccess: 요청이 성공했을 때 true
- mutation.isPending: 서버와의 연결을 시도 중일 때 true

- /src/app/test/page.tsx

```tsx
"use client";

import { createTodos, getTodos } from "@/app/actions/test-action";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Page = () => {
  const [testInput, setTestInput] = useState<string>("");

  // 데이터 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unique"],
    queryFn: getTodos,
    retry: 3,
    retryDelay: 3000,
  });

  // 데이터 추가하기
  const createMutation = useMutation({
    mutationFn: async () => {
      if (testInput.trim() === "") {
        alert("할 일을 등록해주세요.");
        return;
      }
      await createTodos(testInput);
    },
    onSuccess: () => {
      setTestInput("");
      refetch();
    },
    onError: (error) => {
      console.log("Error : 데이터 추가 실패");
      console.log(error.message);
    },
  });

  return (
    <div>
      <h1>Test Todo</h1>
      <div className="flex gap-2">
        <input
          className="border px-3 py-1 rounded-sm"
          type="text"
          value={testInput}
          placeholder="할 일을 입력해주세요."
          onChange={(e) => setTestInput(e.target.value)}
        />
        <button
          disabled={createMutation.isPending}
          className="px-3 py-1 rounded-sm bg-amber-400 text-gray-800 hover:bg-amber-500 cursor-pointer"
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "추가중.." : "할일추가"}
        </button>
      </div>
      <div>
        <button onClick={() => refetch()}>다시호출</button>
      </div>
      {isLoading && <div>데이터 로딩중 ...</div>}
      {error && <div>Error : {error.message}</div>}
      {data && (
        <div>
          {data.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Page;
```

### 6.1. onSuccess

- 성공 시 실행될 함수

```tsx
const createMutation = useMutation({
  onSuccess: () => {
    setTestInput("");
    refetch();
  },
});
```

### 6.2. onError

- 실패 시 실행될 함수

```tsx
const createMutation = useMutation({
  onError: (error) => {
    console.log("Error : 데이터 추가 실패");
    console.log(error.message);
  },
});
```

### 6.3. onSettled

- 성공, 실패 상관없이 무조건 실행

```tsx
const createMutation = useMutation({
  onSettled: () => {
    console.log("무조건 처리해야 하는 함수");
  },
});
```

### 6.4. mutateAsync 비동기 실행

```tsx
// mutateAsync 비동기 실행 예제
const mutation = useMutation({
  mutationFn: createTodos,
});
```

```tsx
const handleAdd = async () => {
  try {
    const now = await mutation.mutateAsync("추가요");
    console.log("데이터", now);
    queryClient.refetchQueries({ queryKey: ["unique"] });
  } catch (error) {
    console.log(error);
  }
};
```

```tsx
<div>
  <Button onClick={() => handleAdd()}>테스트</Button>
</div>
```
