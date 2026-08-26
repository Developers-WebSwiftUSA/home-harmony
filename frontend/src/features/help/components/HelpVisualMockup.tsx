import type { ReactNode } from "react";
import {
  Calendar,
  Heart,
  HelpCircle,
  Home,
  MapPin,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import type { HelpVisualType } from "@/features/help/types/help.types";
import { cn } from "@/lib/utils";

const Frame = ({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) => (
  <div className="rounded-xl border border-border bg-muted/40 p-3">
    {label && (
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
        {label}
      </p>
    )}
    <div className={cn("rounded-lg bg-background border border-border/60 p-3", className)}>
      {children}
    </div>
  </div>
);

const mockups: Record<HelpVisualType, ReactNode> = {
  "search-filters": (
    <Frame label="Search & filters">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 h-8 rounded-md bg-muted flex items-center px-2 text-xs text-muted-foreground gap-1">
            <Search className="w-3 h-3" /> City, address, or ZIP
          </div>
          <div className="h-8 px-2 rounded-md bg-primary/10 text-primary text-xs flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Filters
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 px-2 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center">
            Map search
          </div>
          <div className="h-6 px-2 rounded-full bg-muted text-[10px] flex items-center">Any price</div>
        </div>
      </div>
    </Frame>
  ),
  "map-search": (
    <Frame label="Map area search">
      <div className="relative h-28 rounded-md bg-emerald-50 border border-emerald-200 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,#ccc_1px,transparent_1px),linear-gradient(#ccc_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <MapPin className="w-6 h-6 text-primary fill-primary/20" />
        </div>
        <div className="absolute bottom-2 left-2 right-2 h-6 rounded bg-background/90 text-[10px] flex items-center justify-center gap-1 border">
          <span className="text-muted-foreground">Radius</span>
          <span className="font-medium">10 mi</span>
        </div>
      </div>
    </Frame>
  ),
  "map-browse": (
    <Frame label="Split map + list">
      <div className="grid grid-cols-2 gap-2 h-24">
        <div className="rounded bg-emerald-50 border relative">
          <MapPin className="w-4 h-4 text-primary absolute top-2 left-3" />
          <MapPin className="w-4 h-4 text-primary absolute bottom-3 right-4" />
        </div>
        <div className="space-y-1">
          <div className="h-6 rounded bg-muted" />
          <div className="h-6 rounded bg-muted" />
          <div className="h-6 rounded bg-muted" />
        </div>
      </div>
    </Frame>
  ),
  "listing-card": (
    <Frame label="Listing card">
      <div className="flex gap-2">
        <div className="w-14 h-14 rounded-md bg-muted shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-3/4 rounded bg-foreground/20" />
          <div className="h-2 w-1/2 rounded bg-muted-foreground/30" />
          <div className="flex gap-2 text-[10px] text-muted-foreground">
            <span>3 bed</span><span>2 bath</span><span className="text-primary font-medium">$450k</span>
          </div>
        </div>
        <Heart className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Frame>
  ),
  "sidebar-nav": (
    <Frame label="Dashboard sidebar">
      <div className="flex gap-2">
        <div className="w-16 space-y-1 rounded bg-secondary p-1">
          <div className="h-5 rounded bg-primary/80" />
          <div className="h-4 rounded bg-white/10" />
          <div className="h-4 rounded bg-white/10" />
          <div className="h-4 rounded bg-white/10" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-16 rounded bg-muted/60" />
        </div>
      </div>
    </Frame>
  ),
  "message-chat": (
    <Frame label="Messages">
      <div className="grid grid-cols-3 gap-2 h-24">
        <div className="col-span-1 space-y-1 border-r pr-2">
          <div className="h-5 rounded bg-primary/15 border border-primary/30" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
        </div>
        <div className="col-span-2 flex flex-col justify-end gap-1">
          <div className="self-start h-5 w-2/3 rounded-lg bg-muted text-[9px] px-1 flex items-center">Hi, is this available?</div>
          <div className="self-end h-5 w-1/2 rounded-lg bg-primary/15 text-[9px] px-1 flex items-center">Yes, tour tomorrow?</div>
        </div>
      </div>
    </Frame>
  ),
  "tour-booking": (
    <Frame label="Book a tour">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Select date & time</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {["Mon", "Tue", "Wed"].map((d) => (
            <div key={d} className="h-7 rounded border text-[10px] flex items-center justify-center">{d}</div>
          ))}
        </div>
        <div className="h-7 rounded bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
          Request tour
        </div>
      </div>
    </Frame>
  ),
  "rental-apply": (
    <Frame label="Rental application">
      <div className="space-y-1.5 text-[10px]">
        <div className="h-6 rounded border px-2 flex items-center text-muted-foreground">Full name</div>
        <div className="h-6 rounded border px-2 flex items-center text-muted-foreground">Monthly income</div>
        <div className="h-6 rounded bg-primary text-primary-foreground flex items-center justify-center">Submit application</div>
      </div>
    </Frame>
  ),
  promotion: (
    <Frame label="Promoted listing">
      <div className="flex gap-2 items-center">
        <div className="w-12 h-12 rounded bg-muted" />
        <div className="flex-1">
          <div className="flex gap-1 mb-1">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Sponsored</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">Ad</span>
          </div>
          <div className="h-2 w-3/4 rounded bg-muted" />
        </div>
      </div>
    </Frame>
  ),
  "dashboard-stats": (
    <Frame label="Dashboard overview">
      <div className="grid grid-cols-3 gap-1.5">
        {["Listings", "Tours", "Messages"].map((label) => (
          <div key={label} className="rounded border p-1.5 text-center">
            <div className="text-sm font-bold text-primary">12</div>
            <div className="text-[9px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </Frame>
  ),
  "listing-form": (
    <Frame label="Create listing">
      <div className="space-y-1.5">
        <div className="h-5 rounded border text-[10px] px-2 flex items-center text-muted-foreground">Title & price</div>
        <div className="h-16 rounded border bg-emerald-50 flex items-center justify-center text-[10px] text-muted-foreground gap-1">
          <MapPin className="w-3 h-3" /> Drop pin on map
        </div>
        <div className="h-5 rounded bg-primary text-primary-foreground text-[10px] flex items-center justify-center">Publish listing</div>
      </div>
    </Frame>
  ),
  "crm-board": (
    <Frame label="CRM pipeline">
      <div className="grid grid-cols-3 gap-1 h-20">
        {["New", "Active", "Closed"].map((col) => (
          <div key={col} className="rounded border bg-muted/30 p-1">
            <div className="text-[9px] font-medium mb-1">{col}</div>
            <div className="h-4 rounded bg-background border mb-1" />
            <div className="h-4 rounded bg-background border" />
          </div>
        ))}
      </div>
    </Frame>
  ),
  calendar: (
    <Frame label="Calendar">
      <div className="grid grid-cols-7 gap-0.5 text-[8px] text-center">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-5 rounded flex items-center justify-center",
              i === 9 ? "bg-primary text-primary-foreground font-bold" : "bg-muted/50"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </Frame>
  ),
  reviews: (
    <Frame label="Reviews & ratings">
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("w-3 h-3", i < 4 ? "text-amber-400 fill-amber-400" : "text-muted")} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">4.0 · 12 reviews</span>
      </div>
    </Frame>
  ),
  "help-fab": (
    <Frame label="Page help button">
      <div className="relative h-16">
        <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
          <HelpCircle className="w-5 h-5" />
        </div>
        <p className="text-[10px] text-muted-foreground absolute bottom-12 right-0 whitespace-nowrap">
          Click anytime for this page&apos;s guide
        </p>
      </div>
    </Frame>
  ),
  "table-actions": (
    <Frame label="Review actions">
      <div className="space-y-1">
        <div className="flex items-center justify-between h-7 px-2 rounded border text-[10px]">
          <span>Pending item</span>
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Approve</span>
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">Reject</span>
          </div>
        </div>
        <div className="h-7 rounded border bg-muted/30" />
      </div>
    </Frame>
  ),
  "auth-form": (
    <Frame label="Sign in">
      <div className="space-y-1.5 max-w-[180px] mx-auto">
        <div className="h-6 rounded border text-[10px] px-2 flex items-center text-muted-foreground">Email</div>
        <div className="h-6 rounded border text-[10px] px-2 flex items-center text-muted-foreground">Password</div>
        <div className="h-6 rounded bg-primary text-primary-foreground text-[10px] flex items-center justify-center">Login</div>
      </div>
    </Frame>
  ),
};

export const HelpVisualMockup = ({ type }: { type: HelpVisualType }) => (
  <div className="my-3">{mockups[type]}</div>
);

export const HelpRoleBadge = ({ role }: { role: string }) => {
  const icons: Record<string, ReactNode> = {
    public: <Home className="w-3 h-3" />,
    admin: <Users className="w-3 h-3" />,
    buyer: <Heart className="w-3 h-3" />,
    seller: <Home className="w-3 h-3" />,
    agent: <MessageSquare className="w-3 h-3" />,
  };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
      {icons[role]} {role}
    </span>
  );
};
