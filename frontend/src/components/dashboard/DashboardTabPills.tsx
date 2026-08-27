import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type DashboardTab = {
  key: string;
  label: string;
  count?: string | number;
  className?: string;
  valueClass?: string;
  href?: string;
};

type Props = {
  tabs: DashboardTab[];
  activeKey: string;
  onChange?: (key: string) => void;
  variant?: "pill" | "card";
  className?: string;
};

export const inferPillStyle = (key: string, index = 0) => {
  const k = String(key || "").toLowerCase();
  if (/(pending|approval|under|review|scheduled|clock|draft)/.test(k)) {
    return { className: "bg-yellow-500/10 border border-yellow-500/20", valueClass: "text-yellow-600" };
  }
  if (/(reject|cancel|declin|fail|inactive)/.test(k)) {
    return { className: "bg-red-500/10 border border-red-500/20", valueClass: "text-red-600" };
  }
  if (/(reschedule|rent|rental|buyer|client|tour|views|search)/.test(k)) {
    return { className: "bg-blue-500/10 border border-blue-500/20", valueClass: "text-blue-600" };
  }
  if (/(agent|revenue|spend|purple|admin|value|price|inquir)/.test(k)) {
    return { className: "bg-purple-500/10 border border-purple-500/20", valueClass: "text-purple-600" };
  }
  if (/(active|confirm|approv|sale|live|recommend|excellent|sold|favorite)/.test(k)) {
    return { className: "bg-green-500/10 border border-green-500/20", valueClass: "text-green-600" };
  }
  if (/(complete|archiv|past|expir|gray|total|all listings|all news|all users|all tours)/.test(k)) {
    return { className: "bg-gray-500/10 border border-gray-500/20", valueClass: "text-gray-600" };
  }
  if (k === "all" || k === "" || k === "overview") {
    return { className: "bg-card border border-border", valueClass: "text-foreground" };
  }
  const fallback = [
    { className: "bg-card border border-border", valueClass: "text-foreground" },
    { className: "bg-yellow-500/10 border border-yellow-500/20", valueClass: "text-yellow-600" },
    { className: "bg-green-500/10 border border-green-500/20", valueClass: "text-green-600" },
    { className: "bg-blue-500/10 border border-blue-500/20", valueClass: "text-blue-600" },
    { className: "bg-purple-500/10 border border-purple-500/20", valueClass: "text-purple-600" },
    { className: "bg-gray-500/10 border border-gray-500/20", valueClass: "text-gray-600" },
  ];
  return fallback[index % fallback.length];
};

const gridClass = (count: number) => {
  if (count <= 2) return "sm:grid-cols-2";
  if (count === 3) return "sm:grid-cols-3";
  if (count === 4) return "sm:grid-cols-2 lg:grid-cols-4";
  if (count === 5) return "sm:grid-cols-2 lg:grid-cols-5";
  return "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
};

export const DashboardTabPills = ({
  tabs,
  activeKey,
  onChange,
  variant = "card",
  className,
}: Props) => {
  if (variant === "pill") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {tabs.map((tab, index) => {
          const isSelected = activeKey === tab.key;
          const inferred = inferPillStyle(tab.key, index);
          const pillClass = cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors border no-underline",
            tab.className || inferred.className,
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
          );
          const content = (
            <span className={tab.valueClass || inferred.valueClass}>
              {tab.label}
              {tab.count != null ? ` (${tab.count})` : ""}
            </span>
          );
          if (tab.href) {
            return (
              <Link key={tab.key} to={tab.href} className={pillClass}>
                {content}
              </Link>
            );
          }
          return (
            <button key={tab.key} type="button" onClick={() => onChange?.(tab.key)} className={pillClass}>
              {content}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4", gridClass(tabs.length), className)}>
      {tabs.map((tab, index) => {
        const isSelected = activeKey === tab.key;
        const inferred = inferPillStyle(tab.key, index);
        const classNameResolved = tab.className || inferred.className;
        const valueClass = tab.valueClass || inferred.valueClass;
        const labelClass = valueClass === "text-foreground" ? "text-muted-foreground" : valueClass;
        const cardClass = cn(
          "block rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90 border no-underline",
          classNameResolved,
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
        );
        const content = (
          <>
            {tab.count != null && <div className={cn("text-2xl font-bold", valueClass)}>{tab.count}</div>}
            <div className={cn("text-sm", tab.count != null ? labelClass : cn("font-medium", valueClass))}>
              {tab.label}
            </div>
          </>
        );
        if (tab.href) {
          return (
            <Link key={tab.key} to={tab.href} className={cardClass}>
              {content}
            </Link>
          );
        }
        return (
          <button key={tab.key} type="button" onClick={() => onChange?.(tab.key)} className={cardClass}>
            {content}
          </button>
        );
      })}
    </div>
  );
};

export const listingTypeTabs = (all: number, sale: number, rent: number): DashboardTab[] => [
  { key: "all", label: "All Listings", count: all, className: "bg-card border border-border", valueClass: "text-foreground" },
  {
    key: "sale",
    label: "For Sale",
    count: sale,
    className: "bg-green-500/10 border border-green-500/20",
    valueClass: "text-green-600",
  },
  {
    key: "rent",
    label: "For Rent",
    count: rent,
    className: "bg-blue-500/10 border border-blue-500/20",
    valueClass: "text-blue-600",
  },
];

export const marketTabs = (saleCount: number, rentCount: number): DashboardTab[] => [
  {
    key: "sale",
    label: "Sale Buyers",
    count: saleCount,
    className: "bg-green-500/10 border border-green-500/20",
    valueClass: "text-green-600",
  },
  {
    key: "rent",
    label: "Rental Buyers",
    count: rentCount,
    className: "bg-blue-500/10 border border-blue-500/20",
    valueClass: "text-blue-600",
  },
];

export const partnerRoleTabs = (sellers: number, agents: number): DashboardTab[] => [
  {
    key: "seller",
    label: "Sellers",
    count: sellers,
    className: "bg-yellow-500/10 border border-yellow-500/20",
    valueClass: "text-yellow-600",
  },
  {
    key: "agent",
    label: "Agents",
    count: agents,
    className: "bg-purple-500/10 border border-purple-500/20",
    valueClass: "text-purple-600",
  },
];
