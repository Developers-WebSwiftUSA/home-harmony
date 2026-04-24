import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { propertyService } from "@/services/property.service";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";

const SellerAddListing = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    latitude: "0",
    longitude: "0",
    amenities: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const createMutation = useMutation({
    mutationFn: async () => {
      let uploadedImageUrl = "";
      if (imageFile) {
        const uploadResult = await uploadService.uploadImage(imageFile);
        uploadedImageUrl = uploadResult.data.url;
      }

      return propertyService.create({
        title: form.title,
        description: form.description,
        type: form.type,
        // Publish immediately so new listings appear on the public properties page.
        status: "active",
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        squareFeet: Number(form.squareFeet),
        location: {
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: "USA",
          coordinates: {
            type: "Point",
            coordinates: [Number(form.longitude || 0), Number(form.latitude || 0)],
          },
        },
        images: uploadedImageUrl ? [{ url: uploadedImageUrl, isPrimary: true }] : [],
        amenities: form.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] });
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard-listings"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Listing created successfully");
      navigate("/seller/listings");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="My Listings" role="seller" />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground">Add New Listing</h1>
          <p className="text-sm text-muted-foreground">Create and submit a new property listing</p>
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
              <label className="text-xs text-muted-foreground block mb-1">Type</label>
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
              <label className="text-xs text-muted-foreground block mb-1">Price</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Latitude (optional)</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Longitude (optional)</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

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

          {previewUrl ? (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Image Preview</label>
              <img
                src={previewUrl}
                alt="Selected property preview"
                className="w-full max-w-sm h-52 object-cover rounded-lg border border-border"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Listing"}
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

