# Delete

- /src/app/create/[id]/page.tsx

```tsx
// 컨텐츠 삭제 함수
const deleteContent = (deleteBoardId: string) => {
  console.log("삭제할 컨텐츠 boardId", deleteBoardId);
  const tempContentArr = contents.filter(
    (item) => item.boardId !== deleteBoardId
  );
  console.log(tempContentArr);
};
```

```tsx
<div className="flex flex-col items-center justify-start w-full h-full gap-4">
  {contents.map((item) => (
    <BasicBoard
      key={item.boardId}
      item={item}
      updateContent={updateContent}
      deleteContent={deleteContent}
    />
  ))}
</div>
```

- /src/components/common/board/BasicBoard.tsx

```tsx
interface BasicBoardProps {
  item: BoardContent;
  updateContent: (newData: BoardContent) => void;
  deleteContent: (deleteBoardId: string) => void;
}

function BasicBoard({ item, updateContent, deleteContent }: BasicBoardProps) {
    .....
}
export default BasicBoard;
```

```tsx
<Button
  variant={"ghost"}
  className="font-normal text-gray-400 hover:bg-red-500 hover:text-white"
  onClick={() => deleteContent(item.boardId)}
>
  Delete
</Button>
```

## 필터링 contents를 업데이트 진행

- /src/app/create/[id]/page.tsx

```tsx
// 컨텐츠 삭제 함수
const deleteContent = async (deleteBoardId: string) => {
  // console.log("삭제할 컨텐츠 boardId", deleteBoardId);
  const tempContentArr = contents.filter(
    (item) => item.boardId !== deleteBoardId
  );
  // 서버에 Row를 업데이트
  const { data, error, status } = await updateTodoId(
    Number(id),
    JSON.stringify(tempContentArr)
  );

  fetchGetTodoId();
};
```

## 홈 버튼, page 수정 버튼, page 삭제 버튼 레이아웃 배치

```tsx
{
  /* board 메뉴 */
}
<div className="absolute flex w-full items-center p-3">
  <div className="flex-1">
    <Button variant={"outline"} className="cursor-pointer">
      <ChevronLeftIcon className="w-4 h-4" />
    </Button>
  </div>
  <div className="flex gap-2">
    <Button variant={"outline"} className="cursor-pointer">
      저장
    </Button>
    <Button variant={"outline"} className="cursor-pointer">
      삭제
    </Button>
  </div>
</div>;
```

## home 버튼 기능

```tsx
import { useParams, useRouter } from "next/navigation";
```

```tsx
const router = useRouter();
```

```tsx
<Button
  variant={"outline"}
  onClick={() => router.push("/")}
  className="cursor-pointer"
>
  <ChevronLeftIcon className="w-4 h-4" />
</Button>
```

## 저장 버튼 기능

```tsx
// 타이틀 저장 함수
const handleSaveTitle = () => {
  console.log(title);
};
```

```tsx
<Button
  variant={"outline"}
  onClick={handleSaveTitle}
  className="cursor-pointer"
>
  저장
</Button>
```

```tsx
<input
  type="text"
  placeholder="Enter Title Here"
  className={styles.input}
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>
```

## 타이틀 수정 서버액션 함수

- /src/app/actions/todos-action.ts

```ts
// Title Update 함수
export async function updateTodoIdTitle(id: number, title: string) {
  const supabase = await createServerSideClient();
  const { data, error, status } = await supabase
    .from("todos")
    .update({ title })
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

## 타이틀 업데이트 활용하기

```tsx
// 타이틀 저장 함수
const handleSaveTitle = async () => {
  console.log(title);
  const { data, error, status } = await updateTodoIdTitle(Number(id), title);
  console.log(data);
  console.log(error);
  console.log(status);
};
```

## Row 삭제하기

- /src/app/actions/todos-action.ts

```tsx
// Row 삭제 기능
export async function deleteTodo(id: number) {
  const supabase = await createServerSideClient();
  const { error, status } = await supabase.from("todos").delete().eq("id", id);

  return { error, status } as {
    data: TodosRow | null;
    error: Error | null;
    status: number;
  };
}
```

- /src/app/create/[id]/page.tsx

```tsx
<Button
  variant={"outline"}
  onClick={handleDeleteBoard}
  className="cursor-pointer"
>
  삭제
</Button>
```

```tsx
// Page 삭제 함수
const handleDeleteBoard = async () => {
  console.log(id, "제거하라");
  const { error, status } = await deleteTodo(Number(id));

  if (error) {
    toast.error("Todo 삭제 실패", {
      description: `Todo 삭제에 실패하였습니다. ${error.message}`,
      duration: 3000,
    });
    return;
  }

  toast.success("Todo 삭제 성공", {
    description: "Todo 삭제에 성공하였습니다.",
    duration: 3000,
  });
  router.push("/");
};
```
