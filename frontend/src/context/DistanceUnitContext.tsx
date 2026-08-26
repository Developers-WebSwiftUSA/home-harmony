import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DistanceUnit,
  formatDistance as formatDistanceValue,
  formatRadiusLabel as formatRadiusLabelValue,
  fromDisplayValue as fromDisplayValueFn,
  getMaxRadiusForUnit,
  isDistanceUnit,
  toDisplayValue as toDisplayValueFn,
} from "@/lib/distanceUnits";

const STORAGE_KEY = "distance_unit";

type DistanceUnitContextType = {
  unit: DistanceUnit;
  setUnit: (unit: DistanceUnit) => void;
  formatDistance: (miles: number) => string;
  formatRadiusLabel: (radiusMiles: number | null | undefined) => string;
  toDisplayValue: (miles: number) => number;
  fromDisplayValue: (display: number) => number;
  maxRadius: number;
  unitShort: "mi" | "km";
};

const DistanceUnitContext = createContext<DistanceUnitContextType | undefined>(undefined);

const readStoredUnit = (): DistanceUnit => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isDistanceUnit(saved)) return saved;
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
  return "miles";
};

export const DistanceUnitProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [unit, setUnitState] = useState<DistanceUnit>(readStoredUnit);

  useEffect(() => {
    if (user?.preferences?.distanceUnit) {
      setUnitState(user.preferences.distanceUnit);
      try {
        localStorage.setItem(STORAGE_KEY, user.preferences.distanceUnit);
      } catch {
        // Ignore storage errors
      }
    }
  }, [user?.preferences?.distanceUnit]);

  const setUnit = useCallback((next: DistanceUnit) => {
    setUnitState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({
      unit,
      setUnit,
      formatDistance: (miles: number) => formatDistanceValue(miles, unit),
      formatRadiusLabel: (radiusMiles: number | null | undefined) =>
        formatRadiusLabelValue(radiusMiles, unit),
      toDisplayValue: (miles: number) => toDisplayValueFn(miles, unit),
      fromDisplayValue: (display: number) => fromDisplayValueFn(display, unit),
      maxRadius: getMaxRadiusForUnit(unit),
      unitShort: unit === "km" ? ("km" as const) : ("mi" as const),
    }),
    [unit, setUnit]
  );

  return <DistanceUnitContext.Provider value={value}>{children}</DistanceUnitContext.Provider>;
};

export const useDistanceUnit = () => {
  const context = useContext(DistanceUnitContext);
  if (!context) {
    throw new Error("useDistanceUnit must be used within DistanceUnitProvider");
  }
  return context;
};
