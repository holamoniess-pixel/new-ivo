import { useEffect, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { sellerProductApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Package, X, ImagePlus, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: These are defined OUTSIDE the page component so React never
// unmounts/remounts them on state changes — which was causing inputs to lose
// focus after every keystroke.
// ─────────────────────────────────────────────────────────────────────────────

interface ProductForm {
  name: string; description: string; price: string;
  categoryId: string; stock: string; brand: string; discount: string;
}

const emptyForm: ProductForm = {
  name: "", description: "", price: "", categoryId: "", stock: "", brand: "", discount: "",
};

// ── Image uploader ────────────────────────────────────────────────────────────
interface ImageUploaderProps {
  previews: string[];
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
}
const ImageUploader = ({ previews, onAdd, onRemove }: ImageUploaderProps) => (
  <div className="space-y-2">
    <Label>
      Product Images
      <span className="ml-1.5 text-xs text-muted-foreground font-normal">(first = primary)</span>
    </Label>
    {previews.length > 0 ? (
      <div className="grid grid-cols-4 gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30">
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 text-[9px] font-semibold bg-primary text-primary-foreground rounded px-1 py-0.5 leading-none">
                PRIMARY
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <label className="aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/20 hover:bg-secondary/40 flex flex-col items-center justify-center cursor-pointer transition-colors">
          <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-[10px] text-muted-foreground">Add more</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onAdd} />
        </label>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-border bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors">
        <ImagePlus className="h-7 w-7 text-muted-foreground mb-1.5" />
        <p className="text-sm text-muted-foreground">Click to upload images</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">PNG, JPG, WEBP</p>
        <input type="file" accept="image/*" multiple className="hidden" onChange={onAdd} />
      </label>
    )}
  </div>
);

// ── Form fields ───────────────────────────────────────────────────────────────
interface FormFieldsProps {
  form: ProductForm;
  set: React.Dispatch<React.SetStateAction<ProductForm>>;
  categories: any[];
  showCategory?: boolean;
}
const FormFields = ({ form, set, categories, showCategory = true }: FormFieldsProps) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <Label>Name <span className="text-destructive">*</span></Label>
      <Input
        value={form.name}
        onChange={e => set(f => ({ ...f, name: e.target.value }))}
        placeholder="Product name"
      />
    </div>
    <div className="space-y-1.5">
      <Label>Description</Label>
      <Textarea
        value={form.description}
        onChange={e => set(f => ({ ...f, description: e.target.value }))}
        rows={3}
        placeholder="Describe your product..."
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Price (GHS) <span className="text-destructive">*</span></Label>
        <Input
          type="number" min="0" step="0.01"
          value={form.price}
          onChange={e => set(f => ({ ...f, price: e.target.value }))}
          placeholder="0.00"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Stock <span className="text-destructive">*</span></Label>
        <Input
          type="number" min="0"
          value={form.stock}
          onChange={e => set(f => ({ ...f, stock: e.target.value }))}
          placeholder="0"
        />
      </div>
    </div>
    {showCategory && (
      <div className="space-y-1.5">
        <Label>Category <span className="text-destructive">*</span></Label>
        <select
          value={form.categoryId}
          onChange={e => set(f => ({ ...f, categoryId: e.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select category</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    )}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Brand</Label>
        <Input
          value={form.brand}
          onChange={e => set(f => ({ ...f, brand: e.target.value }))}
          placeholder="e.g. Nike"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Discount Price (GHS)</Label>
        <Input
          type="number" min="0" step="0.01"
          value={form.discount}
          onChange={e => set(f => ({ ...f, discount: e.target.value }))}
          placeholder="Optional"
        />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SellerProductsPage = () => {
  const [products, setProducts]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  // Add
  const [showAdd, setShowAdd]         = useState(false);
  const [addForm, setAddForm]         = useState<ProductForm>(emptyForm);
  const [addImages, setAddImages]     = useState<File[]>([]);
  const [addPreviews, setAddPreviews] = useState<string[]>([]);
  const [saving, setSaving]           = useState(false);

  // Edit
  const [editProduct, setEditProduct]   = useState<any>(null);
  const [editForm, setEditForm]         = useState<ProductForm>(emptyForm);
  const [editImages, setEditImages]     = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [updating, setUpdating]         = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        sellerProductApi.getMyProducts().catch(() => []),
        sellerProductApi.getCategories().catch(() => []),
      ]);
      setProducts(Array.isArray(prods) ? prods : prods?.products ?? prods?.content ?? []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const pushImages = (
    files: FileList | null,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      setFiles(p => [...p, file]);
      const r = new FileReader();
      r.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      r.readAsDataURL(file);
    });
  };

  const popImage = (
    i: number,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const buildFD = (form: ProductForm, images: File[]) => {
    const fd = new FormData();
    const data: Record<string, any> = {
      name: form.name,
      productDescription: form.description,
      price: parseFloat(form.price),
      categoryId: form.categoryId,
      stock: parseInt(form.stock),
    };
    if (form.brand)    data.brand = form.brand;
    if (form.discount) { data.discountPrice = parseFloat(form.discount); data.isDiscounted = true; }
    else               { data.isDiscounted = false; }
    fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
    images.forEach(f => fd.append("images", f));
    return fd;
  };

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.name || !addForm.price || !addForm.stock || !addForm.categoryId) {
      toast.error("Name, Price, Stock and Category are required."); return;
    }
    setSaving(true);
    try {
      await sellerProductApi.addProduct(buildFD(addForm, addImages));
      toast.success("Product added!");
      setShowAdd(false); setAddForm(emptyForm); setAddImages([]); setAddPreviews([]);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err.message ?? "Failed to add product");
    } finally { setSaving(false); }
  };

  // ── Edit open ──────────────────────────────────────────────────────────────
  const openEdit = (p: any) => {
    setEditProduct(p);
    setEditForm({
      name: p.name ?? "",
      description: p.productDescription ?? p.description ?? "",
      price: p.price?.toString() ?? "",
      categoryId: p.categoryId ?? "",
      stock: p.stock?.toString() ?? "",
      brand: p.brand ?? "",
      discount: p.discountPrice?.toString() ?? "",
    });
    setEditImages([]);
    setEditPreviews(p.primaryImageUrl ? [p.primaryImageUrl] : []);
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!editProduct) return;
    if (!editForm.name || !editForm.price || !editForm.stock) {
      toast.error("Name, Price and Stock are required."); return;
    }
    setUpdating(true);
    try {
      await sellerProductApi.updateProduct(editProduct.id, buildFD(editForm, editImages));
      toast.success("Product updated!");
      setEditProduct(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err.message ?? "Failed to update");
    } finally { setUpdating(false); }
  };

  // ── Stock quick-edit ───────────────────────────────────────────────────────
  const handleStockBlur = async (id: string, originalStock: number, val: string) => {
    const n = parseInt(val);
    if (isNaN(n) || n === originalStock) return;
    try {
      await sellerProductApi.updateStock(id, n);
      toast.success("Stock updated");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update stock");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await sellerProductApi.deleteProduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err.message ?? "Failed to delete");
    } finally { setDeleting(false); }
  };

  // ── Status toggle ──────────────────────────────────────────────────────────
  const handleStatusToggle = async (id: string, current: string) => {
    const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await sellerProductApi.updateStatus(id, next);
      toast.success(`Status → ${next}`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update status");
    }
  };

  const noCats = categories.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SellerLayout
      title="Products"
      subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
      actions={
        <Dialog open={showAdd} onOpenChange={open => {
          setShowAdd(open);
          if (!open) { setAddForm(emptyForm); setAddImages([]); setAddPreviews([]); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={noCats} title={noCats ? "Add a category first" : ""}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <FormFields
              form={addForm}
              set={setAddForm}
              categories={categories}
            />
            <div className="mt-4">
              <ImageUploader
                previews={addPreviews}
                onAdd={e => { pushImages(e.target.files, setAddImages, setAddPreviews); e.target.value = ""; }}
                onRemove={i => popImage(i, setAddImages, setAddPreviews)}
              />
            </div>
            <Button onClick={handleAdd} disabled={saving} className="w-full mt-4">
              {saving ? "Adding..." : "Add Product"}
            </Button>
          </DialogContent>
        </Dialog>
      }
    >
      {noCats && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 mb-4 text-sm">
          ⚠️ You need to{" "}
          <a href="/seller/categories" className="underline font-medium text-primary">
            create at least one category
          </a>{" "}
          before adding products.
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="rounded-xl bg-card border border-border overflow-hidden shadow-soft flex flex-col">
              {/* Image */}
              <div className="aspect-square bg-secondary/40 overflow-hidden relative">
                {p.primaryImageUrl ? (
                  <img
                    src={p.primaryImageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                {p.isDiscounted && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">
                    SALE
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div>
                  <h3 className="text-sm font-semibold line-clamp-1">{p.name}</h3>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  {p.isDiscounted && p.discountPrice ? (
                    <>
                      <span className="font-bold text-sm text-primary">GHS {Number(p.discountPrice).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground line-through">GHS {Number(p.price).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-bold text-sm">GHS {Number(p.price).toFixed(2)}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Stock:</span>
                  <Input
                    type="number"
                    min="0"
                    defaultValue={p.stock}
                    className="h-6 w-20 text-xs px-1.5 py-0"
                    onBlur={e => handleStockBlur(p.id, p.stock, e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                  />
                </div>

                <div className="flex items-center justify-between mt-auto pt-1">
                  <button
                    onClick={() => handleStatusToggle(p.id, p.productStatus)}
                    className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      p.productStatus === "ACTIVE"
                        ? "bg-success/10 text-success hover:bg-success/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p.productStatus}
                  </button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(p)}
                      title="Edit product"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(p)}
                      title="Delete product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editProduct} onOpenChange={open => { if (!open) setEditProduct(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit — {editProduct?.name}</DialogTitle>
          </DialogHeader>
          <FormFields
            form={editForm}
            set={setEditForm}
            categories={categories}
            showCategory={false}
          />
          <div className="mt-4">
            <ImageUploader
              previews={editPreviews}
              onAdd={e => { pushImages(e.target.files, setEditImages, setEditPreviews); e.target.value = ""; }}
              onRemove={i => popImage(i, setEditImages, setEditPreviews)}
            />
          </div>
          <Button onClick={handleUpdate} disabled={updating} className="w-full mt-4">
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SellerLayout>
  );
};

export default SellerProductsPage;