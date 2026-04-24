import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  unavailableDates?: Date[];
  className?: string;
}

const AnimatedCalendar = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  unavailableDates = [],
  className,
}: AnimatedCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [animating, setAnimating] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = date.toDateString();
    return unavailableDates.some(d => d.toDateString() === dateStr);
  };

  const isDateDisabled = (date: Date) => {
    if (date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (isDateUnavailable(date)) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const handlePreviousMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      setAnimating(false);
    }, 150);
  };

  const handleNextMonth = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      setAnimating(false);
    }, 150);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 hover:scale-110"
          disabled={animating}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-heading font-bold text-foreground">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 hover:scale-110"
          disabled={animating}
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className={cn(
          "grid grid-cols-7 gap-2 transition-all duration-300",
          animating && "opacity-50 scale-95"
        )}
      >
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const today = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-all duration-200",
                "hover:scale-110 hover:shadow-md",
                disabled
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "cursor-pointer",
                selected
                  ? "bg-primary text-primary-foreground shadow-lg scale-110 ring-2 ring-primary ring-offset-2"
                  : today
                  ? "bg-primary/20 text-primary font-bold border-2 border-primary"
                  : "bg-muted hover:bg-primary/10 text-foreground",
                !disabled && !selected && "hover:border-primary/50 border-2 border-transparent"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedCalendar;
