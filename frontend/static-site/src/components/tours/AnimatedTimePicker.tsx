import { useState, useEffect } from "react";
import { Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface AnimatedTimePickerProps {
  selectedTime: { startTime: string; endTime: string } | null;
  onTimeSelect: (startTime: string, endTime: string) => void;
  availableSlots: TimeSlot[];
  className?: string;
}

const AnimatedTimePicker = ({
  selectedTime,
  onTimeSelect,
  availableSlots,
  className,
}: AnimatedTimePickerProps) => {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Default time slots if none provided
  const defaultSlots: TimeSlot[] = availableSlots.length > 0 
    ? availableSlots 
    : [
        { startTime: "09:00", endTime: "10:00", available: true },
        { startTime: "10:00", endTime: "11:00", available: true },
        { startTime: "11:00", endTime: "12:00", available: true },
        { startTime: "14:00", endTime: "15:00", available: true },
        { startTime: "15:00", endTime: "16:00", available: true },
        { startTime: "16:00", endTime: "17:00", available: true },
      ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const isSelected = (slot: TimeSlot) => {
    if (!selectedTime) return false;
    return (
      selectedTime.startTime === slot.startTime &&
      selectedTime.endTime === slot.endTime
    );
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-lg", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-heading font-bold text-foreground">Select Time</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {defaultSlots.map((slot, index) => {
          const selected = isSelected(slot);
          const hovered = hoveredSlot === `${slot.startTime}-${slot.endTime}`;

          return (
            <button
              key={`${slot.startTime}-${slot.endTime}`}
              onClick={() => {
                if (slot.available) {
                  onTimeSelect(slot.startTime, slot.endTime);
                }
              }}
              onMouseEnter={() => setHoveredSlot(`${slot.startTime}-${slot.endTime}`)}
              onMouseLeave={() => setHoveredSlot(null)}
              disabled={!slot.available}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-300",
                "hover:scale-105 hover:shadow-lg",
                slot.available
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50",
                selected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : hovered && slot.available
                  ? "bg-primary/10 border-primary/50"
                  : slot.available
                  ? "bg-muted border-border hover:border-primary/50"
                  : "bg-muted/50 border-border"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {selected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="text-center">
                <div className="text-sm font-medium">
                  {formatTime(slot.startTime)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">to</div>
                <div className="text-sm font-medium">
                  {formatTime(slot.endTime)}
                </div>
              </div>
              {!slot.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground line-through">Unavailable</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedTimePicker;
