"use client";
// actions
import { createTodo, getTodos, TodosRow } from "@/app/actions/todos-action";
import { sidebarStateAtom } from "@/app/store";

// scss
import styles from "@/components/common/navigation/SideNavigation.module.scss";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "@/lib/supabase/actions";
import { useAtom } from "jotai";
import { Dot, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function SideNavigation() {
  // jotai 상태 사용하기
  const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom);
  // 라우터 이동
  const router = useRouter();
  const path = usePathname();

  const [todos, setTodos] = useState<TodosRow[] | null>([]);

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
    setSidebarState("add");
    router.push(`/create/${data.id}`);
  };

  // read
  const fetchGetTodos = async () => {
    const { data, error, status } = await getTodos();
    if (error) {
      toast.error("데이터 조회 실패", {
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
    if (sidebarState !== "default") {
      fetchGetTodos();
    }
  }, [sidebarState, path]);

  const fetchSignOut = async () => {
    await signOut();
    router.push("/");
  };

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
          className="text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500 cursor-pointer"
          onClick={onCreate}
        >
          Add New Page
        </Button>
        <Button
          variant={"outline"}
          className="flex-1 text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500 cursor-pointer"
          onClick={() => router.push("/blog")}
        >
          Blog
        </Button>
      </div>
      {/* 추가 항목 출력 영역 */}
      <div className={styles.container_todos}>
        <div className={styles.container_todos_label}>
          {/* 로그아웃 버튼 배치 */}
          {"홍길동"}님 Todo List
        </div>

        <div className="flex justify-center w-[232px] mb-4 absolute bottom-0">
          <Button
            variant={"ghost"}
            className="cursor-pointer text-white bg-blue-500 hover:bg-blue-600 hover:text-white"
            onClick={fetchSignOut}
          >
            Sign Out
          </Button>
        </div>

        <div className={styles.container_todos_list}>
          {todos!.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer"
              onClick={() => router.push(`/create/${item.id}`)}
            >
              <Dot className="mr-1 text-green-400" />
              <span className="text-sm">
                {item.title ? item.title : "No Title"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SideNavigation;
