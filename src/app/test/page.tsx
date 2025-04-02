"use client";

import { createTodos, getTodos } from "@/app/actions/test-action";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/ReactQueryProvider";
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
    onSettled: () => {
      console.log("무조건 처리해야 하는 함수");
    },
  });

  // mutateAsync 비동기 실행 예제
  const mutation = useMutation({
    mutationFn: createTodos,
  });

  const handleAdd = async () => {
    try {
      const now = await mutation.mutateAsync("추가요");
      console.log("데이터", now);
      queryClient.refetchQueries({ queryKey: ["unique"] });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Test Todo</h1>
      <div>
        <Button onClick={() => handleAdd()}>테스트</Button>
      </div>
      <div className="flex gap-2">
        <input
          className="border px-3 py-1 rounded-sm"
          type="text"
          value={testInput}
          placeholder="할 일을 입력해주세요."
          onChange={(e) => setTestInput(e.target.value)}
        />
        <Button
          disabled={createMutation.isPending}
          className="px-3 py-1 rounded-sm bg-amber-400 text-gray-800 hover:bg-amber-500 cursor-pointer"
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "추가중.." : "할일추가"}
        </Button>
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
