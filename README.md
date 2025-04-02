# React Query 적용

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

- 데이터를 쉽게 가져오고, 자동으로 업데이트해 주는 도구 라이브러리입니다.
- `fresh` 한 데이터 : 최신 데이터
- `stale` 한 데이터 : 기존 데이터 (상해버린 데이터)
- 서버 상태를 불러오고, 캐싱하고, 지속적으로 동기화하고 업데이트 도움 라이브러리
- 캐싱기능과, Window Focus Reftching 등의 기능이 존재

## 3. 환경설정

### 3.1. ReactQueryProvider 생성

- 이 파일의 용도는 App 전체에서 React Query 를 사용하기 위한 provider 역할
- `/src/providers 폴더` 생성
- `/src/providers/ReactQueryProvider.tsx 파일` 생성

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
      {/* Dev Tool : React Query DevTools 를 셋팅 */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
```

### 3.2. ReactQueryProvider 적용

- 앱 전체에서 활용할 것이므로
- /src/app/layout.tsx 에 설정

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

## 4. useMutation, useQuery 사용 예제

- /src/app/(with-side)/page.tsx

```tsx
"use client";

import styles from "@/app/(with-side)/page.module.scss";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createTodo } from "@/app/actions/todos-action";
import { toast } from "sonner";
// Mutation
import { useMutation } from "@tanstack/react-query";

function Home() {
  const router = useRouter();

  // create
  const createMutation = useMutation({
    mutationFn: () =>
      createTodo({
        title: "",
        contents: JSON.stringify([]),
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
      }),
    onSuccess: (data) => {
      toast.success("데이터 추가 성공", {
        description: "데이터 추가에 성공하였습니다.",
        duration: 3000,
      });

      router.push(`/create/${data.data.id}`);
    },
    onError: (error) => {
      toast.error("데이터 추가 실패", {
        description: `데이터 추가에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.container_onBoarding}>
        <span className={styles.container_onBoarding_title}></span>
        <div className={styles.container_onBoarding_steps}>
          <span>1. Create a page</span>
          <span>2. Add boards to page</span>
        </div>
        {/* 페이지 추가 버튼 */}
        <Button
          variant={"outline"}
          className="w-full bg-transparent text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "Add..." : "Add New page"}
        </Button>
      </div>
    </div>
  );
}

export default Home;
```

- /src/app/(with-side)/create/[id]/page.tsx

```tsx
"use client";
import {
  deleteTodo,
  getTodoId,
  updateTodoId,
  updateTodoIdTitle,
} from "@/app/actions/todos-action";
// nanoid
import { nanoid } from "nanoid";
// scss
import styles from "@/app/(with-side)/create/[id]/page.module.scss";
// component
import BasicBoard from "@/components/common/board/BasicBoard";
import LabelCalendar from "@/components/common/calendar/LabelCalendar";
// shadcn/ui
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { ChevronLeftIcon } from "lucide-react";
import { useAtom } from "jotai";
import { sidebarStateAtom } from "@/app/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/ReactQueryProvider";

// contents 배열에 대한 타입정의
interface BoardContent {
  isCompleted: boolean;
  title: string;
  content: string;
  startDate: string | Date;
  endDate: string | Date;
  boardId: string; // 랜덤한 아이디를 생성해 줄 예정
}

function Page() {
  // jotai 상태 사용하기
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);

  const router = useRouter();
  const { id } = useParams();
  // 데이터 출력 state
  const [title, setTitle] = useState<string>("");
  const [contents, setContents] = useState<BoardContent[]>([]);
  const [startDate, setStartDate] = useState<undefined | string | Date>();
  const [endDate, setEndDate] = useState<undefined | string | Date>();
  // Progress Bar 처리
  const [completeCount, setCompleteCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // id에 해당하는 Row 데이터를 읽어오기
  const {
    error,
    data: queryData,
    refetch,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: () => getTodoId(Number(id)),
  });

  // Page 삭제 함수
  const deleteBoardMutation = useMutation({
    mutationFn: () => {
      return deleteTodo(Number(id));
    },
    onSuccess: () => {
      toast.success("Todo 삭제 성공", {
        description: "Todo 삭제에 성공하였습니다.",
        duration: 3000,
      });
      setSidebarState("delete");
      router.push("/");
    },
    onError: (error) => {
      toast.error("Todo 삭제 실패", {
        description: `Todo 삭제에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    },
  });

  // 타이틀 저장 함수
  const saveTitleMutation = useMutation({
    mutationFn: () => {
      return updateTodoIdTitle(
        Number(id),
        title,
        startDate as Date,
        endDate as Date
      );
    },
    onSuccess: () => {
      toast.success("타이틀 수정 성공", {
        description: "타이틀 수정에 성공하였습니다.",
        duration: 3000,
      });

      // jotai의 State 갱신
      setSidebarState("titleChange");
    },
    onError: (error) => {
      toast.error("타이틀 수정 실패", {
        description: `타이틀 수정에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    },
  });

  // 컨텐츠 삭제 함수
  const deleteContentMutation = useMutation({
    mutationFn: (deleteBoardId: string) => {
      const tempContentArr = contents.filter(
        (item) => item.boardId !== deleteBoardId
      );

      // 서버에 Row를 업데이트
      return updateTodoId(Number(id), JSON.stringify(tempContentArr));
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // 컨텐츠 데이터 업데이트 함수
  const updateContentMutation = useMutation({
    mutationFn: (newData: BoardContent) => {
      const newContentArr = contents.map((item) => {
        if (item.boardId === newData.boardId) {
          return newData;
        }
        return item;
      });

      return updateTodoId(Number(id), JSON.stringify(newContentArr));
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // contents의 isCompleted가 true인 개수 파악하기
  const calcCompletedCount = (temp: BoardContent[]) => {
    const arr = temp.filter((item) => item.isCompleted === true);
    setCompleteCount(arr.length);
    setTotalCount((arr.length / temp.length) * 100);
  };

  // id에 해당하는 Row 데이터를 읽어오기
  const fetchGetTodoId = async () => {
    const { data, error, status } = await getTodoId(Number(id));
    // 에러 발생 시
    if (error) {
      toast.error("데이터 호출 실패", {
        description: `데이터 호출에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }

    // 최종 데이터
    toast.success("데이터 호출 성공", {
      description: "데이터 호출에 성공하였습니다.",
      duration: 3000,
    });
    setTitle(data?.title ? data.title : "");
    setStartDate(data?.start_date ? new Date(data.start_date) : new Date());
    setEndDate(data?.end_date ? new Date(data.end_date) : new Date());
    const temp = data?.contents ? JSON.parse(data.contents as string) : [];
    setContents(temp);
    // 카운트
    calcCompletedCount(temp);
  };

  // 컨텐츠 추가하기
  const initData: BoardContent = {
    boardId: nanoid(),
    title: "",
    content: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isCompleted: false,
  };

  // 컨텐츠 추가하기
  const onCreateContentMutation = useMutation({
    mutationFn: (newData: BoardContent) => {
      // 기본으로 추가될 내용
      const addContent = newData;
      const updateContent = [...contents, addContent];
      // 서버에 Row를 업데이트
      return updateTodoId(Number(id), JSON.stringify(updateContent));
    },
    onSuccess: () => {
      // 최종 데이터
      toast.success("데이터 컨텐츠 업데이트 성공", {
        description: "데이터 컨텐츠 업데이트에 성공하였습니다.",
        duration: 3000,
      });
      refetch();
    },
    onError: (error) => {
      toast.error("데이터 컨텐츠 업데이트 실패", {
        description: `데이터 컨텐츠 업데이트에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    },
  });

  useEffect(() => {
    // fetchGetTodoId();
    refetch();
    if (queryData) {
      // 최종 데이터
      toast.success("데이터 호출 성공", {
        description: "데이터 호출에 성공하였습니다.",
        duration: 3000,
      });
      setTitle(queryData.data?.title ? queryData.data.title : "");
      setStartDate(
        queryData.data?.start_date
          ? new Date(queryData.data.start_date)
          : new Date()
      );
      setEndDate(
        queryData.data?.end_date
          ? new Date(queryData.data.end_date)
          : new Date()
      );
      const temp = queryData.data?.contents
        ? JSON.parse(queryData.data.contents as string)
        : [];
      setContents(temp);
      // 카운트
      calcCompletedCount(temp);
    }
    if (error) {
      toast.error("데이터 호출 실패", {
        description: `데이터 호출에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
    }
  }, [queryData]);

  return (
    <div className={styles.container}>
      {/* board 메뉴 */}
      <div className="absolute flex w-full items-center p-3">
        <div className="flex-1">
          <Button
            variant={"outline"}
            onClick={() => router.push("/")}
            className="cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            onClick={() => saveTitleMutation.mutate()}
            disabled={saveTitleMutation.isPending}
            className="cursor-pointer"
          >
            {saveTitleMutation.isPending ? "저장중..." : "저장"}
          </Button>
          <Button
            variant={"outline"}
            disabled={deleteBoardMutation.isPending}
            onClick={() => deleteBoardMutation.mutate()}
            className="cursor-pointer"
          >
            {deleteBoardMutation.isPending ? "삭제중..." : "삭제"}
          </Button>
        </div>
      </div>
      {/* 상단 */}
      <header className={styles.container_header}>
        <div className={styles.container_header_contents}>
          <input
            type="text"
            placeholder="Enter Title Here"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {/* 진행율 */}
          <div className={styles.progressBar}>
            <span className={styles.progressBar_status}>
              {completeCount}/{contents.length} completed!
            </span>
            {/* Progress 컴포넌트 배치 */}
            <Progress
              value={totalCount}
              className="w-[30%] h-2"
              indicateColor="bg-orange-500"
            />
          </div>
          {/* 캘린더 선택 추가 */}
          <div className={styles.calendarBox}>
            <div className={styles.calendarBox_calendar}>
              <LabelCalendar
                label="From"
                selectedDate={startDate as Date}
                onDateChange={setStartDate}
                required={false}
              />
              <LabelCalendar
                label="To"
                selectedDate={endDate as Date}
                onDateChange={setEndDate}
                required={true}
              />
            </div>
            <Button
              variant={"outline"}
              className="w-[15%] text-white bg-orange-400 border-orange-500 hover:bg-orange-400 hover:text-white cursor-pointer"
              onClick={() => onCreateContentMutation.mutate(initData)}
            >
              Add New Board
            </Button>
          </div>
        </div>
      </header>
      {/* 본문 */}
      <div className={styles.container_body}>
        {/* contents 배열의 개수만큼 출력이 되어야 함 */}
        {contents.length === 0 ? (
          <div className={styles.container_body_infoBox}>
            <span className={styles.title}>There is no board yet.</span>
            <span className={styles.subTitle}>
              Click the button and start flashing!
            </span>
            <button
              className={styles.button}
              onClick={() => onCreateContentMutation.mutate(initData)}
            >
              <Image
                src="/assets/images/round-button.svg"
                alt="add board"
                width={100}
                height={100}
              />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-start w-full h-full gap-4 overflow-y-scroll">
            {contents.map((item) => (
              <BasicBoard
                key={item.boardId}
                item={item}
                updateContent={updateContentMutation.mutate}
                deleteContent={deleteContentMutation.mutate}
                fetchGetTodoId={fetchGetTodoId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
```
