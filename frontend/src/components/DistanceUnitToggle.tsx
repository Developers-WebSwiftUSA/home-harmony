import { cn } from "@/lib/utils";
import { useDistanceUnit } from "@/context/DistanceUnitContext";
import { DistanceUnit } from "@/lib/distanceUnits";

type Props = {
  className?: string;
  size?: "sm" | "default";
};

export const DistanceUnitToggle = ({ className, size = "default" }: Props) => {
  const { unit, setUnit } = useDistanceUnit();

  const options: { value: DistanceUnit; label: string }[] = [
    { value: "miles", label: "mi" },
    { value: "km", label: "km" },
  ];

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-background/95 backdrop-blur shadow-sm p-0.5",
        className
      )}
      role="group"
      aria-label="Distance unit"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setUnit(option.value)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs",
            unit === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          aria-pressed={unit === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
