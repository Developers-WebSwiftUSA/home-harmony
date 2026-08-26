import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type Props = {
  min: number;
  max: number;
  step: number;
  minValue: number | null;
  maxValue: number | null;
  onChange: (min: number | null, max: number | null) => void;
  label?: string;
  anyPriceLabel?: string;
};

export const PriceRangeSlider = ({
  min,
  max,
  step,
  minValue,
  maxValue,
  onChange,
  label = "Price range",
  anyPriceLabel = "Any price",
}: Props) => {
  const hasFilter = minValue != null || maxValue != null;
  const sliderMin = minValue ?? min;
  const sliderMax = maxValue ?? max;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-medium text-foreground">
          {hasFilter
            ? `$${sliderMin.toLocaleString()} – $${sliderMax.toLocaleString()}`
            : anyPriceLabel}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[sliderMin, sliderMax]}
        onValueChange={([nextMin, nextMax]) => {
          let low = nextMin;
          let high = nextMax;
          if (low > high) [low, high] = [high, low];
          const atFullRange = low <= min && high >= max;
          onChange(
            atFullRange ? null : low,
            atFullRange ? null : high
          );
        }}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
        <span>${min.toLocaleString()}</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </div>
  );
};
