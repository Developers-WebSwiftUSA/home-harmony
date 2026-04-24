import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "./AdminDashboard";
import { propertyService } from "@/services/property.service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, CheckCircle, XCircle, Clock, Trash2, Eye } from "lucide-react";
import property1 from "@/assets/property-1.jpg";

const AdminPropertyReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-property", id],
    queryFn: () => propertyService.getById(id!, false), // Public endpoint, no auth needed
    enabled: !!id,
  });

  const property = data?.data;

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "House",
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    status: "pending",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    amenities: "",
  });

  // Update form when property loads
  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || "",
        description: property.description || "",
        type: property.type || "House",
        price: property.price || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        squareFeet: property.squareFeet || 0,
        status: property.status || "pending",
        address: property.location?.address || "",
        city: property.location?.city || "",
        state: property.location?.state || "",
        zipCode: property.location?.zipCode || "",
        amenities: property.amenities?.join(", ") || "",
      });
    }
  }, [property]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => propertyService.update(id!, payload),
    onSuccess: () => {
      toast.success("Property updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-property", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => propertyService.approve(id!),
    onSuccess: () => {
      toast.success("Property approved");
      queryClient.invalidateQueries({ queryKey: ["admin-property", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => propertyService.reject(id!),
    onSuccess: () => {
      toast.success("Property rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-property", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const pendingMutation = useMutation({
    mutationFn: () => propertyService.update(id!, { status: "pending" }),
    onSuccess: () => {
      toast.success("Property marked under approval");
      queryClient.invalidateQueries({ queryKey: ["admin-property", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertyService.remove(id!),
    onSuccess: () => {
      toast.success("Property deleted");
      navigate("/admin/properties");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationPayload: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: { type: string; coordinates: [number, number] };
    } = {
      address: form.address,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      country: "USA",
    };
    // Preserve existing coordinates when editing (they are optional)
    if (property.location?.coordinates?.coordinates?.length === 2) {
      locationPayload.coordinates = {
        type: "Point",
        coordinates: property.location.coordinates.coordinates as [number, number],
      };
    }
    updateMutation.mutate({
      title: form.title,
      description: form.description,
      type: form.type,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      squareFeet: Number(form.squareFeet),
      status: form.status,
      location: locationPayload,
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="Properties" role="admin" />
        <main className="flex-1 ml-64 p-8">
          <p className="text-sm text-muted-foreground">Loading property...</p>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="Properties" role="admin" />
        <main className="flex-1 ml-64 p-8">
          <p className="text-sm text-muted-foreground">Property not found</p>
          <Link to="/admin/properties">
            <Button variant="outline" className="mt-4">
              Back to Properties
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Properties" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/properties">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Review Property</h1>
            <p className="text-sm text-muted-foreground">Edit and manage property details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Image */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Property Image</h2>
              <img
                src={property.images?.[0]?.url || property1}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  >
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Commercial</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={(e) => setForm((p) => ({ ...p, bedrooms: Number(e.target.value) }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={form.bathrooms}
                    onChange={(e) => setForm((p) => ({ ...p, bathrooms: Number(e.target.value) }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Square Feet</label>
                  <input
                    type="number"
                    min="0"
                    value={form.squareFeet}
                    onChange={(e) => setForm((p) => ({ ...p, squareFeet: Number(e.target.value) }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Zip Code</label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={form.amenities}
                  onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                  placeholder="Parking, Gym, Elevator"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="inactive">Inactive</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
                <Link to={`/properties/${id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" /> View Public Page
                  </Button>
                </Link>
              </div>
            </form>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start gap-2"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending || property.status === "active"}
                >
                  <CheckCircle className="w-4 h-4" /> Approve Property
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => pendingMutation.mutate()}
                  disabled={pendingMutation.isPending || property.status === "pending"}
                >
                  <Clock className="w-4 h-4" /> Mark Under Approval
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (window.confirm("Reject this property?")) {
                      rejectMutation.mutate();
                    }
                  }}
                  disabled={rejectMutation.isPending || property.status === "rejected"}
                >
                  <XCircle className="w-4 h-4" /> Reject Property
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (window.confirm("Delete this property permanently? This action cannot be undone.")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" /> Delete Property
                </Button>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-foreground mb-4">Property Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Property ID:</span>
                  <p className="text-foreground font-mono text-xs">{property._id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-foreground capitalize">{property.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Views:</span>
                  <p className="text-foreground">{property.views || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Inquiries:</span>
                  <p className="text-foreground">{property.inquiries || 0}</p>
                </div>
                {property.sellerId && (
                  <div>
                    <span className="text-muted-foreground">Seller:</span>
                    <p className="text-foreground">
                      {property.sellerId.firstName} {property.sellerId.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{property.sellerId.email}</p>
                  </div>
                )}
                {property.createdAt && (
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="text-foreground">{new Date(property.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPropertyReview;
