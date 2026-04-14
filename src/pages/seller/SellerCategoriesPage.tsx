import { useEffect, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { sellerProductApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FolderOpen, Edit } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SellerCategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const cats = await sellerProductApi.getCategories();
      setCategories(cats || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("data", new Blob([JSON.stringify({ name, description })], { type: "application/json" }));
      if (icon) fd.append("icon", icon);
      await sellerProductApi.createCategory(fd);
      toast.success("Category created!");
      setShowAdd(false);
      setName("");
      setDescription("");
      setIcon(null);
      fetchCategories();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products in this category may be affected.")) return;
    try { await sellerProductApi.deleteCategory(id); toast.success("Deleted"); fetchCategories(); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <SellerLayout
      title="Categories"
      subtitle="Manage your product categories. Add categories before adding products."
      actions={
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Electronics" /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" /></div>
              <div className="space-y-2"><Label>Icon Image</Label><Input type="file" accept="image/*" onChange={e => setIcon(e.target.files?.[0] || null)} /></div>
              <Button onClick={handleAdd} disabled={saving} className="w-full">{saving ? "Creating..." : "Create Category"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">No categories yet.</p>
          <p className="text-sm text-muted-foreground">Create your first category to start adding products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((c: any) => (
            <div key={c.id} className="rounded-xl bg-card p-4 shadow-soft border border-border flex items-start justify-between">
              <div className="flex items-center gap-3">
                {c.iconUrl ? (
                  <img src={c.iconUrl} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium">{c.name}</h3>
                  {c.description && <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => handleDelete(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </SellerLayout>
  );
};

export default SellerCategoriesPage;
