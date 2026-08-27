import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Newspaper, Plus, Pencil, Trash2, Eye, Clock, CheckCircle2, Archive } from "lucide-react";
import { DashboardSidebar } from "./AdminDashboard";
import { newsService } from "@/services/news.service";
import { uploadService } from "@/services/upload.service";
import { liveQueryOptions } from "@/lib/liveQuery";
import { formatNewsDateTime, resolveNewsImage, toDatetimeLocalValue } from "@/lib/newsDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getDisplayName } from "@/lib/userDisplay";
import type { NewsArticle, NewsPayload, NewsStatus } from "@/types/news";

const CATEGORIES = ["Market", "Tips", "Selling", "Buying", "Travel", "Technology", "Finance", "Platform", "News"];

type FormState = {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  authorName: string;
  mode: "now" | "schedule";
  scheduledAt: string;
};

const emptyForm = (authorName: string): FormState => ({
  title: "",
  excerpt: "",
  content: "",
  image: "",
  category: "Market",
  authorName,
  mode: "now",
  scheduledAt: "",
});

const formFromArticle = (article: NewsArticle, authorName: string): FormState => ({
  title: article.title,
  excerpt: article.excerpt,
  content: article.content || "",
  image: article.image || "",
  category: article.category || "News",
  authorName: article.authorName || authorName,
  mode: article.status === "scheduled" ? "schedule" : "now",
  scheduledAt: toDatetimeLocalValue(article.publishedAt),
});

const toPayload = (form: FormState, existing?: NewsArticle | null): NewsPayload => ({
  title: form.title.trim(),
  excerpt: form.excerpt.trim(),
  content: form.content.trim(),
  image: form.image.trim(),
  category: form.category.trim() || "News",
  authorName: form.authorName.trim() || "Admin",
  publishNow: form.mode === "now" && existing?.status !== "active",
  scheduledAt: form.mode === "schedule" ? new Date(form.scheduledAt).toISOString() : undefined,
});

type PillKey = "all" | "active" | "scheduled" | "archived";

const AdminNews = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get("status") as PillKey) || "all";
  const defaultAuthor = getDisplayName(user) || "Admin";

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(defaultAuthor));
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: () => newsService.adminList({ limit: 200 }),
    enabled: isAuthenticated,
    ...liveQueryOptions,
  });

  const articles = data?.data || [];
  const statusCounts = data?.statusCounts || {};

  const stats = {
    all: statusCounts.all ?? articles.length,
    active: statusCounts.active ?? articles.filter((a) => a.status === "active").length,
    scheduled: statusCounts.scheduled ?? articles.filter((a) => a.status === "scheduled").length,
    archived: statusCounts.archived ?? articles.filter((a) => a.status === "archived").length,
  };

  const visible = useMemo(() => {
    if (statusFilter === "all") return articles;
    return articles.filter((a) => a.status === statusFilter);
  }, [articles, statusFilter]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    queryClient.invalidateQueries({ queryKey: ["public-news"] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: NewsPayload) =>
      editing ? newsService.update(editing._id, payload) : newsService.create(payload),
    onSuccess: () => {
      toast.success(editing ? "News updated" : "News published");
      closeForm();
      refresh();
    },
    onError: (error: Error) => toast.error(error.message || "Could not save news"),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => newsService.publish(id),
    onSuccess: () => {
      toast.success("News is now active");
      refresh();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => newsService.archive(id),
    onSuccess: () => {
      toast.success("News archived");
      refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.remove(id),
    onSuccess: () => {
      toast.success("News deleted");
      refresh();
    },
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm(defaultAuthor));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(defaultAuthor));
    setFormOpen(true);
  };

  const openEdit = (article: NewsArticle) => {
    setEditing(article);
    setForm(formFromArticle(article, defaultAuthor));
    setFormOpen(true);
  };

  const setStatusFilter = (value: PillKey) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    setSearchParams(next, { replace: true });
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, excerpt, and content are required");
      return;
    }
    if (form.mode === "schedule") {
      if (!form.scheduledAt) {
        toast.error("Choose a date and time to schedule this article");
        return;
      }
      const when = new Date(form.scheduledAt);
      if (Number.isNaN(when.getTime())) {
        toast.error("Please provide a valid schedule date");
        return;
      }
    }
    saveMutation.mutate(toPayload(form, editing));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      if (result.data?.url) {
        setForm((prev) => ({ ...prev, image: result.data.url }));
        toast.success("Image uploaded");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const pills: { key: PillKey; label: string; count: number; className: string; valueClass: string }[] = [
    {
      key: "all",
      label: "All News",
      count: stats.all,
      className: "bg-card border border-border",
      valueClass: "text-foreground",
    },
    {
      key: "active",
      label: "Active",
      count: stats.active,
      className: "bg-green-500/10 border border-green-500/20",
      valueClass: "text-green-600",
    },
    {
      key: "scheduled",
      label: "Scheduled",
      count: stats.scheduled,
      className: "bg-blue-500/10 border border-blue-500/20",
      valueClass: "text-blue-600",
    },
    {
      key: "archived",
      label: "Archived",
      count: stats.archived,
      className: "bg-gray-500/10 border border-gray-500/20",
      valueClass: "text-gray-600",
    },
  ];

  const statusBadge = (status: NewsStatus) => {
    if (status === "active") return "bg-green-50 text-green-700";
    if (status === "scheduled") return "bg-blue-50 text-blue-700";
    if (status === "archived") return "bg-gray-100 text-gray-700";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="News" role="admin" />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" />
              News
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Publish live articles or schedule them to go live later. Active news appears on the public site.
            </p>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Add News
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {pills.map((pill) => {
            const isSelected = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={cn(
                  "rounded-xl p-4 text-left transition-all cursor-pointer hover:opacity-90",
                  pill.className,
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-muted"
                )}
              >
                <div className={cn("text-2xl font-bold", pill.valueClass)}>{pill.count}</div>
                <div className={cn("text-sm", pill.valueClass === "text-foreground" ? "text-muted-foreground" : pill.valueClass)}>
                  {pill.label}
                </div>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading news...</p>
        ) : visible.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Newspaper className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No {statusFilter === "all" ? "" : `${statusFilter} `}news yet.
            </p>
            <Button onClick={openCreate}>Add your first article</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((article) => (
              <div key={article._id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <img
                  src={resolveNewsImage(article.image)}
                  alt=""
                  className="w-28 h-20 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-foreground truncate">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0", statusBadge(article.status))}>
                      {article.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span>{article.category || "News"}</span>
                    <span className="flex items-center gap-1">
                      {article.status === "scheduled" ? (
                        <Clock className="w-3 h-3" />
                      ) : article.status === "archived" ? (
                        <Archive className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {article.status === "scheduled"
                        ? "Goes live"
                        : article.status === "archived"
                          ? "Archived"
                          : "Published"}{" "}
                      {formatNewsDateTime(article.publishedAt)}
                    </span>
                    <span>By {article.authorName || "Admin"}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {article.status === "active" && (
                      <Link to={`/news/${article.slug}`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                      </Link>
                    )}
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openEdit(article)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    {article.status !== "active" && (
                      <Button
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => publishMutation.mutate(article._id)}
                        disabled={publishMutation.isPending}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Publish now
                      </Button>
                    )}
                    {article.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1"
                        onClick={() => archiveMutation.mutate(article._id)}
                      >
                        <Archive className="w-3.5 h-3.5" /> Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive hover:text-destructive gap-1"
                      onClick={() => {
                        if (window.confirm(`Delete “${article.title}”?`)) deleteMutation.mutate(article._id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={formOpen} onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit news" : "Add news"}</DialogTitle>
            <DialogDescription>
              Active articles appear immediately. Scheduled articles go live at the time you choose.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="news-title">Title</Label>
              <Input
                id="news-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Market update for this week"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="news-category">Category</Label>
                <select
                  id="news-category"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="news-author">Author</Label>
                <Input
                  id="news-author"
                  value={form.authorName}
                  onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="news-excerpt">Excerpt</Label>
              <Textarea
                id="news-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short summary shown on cards"
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="news-content">Full article</Label>
              <Textarea
                id="news-content"
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write the full news article..."
                className="mt-1 min-h-[180px]"
              />
            </div>
            <div>
              <Label>Cover image</Label>
              <div className="mt-1 flex flex-col gap-2">
                {form.image ? (
                  <img src={resolveNewsImage(form.image)} alt="" className="h-32 w-full object-cover rounded-md border border-border" />
                ) : null}
                <Input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="Image URL or upload a file"
                />
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                  }}
                />
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-foreground">When to publish</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="publish-mode"
                  checked={form.mode === "now"}
                  onChange={() => setForm((p) => ({ ...p, mode: "now" }))}
                />
                Publish now (Active)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="publish-mode"
                  checked={form.mode === "schedule"}
                  onChange={() => setForm((p) => ({ ...p, mode: "schedule" }))}
                />
                Schedule for later
              </label>
              {form.mode === "schedule" && (
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saveMutation.isPending || uploading}>
                {saveMutation.isPending ? "Saving..." : editing ? "Save changes" : form.mode === "schedule" ? "Schedule" : "Publish"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNews;
