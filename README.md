# read

- /src/app/actions/todo-action.ts

```ts
// Read 기능
export async function getTodos() {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase.from("todos").select("*");
  return { data, error, status };
}
```

- /src/components/common/navigation/SideNavigation.tsx

```tsx
"use client";
// actions
import { getTodos, TodosRow } from "@/app/actions/todos-action";

// scss
import styles from "@/components/common/navigation/SideNavigation.module.scss";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dot, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function SideNavigation() {
  const [todos, setTodos] = useState<TodosRow[] | null>([]);

  const fetchGetTodos = async () => {
    const { data, error, status } = await getTodos();
    if (error) {
      toast.error("데이터 조회실패", {
        description: `데이터 조회에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }
    // 최종 데이터
    toast.success("데이터 조회 성공", {
      description: "데이터 조회에 성공하였습니다.",
      duration: 3000,
    });

    setTodos(data);
  };

  useEffect(() => {
    fetchGetTodos();
  }, []);

  return (
    <div className={styles.container}>
      {/* 검색창 */}
      <div className={styles.container_searchBox}>
        <Input
          type="text"
          placeholder="검색어를 입력하세요."
          className="focus-visible:right"
        />
        <Button variant={"outline"} size={"icon"}>
          <Search className="w-4 h-4" />
        </Button>
      </div>
      {/* page 추가 버튼 */}
      <div className={styles.container_buttonBox}>
        <Button
          variant={"outline"}
          className="w-full text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500"
        >
          Add New Page
        </Button>
      </div>
      {/* 추가 항목 출력 영역 */}
      <div className={styles.container_todos}>
        <div className={styles.container_todos_label}>Your Todo</div>
        <div className={styles.container_todos_list}>
          {todos!.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer"
            >
              <Dot className="mr-1 text-green-400" />
              <span className="text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SideNavigation;
```

- /src/components/common/navigation/SideNavigation.module.scss

```scss
&_list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
```

# DB 컬럼 변경

- content => contents로 이름 변경(타입은 text => jsonb)
- start_date 추가 (타입은 timestamptz : now())
- end_date 추가 (타입은 timestamptz)
- 컬럼이 변경되면 `npm run generate-types`를 반드시 실행하기

# DB 변경으로 인한 데이터 추가부분 수정

- /src/app/actions/todos-action.ts

```ts
// Create 기능
export async function createTodo(todo: TodosRowInsert) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .insert([
      {
        title: todo.title,
        contents: todo.contents,
        start_date: todo.start_date,
        end_date: todo.end_date,
      },
    ])
    .select()
    .single();

  return { data, error, status };
}
```

- /src/components/common/navigation/SideNavigation.tsx (추가)

```tsx
// create
const onCreate = async () => {
  const { data, error, status } = await createTodo({
    title: "",
    contents: JSON.stringify([]),
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  });
  if (error) {
    toast.error("데이터 추가실패", {
      description: `데이터 추가에 실패하였습니다. ${error.message}`,
      duration: 3000,
    });
    return;
  }

  // 최종 데이터
  toast.success("데이터 추가 성공", {
    description: "데이터 추가에 성공하였습니다.",
    duration: 3000,
  });

  // 데이터 추가 성공 시 할 일 등록페이지로 이동시킴
  // http://localhost:3000/create/[data.id] 로 이동
};
```

# 데이터 추가 후 할 일 여러 개 등록페이지로 이동하기

- http://localhost:3000/create/[id] 로 이동처리
- /app/create 파일들을 /app/create/[id] 폴더로 이동
- /src/components/common/navigation/SideNavigation.tsx 라우터 추가

```tsx
// create
const onCreate = async () => {
  const { data, error, status } = await createTodo({
    title: "",
    contents: JSON.stringify([]),
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  });
  if (error) {
    toast.error("데이터 추가실패", {
      description: `데이터 추가에 실패하였습니다. ${error.message}`,
      duration: 3000,
    });
    return;
  }

  // 최종 데이터
  toast.success("데이터 추가 성공", {
    description: "데이터 추가에 성공하였습니다.",
    duration: 3000,
  });
  console.log("등록된 id", data.id);

  // 데이터 추가 성공 시 할 일 등록페이지로 이동시킴
  // http://localhost:3000/create/[data.id] 로 이동
  router.push(`/create/${data.id}`);
};
```

## 상세페이지에서 params를 알아내서 처리

- /src/app/actions/todos-action.ts : id 에 해당하는 Row 데이터를 읽어오기

```ts
// Read 기능 id 한개
export async function getTodoId(id: number) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .select()
    .eq("id", id)
    .single();
  return { data, error, status } as {
    data: TodosRow | null;
    error: Error | null;
    status: number;
  };
}
```

- /src/app/create/[id]/page.tsx

```tsx
const { id } = useParams();
// id 에 해당하는 Row 데이터를 읽어오기
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
};

useEffect(() => {
  fetchGetTodoId();
}, []);
```

- id 에 해당하는 contents[] 안의 요소에 대한 타입 정의

```tsx
// contents 배열에 대한 타입정의
interface BoardContent {
  isCompleted: boolean;
  title: string;
  content: string;
  startDate: string | Date;
  endDate: string | Date;
  boardId: string; // 랜덤한 아이디를 생성해 줄 예정
}
```

- 화면에 각 보드에 출력시킬 state

```tsx
// 데이터 출력 state
const [title, setTitle] = useState<string | null>();
const [contents, setContents] = useState<BoardContent[]>();
const [startDate, setStartDate] = useState<string | Date>();
const [endDate, setEndDate] = useState<string | Date>();
```

## Page 에서 Add New Board 클릭 시 할 일을 여러 개 추가

```tsx
// 컨텐츠 추가하기
const onCreateContent = () => {
  // 기본으로 추가될 내용
  const addContent: BoardContent = {
    boardId: "1111",
    title: "",
    content: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isCompleted: false,
  };
  const updateContent = [...contents, addContent];
  // 서버에 Row 를 업데이트 합니다.
};
```

- /src/app/actions/todos-action.ts : update 액션 추가

```ts
// Update 기능 id 한개
export async function updateTodoId(id: number, contents: string) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .update({ contents })
    .eq("id", id)
    .select()
    .single();

  return { data, error, status } as {
    data: TodosRow | null;
    error: Error | null;
    status: number;
  };
}
```

- 컨텐츠 추가하기 수정

```tsx
// 컨텐츠 추가하기
const onCreateContent = async () => {
  // 기본으로 추가될 내용
  const addContent: BoardContent = {
    boardId: "1111",
    title: "",
    content: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    isCompleted: false,
  };
  const updateContent = [...contents, addContent];
  // 서버에 Row를 업데이트
  console.log(updateContent);
  const { data, error, status } = await updateTodoId(
    Number(id),
    JSON.stringify(updateContent)
  );

  // 에러 발생 시
  if (error) {
    toast.error("데이터 컨텐츠 업데이트 실패", {
      description: `데이터 컨텐츠 업데이트에 실패하였습니다. ${error.message}`,
      duration: 3000,
    });
    return;
  }

  // 최종 데이터
  toast.success("데이터 컨텐츠 업데이트 성공", {
    description: "데이터 컨텐츠 업데이트에 성공하였습니다.",
    duration: 3000,
  });

  // 자료 새로 호출
  fetchGetTodoId();
};
```

## 목록 출력하기

```tsx
{
  /* 본문 */
}
<div className={styles.container_body}>
  {/* contents 배열의 개수만큼 출력이 되어야 함 */}
  {contents.length === 0 ? (
    <div>없어요</div>
  ) : (
    <div>
      {contents.map((item) => (
        <BasicBoard key={item.boardId} />
      ))}
    </div>
  )}
</div>;
```

## 랜덤한 boardId 생성하기 : 라이브러리

- https://www.npmjs.com/package/nanoid

```bash
npm i nanoid --legacy-peer-deps
```

```tsx
// 기본으로 추가될 내용
const addContent: BoardContent = {
  boardId: nanoid(),
  title: "",
  content: "",
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  isCompleted: false,
};
```

## 목록이 없는 경우 추가

```tsx
<div className={styles.container_body}>
  {/* contents 배열의 개수만큼 출력이 되어야 함 */}
  {contents.length === 0 ? (
    <div className={styles.container_body_infoBox}>
      <span className={styles.title}>There is no board yet.</span>
      <span className={styles.subTitle}>
        Click the button and start flashing!
      </span>
      <button className={styles.button} onClick={onCreateContent}>
        <Image
          src="/assets/images/round-button.svg"
          alt="add board"
          width={100}
          height={100}
        />
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-start w-full h-full gap-4">
      {contents.map((item) => (
        <BasicBoard key={item.boardId} />
      ))}
    </div>
  )}
</div>
```

## 첫 페이지에서 Row 추가하기

- /src/app/page.tsx

```tsx
"use client";

import styles from "@/app/page.module.scss";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createTodo } from "@/app/actions/todos-action";
import { toast } from "sonner";

function Home() {
  const router = useRouter();

  // create
  const onCreate = async () => {
    const { data, error, status } = await createTodo({
      title: "",
      contents: JSON.stringify([]),
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    });
    if (error) {
      toast.error("데이터 추가 실패", {
        description: `데이터 추가에 실패하였습니다. ${error.message}`,
        duration: 3000,
      });
      return;
    }

    // 최종 데이터
    toast.success("데이터 추가 성공", {
      description: "데이터 추가에 성공하였습니다.",
      duration: 3000,
    });
    console.log("등록된 id", data.id);

    // 데이터 추가 성공 시 할 일 등록페이지로 이동시킴
    // http://localhost:3000/create/[data.id] 로 이동
    router.push(`/create/${data.id}`);
  };

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
          onClick={onCreate}
        >
          Add New page
        </Button>
      </div>
    </div>
  );
}

export default Home;
```
