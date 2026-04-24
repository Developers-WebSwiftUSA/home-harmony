import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { propertyService } from "@/services/property.service";
import property1 from "@/assets/property-1.jpg";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/models";

type PropertiesTab = "all" | "pending" | "active" | "rejected";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Date (newest first)" },
  { value: "createdAt", label: "Date (oldest first)" },
  { value: "title", label: "Name (A–Z)" },
  { value: "-title", label: "Name (Z–A)" },
  { value: "-updatedAt", label: "Recently edited" },
  { value: "updatedAt", label: "Least recently edited" },
  { value: "-views", label: "Most visited" },
  { value: "views", label: "Least visited" },
] as const;

function sortProperties(properties: Property[], sortKey: string): Property[] {
  const arr = [...properties];
  const [field, order] = sortKey.startsWith("-") ? [sortKey.slice(1), -1] : [sortKey, 1];
  arr.sort((a, b) => {
    let aVal: number | string | undefined = (a as Record<string, unknown>)[field];
    let bVal: number | string | undefined = (b as Record<string, unknown>)[field];
    if (field === "updatedAt" || field === "createdAt") {
      aVal = aVal ? new Date(aVal as string).getTime() : 0;
      bVal = bVal ? new Date(bVal as string).getTime() : 0;
    }
    if (aVal == null) aVal = field === "title" ? "" : 0;
    if (bVal == null) bVal = field === "title" ? "" : 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return order * aVal.localeCompare(bVal);
    }
    return order * (Number(aVal) - Number(bVal));
  });
  return arr;
}

const PropertyCard = ({
  property,
  onApprove,
  onReject,
  onPending,
  onDelete,
  showApprove,
  showPending,
}: {
  property: Property;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPending: (id: string) => void;
  onDelete: (id: string) => void;
  showApprove: boolean;
  showPending: boolean;
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex gap-4 hover:border-primary/30 transition-colors">
      <Link to={`/admin/properties/${property._id}`} className="flex gap-4 flex-1 min-w-0">
        <img
          src={property.images?.[0]?.url || property1}
          alt={property.title}
          className="w-28 h-20 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground hover:text-primary block truncate">
            {property.title}
          </span>
          <p className="text-xs text-muted-foreground mb-1">
            {[property.location?.city, property.location?.state].filter(Boolean).join(", ")}
          </p>
          <p className="text-sm text-primary font-bold">${Number(property.price || 0).toLocaleString()}</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
            {property.status}
          </span>
          {(property.views ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{property.views} views</p>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <Link to={`/admin/properties/${property._id}`}>
          <Button size="sm" variant="outline" className="text-xs gap-1">
            <Eye className="w-3.5 h-3.5" /> Review
          </Button>
        </Link>
        {showPending && (
          <Button size="sm" variant="outline" className="text-xs" onClick={() => onPending(property._id)}>
            <Clock className="w-3.5 h-3.5 mr-1" /> Under Approval
          </Button>
        )}
        {showApprove && (
          <Button size="sm" className="text-xs gap-1" onClick={() => onApprove(property._id)}>
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </Button>
        )}
        <Button size="sm" variant="outline" className="text-xs" onClick={() => onReject(property._id)}>
          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs text-destructive hover:text-destructive gap-1"
          onClick={() => {
            if (window.confirm("Delete this property permanently?")) {
              onDelete(property._id);
            }
          }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
};

const AdminProperties = () => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS[0].value);
  const [activeTab, setActiveTab] = useState<PropertiesTab>("pending");

  const { data: approvedData, isLoading: loadingApproved } = useQuery({
    queryKey: ["admin-properties", "active"],
    queryFn: () => propertyService.list({ status: "active", limit: 500 }),
  });
  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["admin-properties", "pending"],
    queryFn: () => propertyService.list({ status: "pending", limit: 500 }),
  });
  const { data: rejectedData, isLoading: loadingRejected } = useQuery({
    queryKey: ["admin-properties", "rejected"],
    queryFn: () => propertyService.list({ status: "rejected", limit: 500 }),
  });

  const isLoading = loadingApproved || loadingPending || loadingRejected;
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => propertyService.approve(id),
    onSuccess: () => {
      toast.success("Property approved");
      refresh();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => propertyService.reject(id),
    onSuccess: () => {
      toast.success("Property rejected");
      refresh();
    },
  });
  const pendingMutation = useMutation({
    mutationFn: (id: string) => propertyService.update(id, { status: "pending" }),
    onSuccess: () => {
      toast.success("Property marked under approval");
      refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyService.remove(id),
    onSuccess: () => {
      toast.success("Property deleted");
      refresh();
    },
  });

  const approved = useMemo(
    () => sortProperties(approvedData?.data || [], sortBy),
    [approvedData?.data, sortBy]
  );
  const underApproval = useMemo(
    () => sortProperties(pendingData?.data || [], sortBy),
    [pendingData?.data, sortBy]
  );
  const rejected = useMemo(
    () => sortProperties(rejectedData?.data || [], sortBy),
    [rejectedData?.data, sortBy]
  );
  const totalCount = approved.length + underApproval.length + rejected.length;

  const tabConfig: { key: PropertiesTab; count: number; label: string; className: string }[] = [
    { key: "all", count: totalCount, label: "Total", className: "bg-card border border-border" },
    {
      key: "pending",
      count: underApproval.length,
      label: "Under approval",
      className: "bg-yellow-500/10 border border-yellow-500/20",
    },
    {
      key: "active",
      count: approved.length,
      label: "Approved",
      className: "bg-green-500/10 border border-green-500/20",
    },
    {
      key: "rejected",
      count: rejected.length,
      label: "Rejected",
      className: "bg-blue-500/10 border border-blue-500/20",
    },
  ];

  const activeList =
    activeTab === "all"
      ? sortProperties([...underApproval, ...approved, ...rejected], sortBy)
      : activeTab === "pending"
        ? underApproval
        : activeTab === "active"
          ? approved
          : rejected;

  const activeLabel =
    activeTab === "all"
      ? "All properties"
      : activeTab === "pending"
        ? "Under approval"
        : activeTab === "active"
          ? "Approved"
          : "Rejected";

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Properties" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Properties</h1>
          <p className="text-sm text-muted-foreground">Review and manage property listings</p>
        </div>

        {/* Tabbed stats - clickable like Reviews section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {tabConfig.map((tab) => {
            const isAll = tab.key === "all";
            const isPending = tab.key === "pending";
            const isActive = tab.key === "active";
            const isSelected = activeTab === tab.key;
            const valueColor = isAll
              ? "text-foreground"
              : isPending
                ? "text-yellow-600"
                : isActive
                  ? "text-green-600"
                  : "text-blue-600";
            const labelColor = isAll
              ? "text-muted-foreground"
              : isPending
                ? "text-yellow-600"
                : isActive
                  ? "text-green-600"
                  : "text-blue-600";
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90",
                  tab.className,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
                )}
              >
                <div className={cn("text-2xl font-bold", valueColor)}>{tab.count}</div>
                <div className={cn("text-sm", labelColor)}>{tab.label}</div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <p className="text-sm text-muted-foreground">
            {activeLabel} · Click a listing to open the review page.
          </p>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground min-w-[200px]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground mb-4">Loading properties...</p>
        ) : activeList.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 bg-card border border-border rounded-xl text-center">
            No properties in this section
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeList.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onApprove={(id) => approveMutation.mutate(id)}
                onReject={(id) => rejectMutation.mutate(id)}
                onPending={(id) => pendingMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
                showApprove={property.status === "pending"}
                showPending={property.status === "active"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProperties;
