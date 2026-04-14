import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sellerProductApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import SellerDashboardSkeleton from "@/components/SellerDashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Package, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SellerDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const isLoading = authLoading;
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", stock: "", brand: "", discount: "" });
  const [images, setImages] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }
    try {
      const [prods, cats] = await Promise.all([sellerProductApi.getMyProducts(), sellerProductApi.getCategories()]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isLoading && user) { fetchData(); }
    else if (!isLoading && !user) { setLoading(false); }
  }, [isLoading, user]);

  const handleAddProduct = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const data = {
        name: form.name, description: form.description,
        price: parseFloat(form.price), categoryId: form.categoryId,
        stock: parseInt(form.stock), brand: form.brand || undefined,
        discount: form.discount ? parseFloat(form.discount) : undefined,
      };
      fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
      if (images) { Array.from(images).forEach(f => fd.append("images", f)); }
      await sellerProductApi.addProduct(fd);
      toast.success("Product added!");
      setShowAdd(false);
      setForm({ name: "", description: "", price: "", categoryId: "", stock: "", brand: "", discount: "" });
      fetchData();
    } catch (err: any) { toast.error(err.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await sellerProductApi.deleteProduct(id); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Failed"); }
  };

  if (loading) return <SellerDashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-satoshi text-2xl font-bold">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.fullName}</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Price</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="">Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Brand</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Discount %</Label><Input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
                </div>
                <div className="space-y-2"><Label>Images</Label><Input type="file" accept="image/*" multiple onChange={e => setImages(e.target.files)} /></div>
                <Button onClick={handleAddProduct} disabled={saving} className="w-full">{saving ? "Adding..." : "Add Product"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No products yet. Add your first product!</p>
            </div>
          ) : products.map((p: any) => (
            <div key={p.id} className="rounded-xl bg-card p-4 shadow-soft">
              <div className="aspect-square overflow-hidden rounded-lg bg-secondary/50 mb-3">
                {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />}
              </div>
              <h3 className="text-sm font-medium line-clamp-1">{p.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold">GHS {p.price?.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
