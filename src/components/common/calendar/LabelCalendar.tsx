"use client";
import { Dispatch, SetStateAction } from "react";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import styles from "@/components/common/calendar/LabelCalendar.module.scss";

interface LabelCalendarProps {
  label: string;
  required: boolean;
  selectedDate: Date | undefined;
  onDateChange?: Dispatch<SetStateAction<Date | string | undefined>>;
}
// required : false면 날짜 선택
// required : true면 날짜 선택 불가
function LabelCalendar({
  label,
  required,
  selectedDate,
  onDateChange,
}: LabelCalendarProps) {
  return (
    <div className={styles.container}>
      <span className={styles.container_label}>{label}</span>
      {/* shadcn/ui Calendar 배치 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>

        {!required && (
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

export default LabelCalendar;
