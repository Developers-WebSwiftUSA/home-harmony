import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { rentalApplicationService } from "@/services/rentalApplication.service";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RentalApplication, RentalApplicationStatus, UserRole } from "@/types/models";
import { getPropertyDetailPath } from "@/lib/propertyRoutes";
import { toast } from "sonner";
import { formatRentPrice } from "@/features/rentals/lib/rentalFormat";
import { Mail, Phone, Calendar, MapPin } from "lucide-react";
import { DashboardTabPills } from "@/components/dashboard/DashboardTabPills";

const statusStyles: Record<RentalApplicationStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  reviewing: "bg-blue-50 text-blue-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  withdrawn: "bg-muted text-muted-foreground",
};

type PageConfig = {
  role: UserRole;
  title: string;
  subtitle: string;
  sidebarActive: string;
};

const configs: Record<string, PageConfig> = {
  buyer: {
    role: "buyer",
    title: "My Rental Applications",
    subtitle: "Track applications you've submitted for rentals.",
    sidebarActive: "Applications",
  },
  seller: {
    role: "seller",
    title: "Rental Applications",
    subtitle: "Review and respond to tenant applications for your listings.",
    sidebarActive: "Applications",
  },
  agent: {
    role: "agent",
    title: "Rental Applications",
    subtitle: "Manage rental applications for assigned properties.",
    sidebarActive: "Applications",
  },
};

const RentalApplications = ({ mode }: { mode: "buyer" | "seller" | "agent" }) => {
  const { user } = useAuth();
  const config = configs[mode];
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["rental-applications", mode],
    queryFn: () => rentalApplicationService.list({ limit: 50 }),
    enabled: Boolean(user),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      statusNote,
    }: {
      id: string;
      status: RentalApplicationStatus;
      statusNote?: string;
    }) => rentalApplicationService.updateStatus(id, status, statusNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental-applications"] });
      toast.success("Application updated");
    },
    onError: (error: Error) => toast.error(error.message || "Update failed"),
  });

  const applications = data?.data || [];
  const visible =
    statusFilter === "all"
      ? applications
      : applications.filter((application) => application.status === statusFilter);

  const canManage = mode === "seller" || mode === "agent";

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active={config.sidebarActive} role={config.role} />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{config.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{config.subtitle}</p>

        <DashboardTabPills
          className="mb-6"
          activeKey={statusFilter}
          onChange={setStatusFilter}
          tabs={[
            { key: "all", label: "All", count: applications.length },
            {
              key: "pending",
              label: "Pending",
              count: applications.filter((a) => a.status === "pending").length,
            },
            {
              key: "reviewing",
              label: "Reviewing",
              count: applications.filter((a) => a.status === "reviewing").length,
            },
            {
              key: "approved",
              label: "Approved",
              count: applications.filter((a) => a.status === "approved").length,
            },
            {
              key: "rejected",
              label: "Rejected",
              count: applications.filter((a) => a.status === "rejected").length,
            },
          ]}
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="font-medium text-foreground mb-2">No applications yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {mode === "buyer"
                ? "Apply for a rental from any listing detail page."
                : "Applications will appear here when renters apply to your listings."}
            </p>
            {mode === "buyer" && (
              <Button asChild>
                <Link to="/rentals">Browse rentals</Link>
              </Button>
            )}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
            No applications in this status.
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                canManage={canManage}
                isBuyer={mode === "buyer"}
                onUpdate={(status, statusNote) =>
                  updateMutation.mutate({ id: application._id, status, statusNote })
                }
                isUpdating={updateMutation.isPending}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const ApplicationCard = ({
  application,
  canManage,
  isBuyer,
  onUpdate,
  isUpdating,
}: {
  application: RentalApplication;
  canManage: boolean;
  isBuyer: boolean;
  onUpdate: (status: RentalApplicationStatus, statusNote?: string) => void;
  isUpdating: boolean;
}) => {
  const property = application.propertyId;
  const applicant = application.buyerId;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <Link
            to={property?._id ? getPropertyDetailPath(property) : "#"}
            className="font-heading font-bold text-foreground hover:text-primary"
            onClick={(e) => {
              if (!property?._id) e.preventDefault();
            }}
          >
            {property?.title || "Rental listing"}
          </Link>
          <p className="text-sm text-primary font-medium mt-1">
            {property ? formatRentPrice(property.price) : ""}
          </p>
          {property?.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {[property.location.city, property.location.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[application.status]}`}
        >
          {application.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Applicant</p>
          <p className="font-medium">{application.fullName}</p>
          {!isBuyer && applicant && (
            <p className="text-xs text-muted-foreground">
              {applicant.firstName} {applicant.lastName}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3.5 h-3.5" /> {application.email}
          </p>
          {application.phone && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5" /> {application.phone}
            </p>
          )}
          {application.moveInDate && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Move-in {new Date(application.moveInDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {application.message && (
        <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 mb-4">
          {application.message}
        </p>
      )}

      {application.statusNote && (
        <p className="text-xs text-muted-foreground mb-4">
          Note: {application.statusNote}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canManage && application.status === "pending" && (
          <>
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => onUpdate("reviewing")}
            >
              Mark reviewing
            </Button>
            <Button
              size="sm"
              variant="default"
              disabled={isUpdating}
              onClick={() => onUpdate("approved")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => onUpdate("rejected")}
            >
              Reject
            </Button>
          </>
        )}
        {canManage && application.status === "reviewing" && (
          <>
            <Button size="sm" disabled={isUpdating} onClick={() => onUpdate("approved")}>
              Approve
            </Button>
            <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => onUpdate("rejected")}>
              Reject
            </Button>
          </>
        )}
        {isBuyer && ["pending", "reviewing"].includes(application.status) && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isUpdating}
            onClick={() => onUpdate("withdrawn")}
          >
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
};

export default RentalApplications;
