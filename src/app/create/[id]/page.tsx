"use client";
import { getTodoId, updateTodoId } from "@/app/actions/todos-action";
// nanoid
import { nanoid } from "nanoid";
// scss
import styles from "@/app/create/[id]/page.module.scss";
// component
import BasicBoard from "@/components/common/board/BasicBoard";
import LabelCalendar from "@/components/common/calendar/LabelCalendar";
// shadcn/ui
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

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
  const { id } = useParams();
  // 데이터 출력 state
  const [title, setTitle] = useState<string | null>();
  const [contents, setContents] = useState<BoardContent[]>([]);
  const [startDate, setStartDate] = useState<string | Date>();
  const [endDate, setEndDate] = useState<string | Date>();

  // 컨텐츠 데이터 업데이트 함수
  const updateContent = async (newData: BoardContent) => {
    console.log("최종전달", newData);

    const newContentArr = contents.map((item) => {
      if (item.boardId === newData.boardId) {
        return newData;
      }
      return item;
    });
    // 서버에 Row를 업데이트
    console.log(updateContent);
    const { data, error, status } = await updateTodoId(
      Number(id),
      JSON.stringify(newContentArr)
    );

    fetchGetTodoId();
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
    setStartDate(data?.start_date ? data.start_date : new Date());
    setEndDate(data?.end_date ? data.end_date : new Date());
    const temp = data?.contents ? JSON.parse(data.contents as string) : [];
    setContents(temp);
  };

  // 컨텐츠 추가하기
  const onCreateContent = async (newData?: BoardContent) => {
    // 기본으로 추가될 내용
    const addContent = newData
      ? { ...newData }
      : {
          boardId: nanoid(),
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

  useEffect(() => {
    fetchGetTodoId();
  }, []);

  return (
    <div className={styles.container}>
      {/* 상단 */}
      <header className={styles.container_header}>
        <div className={styles.container_header_contents}>
          <input
            type="text"
            placeholder="Enter Title Here"
            className={styles.input}
          />
          {/* 진행율 */}
          <div className={styles.progressBar}>
            <span className={styles.progressBar_status}>1/10 completed!</span>
            {/* Progress 컴포넌트 배치 */}
            <Progress
              value={33}
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
              onClick={() => onCreateContent()}
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
            <button className={styles.button} onClick={() => onCreateContent()}>
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
              <BasicBoard
                key={item.boardId}
                item={item}
                updateContent={updateContent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
