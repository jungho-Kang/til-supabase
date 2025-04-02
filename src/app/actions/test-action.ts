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
