import { cn } from "@/lib/utils";

export type DashboardTab = {
  key: string;
  label: string;
  count?: number;
  className?: string;
};

type Props = {
  tabs: DashboardTab[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: "pill" | "card";
  className?: string;
};

export const DashboardTabPills = ({
  tabs,
  activeKey,
  onChange,
  variant = "pill",
  className,
}: Props) => {
  if (variant === "card") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {tabs.map((tab) => {
          const isSelected = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={cn(
                "rounded-xl p-5 text-left transition-all hover:opacity-90 border",
                tab.className || "bg-card border-border",
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
              )}
            >
              {tab.count != null && (
                <div className="text-2xl font-bold text-foreground">{tab.count}</div>
              )}
              <div className="text-sm font-medium text-foreground">{tab.label}</div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tabs.map((tab) => {
        const isSelected = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : tab.className || "bg-card border border-border text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
            {tab.count != null ? ` (${tab.count})` : ""}
          </button>
        );
      })}
    </div>
  );
};

export const listingTypeTabs = (all: number, sale: number, rent: number): DashboardTab[] => [
  { key: "all", label: "All Listings", count: all, className: "bg-card border border-border" },
  {
    key: "sale",
    label: "For Sale",
    count: sale,
    className: "bg-green-500/10 border border-green-500/20 text-green-800",
  },
  {
    key: "rent",
    label: "For Rent",
    count: rent,
    className: "bg-blue-500/10 border border-blue-500/20 text-blue-800",
  },
];

export const marketTabs = (saleCount: number, rentCount: number): DashboardTab[] => [
  {
    key: "sale",
    label: "Sale Buyers",
    count: saleCount,
    className: "bg-green-500/10 border border-green-500/20",
  },
  {
    key: "rent",
    label: "Rental Buyers",
    count: rentCount,
    className: "bg-blue-500/10 border border-blue-500/20",
  },
];

export const partnerRoleTabs = (sellers: number, agents: number): DashboardTab[] => [
  { key: "seller", label: "Sellers", count: sellers, className: "bg-yellow-500/10 border border-yellow-500/20" },
  { key: "agent", label: "Agents", count: agents, className: "bg-purple-500/10 border border-purple-500/20" },
];
