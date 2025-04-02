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
