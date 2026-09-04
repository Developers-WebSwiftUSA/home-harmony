import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { PropertyLocationPicker } from "@/components/PropertyLocationPicker";
import { buildListingLocation } from "@/lib/listingLocation";
import { propertyService } from "@/services/property.service";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";

const SellerAddListing = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ["seller-listing", id],
    queryFn: () => propertyService.getById(id!, true),
    enabled: isEditing,
  });

  const existing = existingData?.data;
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "House",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    amenities: "",
    listingType: "sale",
    furnished: false,
    petPolicy: "negotiable",
    petFee: "",
    laundry: "none",
    deposit: "",
    availabilityDate: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");

  useEffect(() => {
    if (!existing) return;
    const coords = existing.location?.coordinates?.coordinates;
    setForm({
      title: existing.title || "",
      description: existing.description || "",
      type: existing.type || "House",
      price: String(existing.price ?? ""),
      bedrooms: String(existing.bedrooms ?? ""),
      bathrooms: String(existing.bathrooms ?? ""),
      squareFeet: String(existing.squareFeet ?? ""),
      address: existing.location?.address || "",
      city: existing.location?.city || "",
      state: existing.location?.state || "",
      zipCode: existing.location?.zipCode || "",
      latitude: coords?.[1] != null ? String(coords[1]) : "",
      longitude: coords?.[0] != null ? String(coords[0]) : "",
      amenities: existing.amenities?.join(", ") || "",
      listingType: existing.listingType || "sale",
      furnished: existing.rentalDetails?.furnished ?? false,
      petPolicy: existing.rentalDetails?.petPolicy || "negotiable",
      petFee: existing.rentalDetails?.petFee ? String(existing.rentalDetails.petFee) : "",
      laundry: existing.rentalDetails?.laundry || "none",
      deposit: existing.rentalDetails?.deposit ? String(existing.rentalDetails.deposit) : "",
      availabilityDate: existing.availabilityDate
        ? new Date(existing.availabilityDate).toISOString().slice(0, 10)
        : "",
    });
    setExistingImageUrl(existing.images?.[0]?.url || "");
  }, [existing]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewUrl("");
  }, [imageFile]);

  const buildPayload = async () => {
    let uploadedImageUrl = existingImageUrl;
    if (imageFile) {
      const uploadResult = await uploadService.uploadImage(imageFile);
      uploadedImageUrl = uploadResult.data.url;
    }

    const petDetails = {
      petPolicy: form.petPolicy as "allowed" | "not_allowed" | "negotiable",
      petFee: form.petFee ? Number(form.petFee) : 0,
    };

    return {
      title: form.title,
      description: form.description,
      type: form.type,
      listingType: form.listingType as "sale" | "rent" | "both",
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      squareFeet: Number(form.squareFeet),
      availabilityDate: form.availabilityDate || undefined,
      rentalDetails:
        form.listingType === "rent" || form.listingType === "both"
          ? {
              deposit: form.deposit ? Number(form.deposit) : 0,
              furnished: form.furnished,
              laundry: form.laundry as "in_unit" | "shared" | "none",
              acceptsApplications: true,
              ...petDetails,
            }
          : petDetails,
      location: buildListingLocation(form),
      images: uploadedImageUrl ? [{ url: uploadedImageUrl, isPrimary: true }] : [],
      amenities: form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
  };

  const invalidateListingQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
    queryClient.invalidateQueries({ queryKey: ["seller-dashboard-listings"] });
    queryClient.invalidateQueries({ queryKey: ["properties"] });
    queryClient.invalidateQueries({ queryKey: ["rentals"] });
    if (id) queryClient.invalidateQueries({ queryKey: ["seller-listing", id] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = await buildPayload();
      if (isEditing && id) {
        const nextStatus = existing?.status === "rejected" ? "pending" : existing?.status || "pending";
        return propertyService.update(id, { ...payload, status: nextStatus });
      }
      return propertyService.create({ ...payload, status: "pending" });
    },
    onSuccess: () => {
      invalidateListingQueries();
      toast.success(
        isEditing
          ? existing?.status === "rejected"
            ? "Listing resubmitted for admin approval"
            : "Listing updated successfully"
          : "Listing submitted for admin approval"
      );
      navigate("/seller/listings");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const addressQuery = [form.address, form.city, form.state, form.zipCode].filter(Boolean).join(", ");
  const displayImage = previewUrl || existingImageUrl;

  if (isEditing && loadingExisting) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="My Listings" role="seller" />
        <main className="flex-1 ml-64 p-8">
          <p className="text-sm text-muted-foreground">Loading listing...</p>
        </main>
      </div>
    );
  }

  if (isEditing && !loadingExisting && !existing) {
    return (
      <div className="min-h-screen bg-muted flex">
        <DashboardSidebar active="My Listings" role="seller" />
        <main className="flex-1 ml-64 p-8">
          <p className="text-sm text-muted-foreground mb-4">Listing not found.</p>
          <Button onClick={() => navigate("/seller/listings")}>Back to listings</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="My Listings" role="seller" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Update your property listing details" : "Create and submit a new property listing"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Listing type</label>
              <select
                value={form.listingType}
                onChange={(e) => setForm((p) => ({ ...p, listingType: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="both">Sale & Rent</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Property type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
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

          {(form.listingType === "rent" || form.listingType === "both") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Deposit ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.deposit}
                  onChange={(e) => setForm((p) => ({ ...p, deposit: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Available from</label>
                <input
                  type="date"
                  value={form.availabilityDate}
                  onChange={(e) => setForm((p) => ({ ...p, availabilityDate: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Laundry</label>
                <select
                  value={form.laundry}
                  onChange={(e) => setForm((p) => ({ ...p, laundry: e.target.value }))}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="none">None</option>
                  <option value="in_unit">In-unit</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input
                  type="checkbox"
                  checked={form.furnished}
                  onChange={(e) => setForm((p) => ({ ...p, furnished: e.target.checked }))}
                />
                Furnished
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Pet policy</label>
              <select
                value={form.petPolicy}
                onChange={(e) => setForm((p) => ({ ...p, petPolicy: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="allowed">Pets allowed</option>
                <option value="negotiable">Pets negotiable</option>
                <option value="not_allowed">No pets</option>
              </select>
            </div>
            {(form.listingType === "rent" || form.listingType === "both") && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Monthly pet fee ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.petFee}
                  onChange={(e) => setForm((p) => ({ ...p, petFee: e.target.value }))}
                  placeholder="0"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                {form.listingType === "rent" ? "Monthly rent ($)" : "Price ($)"}
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bedrooms</label>
              <input
                required
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(e) => setForm((p) => ({ ...p, bedrooms: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bathrooms</label>
              <input
                required
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(e) => setForm((p) => ({ ...p, bathrooms: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Square Feet</label>
              <input
                required
                type="number"
                min="0"
                value={form.squareFeet}
                onChange={(e) => setForm((p) => ({ ...p, squareFeet: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Address</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">City</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">State</label>
              <input
                required
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Zip Code</label>
              <input
                value={form.zipCode}
                onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <PropertyLocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            addressQuery={addressQuery}
            onChange={({ latitude, longitude }) =>
              setForm((prev) => ({ ...prev, latitude, longitude }))
            }
            onPlaceSelect={(place) =>
              setForm((prev) => ({
                ...prev,
                address: place.address || place.label || prev.address,
                city: place.city || prev.city,
                state: place.state || prev.state,
                zipCode: place.zipCode || prev.zipCode,
              }))
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Property Image (from your PC)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Max 5MB. JPG/PNG/WebP recommended.</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Amenities (comma separated)</label>
              <input
                value={form.amenities}
                onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Parking, Gym, Elevator"
              />
            </div>
          </div>

          {displayImage ? (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Image Preview</label>
              <img
                src={displayImage}
                alt="Property preview"
                className="w-full max-w-sm h-52 object-cover rounded-lg border border-border"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? isEditing
                  ? "Saving..."
                  : "Submitting..."
                : isEditing
                  ? existing?.status === "rejected"
                    ? "Resubmit for Approval"
                    : "Save Changes"
                  : "Submit for Approval"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/seller/listings")}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SellerAddListing;

