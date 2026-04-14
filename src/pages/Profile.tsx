import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProfileSkeleton from "@/components/ProfileSkeleton";
import SkeletonList from "@/components/SkeletonList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { userApi, productRequestApi, userProductApi } from "@/lib/api";
import { Loader2, Camera, Edit2, X, Check, Mail, Phone, MapPin, CreditCard, Lock, Send, Upload, RefreshCw, Package, ShoppingBag, Clock, CheckCircle, XCircle, Shield, Plus, FileText, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";

type Tab = "profile" | "request" | "my-requests" | "my-products";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type RequestStep = "pay" | "submit" | "done";

interface ProductRequest {
  id: string; paid: boolean; amount: number;
  paystackReference: string; approvalStatus: ApprovalStatus;
  hasProduct: boolean; createdAt: string; updatedAt: string;
}

interface UserProduct {
  id: string; name: string; brand: string; productDescription: string;
  approvalStatus: ApprovalStatus; updateCount: number;
  images: { id: number; imageUrl: string; displayOrder: number }[];
  createdAt: string;
}

interface RequestProductResponse {
  userId: string; name: string; email: string;
  productResponse: UserProduct | null; payload: ProductRequest | null;
}

const statusMeta: Record<ApprovalStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  PENDING:  { label: "Pending",  icon: <Clock size={11} />,  classes: "bg-orange-50 text-orange-700 border-orange-200" },
  APPROVED: { label: "Approved", icon: <CheckCircle size={11} />, classes: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "Rejected", icon: <XCircle size={11} />, classes: "bg-red-50 text-red-700 border-red-200" },
};

const StatusPill = ({ status }: { status: ApprovalStatus }) => {
  const m = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.classes}`}>
      {m.icon}
      {m.label}
    </span>
  );
};

const ProfileTab = ({ user, refreshProfile }: { user: any; refreshProfile: () => Promise<void> }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || "", phoneNumber: user?.phoneNumber || "", location: user?.location || "", bio: user?.bio || "" });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName || "", phoneNumber: user.phoneNumber || "", location: user.location || "", bio: user.bio || "" });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("data", new Blob([JSON.stringify(form)], { type: "application/json" }));
      if (profilePic) fd.append("profilePic", profilePic);
      await userApi.updateProfile(fd);
      await refreshProfile();
      setEditing(false); setPicPreview(null); setProfilePic(null);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const onPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setProfilePic(f);
    if (f) setPicPreview(URL.createObjectURL(f));
  };

  return (
    <div className="h-card">
      <div className="h-24 bg-gradient-to-br from-primary to-orange-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-end justify-between mt-[-40px] mb-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-orange-50 flex items-center justify-center shadow-card">
              {picPreview ? <img src={picPreview} className="w-full h-full object-cover" alt="preview" />
                : user?.profilePic?.imageUrl ? <img src={user.profilePic.imageUrl} className="w-full h-full object-cover" alt="avatar" />
                : <span className="font-satoshi text-3xl font-extrabold text-primary">{user?.fullName?.charAt(0) || "U"}</span>}
            </div>
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-2 border-white flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors">
                <Camera size={13} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={onPicChange} />
              </label>
            )}
          </div>

          {!editing ? (
            <button onClick={() => setEditing(true)} className="h-btn-outline text-xs flex items-center gap-1.5">
              <Edit2 size={14} /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditing(false); setPicPreview(null); setProfilePic(null); }} className="h-btn-outline text-xs text-slate-400 flex items-center gap-1.5">
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="h-btn-primary text-xs flex items-center gap-1.5">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Save
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <div>
            <h2 className="font-satoshi text-xl font-extrabold text-heading-umber">{user?.fullName}</h2>
            <p className="text-sm text-slate-400 mt-1 mb-4">{user?.bio || <em className="text-slate-300">No bio yet</em>}</p>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Mail size={15} className="text-primary" />, val: user?.email },
                { icon: <Phone size={15} className="text-primary" />, val: user?.phoneNumber || "—" },
                { icon: <MapPin size={15} className="text-primary" />, val: user?.location || "—" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  {f.icon}
                  <span className="text-sm text-slate-500">{f.val}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name", key: "fullName" },
              { label: "Phone Number", key: "phoneNumber" },
              { label: "Location", key: "location" },
            ].map(({ label, key }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</Label>
                <Input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="h-input" />
              </div>
            ))}
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                placeholder="Tell us about yourself..." className="h-textarea" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RequestProductTab = () => {
  const [step, setStep] = useState<RequestStep>("pay");
  const [paying, setPaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paidRequestId, setPaidRequestId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ name: "", brand: "", productDescription: "" });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference");
    if (ref) {
      (async () => {
        try {
          const res = await productRequestApi.verifyPayment(ref);
          if (res?.paid) {
            setPaidRequestId(res.productRequestId);
            setStep("submit");
            toast.success("Payment verified! Submit your product.");
            window.history.replaceState({}, "", window.location.pathname);
          }
        } catch { toast.error("Could not verify payment. Contact support."); }
      })();
    }
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await productRequestApi.initiatePayment();
      if (res?.authorizationUrl) window.location.href = res.authorizationUrl;
    } catch { toast.error("Failed to initiate payment. Try again."); }
    finally { setPaying(false); }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, j) => j !== i));
    setImagePreviews(prev => prev.filter((_, j) => j !== i));
  };

  const handleSubmit = async () => {
    if (!paidRequestId) return toast.error("No verified payment found.");
    if (!productForm.name.trim()) return toast.error("Product name is required.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("product", new Blob([JSON.stringify(productForm)], { type: "application/json" }));
      images.forEach(img => fd.append("images", img));
      await userProductApi.create(paidRequestId, fd);
      setStep("done");
      toast.success("Product submitted for review!");
    } catch { toast.error("Submission failed. Try again."); }
    finally { setSubmitting(false); }
  };

  const steps = [
    { key: "pay",    label: "Pay Fee",       icon: <CreditCard size={18} />,   desc: "₵100 via Paystack" },
    { key: "submit", label: "Submit Product", icon: <Package size={18} />,      desc: "Name, brand, images" },
    { key: "done",   label: "Await Approval", icon: <Shield size={18} />,       desc: "Admin reviews listing" },
  ];
  const stepIdx = { pay: 0, submit: 1, done: 2 }[step];

  return (
    <div className="flex flex-col gap-4">
      <div className="h-card p-5">
        <div className="flex items-start">
          {steps.map((s, i) => (
            <div key={s.key} className="flex-1 flex items-start">
              <div className="flex flex-col items-center min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg transition-all duration-200
                  ${i < stepIdx ? "bg-primary text-white" : i === stepIdx ? "bg-orange-50 text-primary border-2 border-primary" : "bg-slate-100 text-slate-300"}`}>
                  {i < stepIdx ? <Check size={17} /> : s.icon}
                </div>
                <p className={`text-[11px] font-bold mt-2 text-center ${i === stepIdx ? "text-primary" : "text-slate-300"}`}>{s.label}</p>
                <p className="text-[10px] text-slate-400 text-center mt-0.5">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mt-5 mx-1.5 rounded ${i < stepIdx ? "bg-primary" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === "pay" && (
        <div className="h-card p-6">
          <div className="border-2 border-dashed border-orange-200 bg-orange-50 rounded-2xl p-10 text-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard size={28} className="text-primary" />
            </div>
            <p className="text-[42px] font-satoshi font-extrabold text-primary leading-none">₵100</p>
            <p className="text-sm text-slate-500 mt-2 mb-6">One-time product listing fee</p>
            <p className="text-xs text-slate-400 mb-6 max-w-[280px] mx-auto">
              You'll be redirected to Paystack to pay securely. Once confirmed, you can submit your product details.
            </p>
            <button onClick={handlePay} disabled={paying} className="h-btn-primary inline-flex items-center gap-2">
              {paying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {paying ? "Redirecting…" : "Pay with Paystack"}
            </button>
          </div>
          <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3">
            <Shield size={17} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Refunds are only available within <strong>7 days</strong> of payment per our refund policy.
            </p>
          </div>
        </div>
      )}

      {step === "submit" && (
        <div className="h-card p-6 flex flex-col gap-4">
          <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <CheckCircle size={17} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-800 leading-relaxed">
              Payment verified! You can update this listing up to <strong>3 times</strong> after submission.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Product Name", key: "name", placeholder: "e.g. Sony WH-1000XM5" }, { label: "Brand", key: "brand", placeholder: "e.g. Sony" }].map(({ label, key, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</Label>
                <Input value={(productForm as any)[key]} onChange={e => setProductForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="h-input" />
              </div>
            ))}
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Product Description</Label>
              <Textarea value={productForm.productDescription} onChange={e => setProductForm(f => ({ ...f, productDescription: e.target.value }))} rows={3}
                placeholder="Describe specs, condition, why you want it listed…" className="h-textarea" />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Product Images</Label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group"
                      onMouseEnter={e => (e.currentTarget.querySelector(".del-btn") as HTMLElement)!.style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget.querySelector(".del-btn") as HTMLElement)!.style.opacity = "0"}>
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <button className="del-btn absolute inset-0 bg-black/50 opacity-0 border-none cursor-pointer flex items-center justify-center transition-opacity duration-150"
                        onClick={() => removeImage(i)}>
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-orange-200 rounded-xl p-7 text-center cursor-pointer hover:border-primary hover:bg-orange-50/50 transition-colors">
                <Upload size={30} className="text-orange-300 mx-auto mb-2 block" />
                <p className="text-sm text-slate-400">Drop images or <span className="text-primary font-semibold">browse</span></p>
                <p className="text-[11px] text-slate-300 mt-1">PNG, JPG — up to 5MB each</p>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onImageChange} />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="h-btn-primary flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? "Submitting…" : "Submit Product Request"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="h-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Shield size={34} className="text-primary" />
          </div>
          <h3 className="font-satoshi text-lg font-extrabold text-heading-umber mb-2">Product Submitted!</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-[320px] mx-auto leading-relaxed">
            Your product has been submitted for review. Check <strong>My Requests</strong> for updates.
          </p>
          <button onClick={() => setStep("pay")} className="h-btn-outline text-sm inline-flex items-center gap-2">
            <RefreshCw size={15} /> Submit Another
          </button>
        </div>
      )}
    </div>
  );
};

const MyRequestsTab = () => {
  const [requests, setRequests] = useState<RequestProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userProductApi.getMyRequests(page, 10);
      setRequests(res?.content || []);
      setTotalPages(res?.totalPages || 1);
    } catch { toast.error("Failed to load requests"); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-4"><SkeletonList count={5} /></div>;

  if (!requests.length) return (
    <div className="h-card p-16 text-center">
      <FileText size={46} className="text-slate-200 mx-auto mb-3 block" />
      <p className="font-bold text-slate-300">No requests yet</p>
      <p className="text-xs text-slate-300 mt-1">Your submitted product requests will appear here</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {requests.map(r => {
        const p = r.payload;
        const prod = r.productResponse;
        const status: ApprovalStatus = p?.approvalStatus || "PENDING";
        return (
          <div key={p?.id} className="h-card p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-heading-umber truncate">{prod?.name || "Product Pending Submission"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {prod?.brand && <span className="mr-2">{prod.brand}</span>}
                {p?.createdAt && new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {prod && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Updates used: <span className={`font-bold ${prod.updateCount >= 3 ? "text-red-500" : "text-primary"}`}>{prod.updateCount} / 3</span>
                  {prod.updateCount >= 3 && <span className="text-red-300 ml-1.5">· Max reached</span>}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <StatusPill status={status} />
              <p className="text-[10px] text-slate-300">
                {p?.updatedAt ? `Updated ${new Date(p.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "Awaiting review"}
              </p>
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-btn-outline text-xs px-4 py-2">
            <ChevronLeft size={14} className="inline mr-1" /> Prev
          </button>
          <span className="text-xs text-slate-400">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-btn-outline text-xs px-4 py-2">
            Next <ChevronRight size={14} className="inline ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

const MyProductsTab = () => {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApprovalStatus | "ALL">("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", brand: "", productDescription: "" });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (filter === "ALL") {
        const [p, a, r] = await Promise.allSettled([
          userProductApi.getMyProductsByStatus("PENDING", 0, 50),
          userProductApi.getMyProductsByStatus("APPROVED", 0, 50),
          userProductApi.getMyProductsByStatus("REJECTED", 0, 50),
        ]);
        const all: UserProduct[] = [];
        [p, a, r].forEach(result => { if (result.status === "fulfilled") all.push(...(result.value?.content || [])); });
        setProducts(all);
      } else {
        const res = await userProductApi.getMyProductsByStatus(filter, 0, 50);
        setProducts(res?.content || []);
      }
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: UserProduct) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, brand: p.brand, productDescription: p.productDescription });
    setNewImages([]);
  };

  const handleUpdate = async (productId: string) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("product", new Blob([JSON.stringify({ ...editForm, imageIdsToDelete: [] })], { type: "application/json" }));
      newImages.forEach(img => fd.append("images", img));
      await userProductApi.update(productId, fd);
      toast.success("Product updated!");
      setEditingId(null);
      load();
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  const filters: { key: ApprovalStatus | "ALL"; label: string; icon: React.ReactNode }[] = [
    { key: "ALL",      label: "All",      icon: <User size={13} /> },
    { key: "PENDING",  label: "Pending",  icon: <Clock size={13} /> },
    { key: "APPROVED", label: "Approved", icon: <CheckCircle size={13} /> },
    { key: "REJECTED", label: "Rejected", icon: <XCircle size={13} /> },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs cursor-pointer transition-all duration-150
              ${filter === f.key ? "bg-primary text-white border-none" : "bg-white text-slate-500 border border-slate-200 hover:border-primary hover:text-primary"}`}>
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-4"><SkeletonList count={5} /></div>
      ) : !products.length ? (
        <div className="h-card p-16 text-center">
          <ShoppingBag size={46} className="text-slate-200 mx-auto mb-3 block" />
          <p className="font-bold text-slate-300">No products here</p>
          <p className="text-xs text-slate-300 mt-1">Products you've submitted will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {products.map(prod => (
            <div key={prod.id} className="h-card">
              <div className="p-4 flex items-center gap-3.5">
                <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-orange-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                  {prod.images?.[0]
                    ? <img src={prod.images[0].imageUrl} className="w-full h-full object-cover" alt="" />
                    : <Package size={22} className="text-orange-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-heading-umber truncate">{prod.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{prod.brand}</p>
                  <p className={`text-[11px] mt-1 ${prod.updateCount >= 3 ? "text-red-400" : "text-slate-400"}`}>
                    {3 - prod.updateCount} update{3 - prod.updateCount !== 1 ? "s" : ""} remaining
                    {prod.updateCount >= 3 && " · Max reached"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusPill status={prod.approvalStatus} />
                  {prod.updateCount < 3 && (
                    <button onClick={() => editingId === prod.id ? setEditingId(null) : startEdit(prod)}
                      className="inline-flex items-center gap-1 bg-none border-none text-primary font-bold text-[11px] cursor-pointer hover:text-orange-700 transition-colors p-0">
                      <Edit2 size={12} />
                      {editingId === prod.id ? "Close" : "Edit"}
                    </button>
                  )}
                </div>
              </div>

              {editingId === prod.id && (
                <div className="border-t border-orange-50 bg-orange-50/50 p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {[{ label: "Product Name", key: "name" }, { label: "Brand", key: "brand" }].map(({ label, key }) => (
                      <div key={key} className="flex flex-col gap-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{label}</Label>
                        <Input value={(editForm as any)[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} className="h-input h-8 text-xs" />
                      </div>
                    ))}
                    <div className="col-span-2 flex flex-col gap-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Description</Label>
                      <Textarea value={editForm.productDescription} onChange={e => setEditForm(f => ({ ...f, productDescription: e.target.value }))} rows={2} className="h-textarea text-xs" />
                    </div>
                    <div className="col-span-2">
                      <div onClick={() => fileRef.current?.click()}
                        className="border border-dashed border-orange-200 rounded-lg p-3 text-center cursor-pointer bg-white hover:border-primary transition-colors">
                        <p className="text-xs text-slate-400">
                          {newImages.length ? `${newImages.length} file(s) selected` : "Click to add images"}
                        </p>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                          onChange={e => setNewImages(Array.from(e.target.files || []))} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(prod.id)} disabled={saving}
                      className="h-btn-primary text-xs inline-flex items-center gap-1.5">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="h-btn-outline text-xs px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  const { user, isLoading, refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",     label: "My Profile",      icon: <User size={14} /> },
    { key: "request",     label: "Request Product", icon: <Plus size={14} /> },
    { key: "my-requests", label: "My Requests",      icon: <FileText size={14} /> },
    { key: "my-products", label: "My Products",      icon: <ShoppingBag size={14} /> },
  ];

  if (isLoading) return <ProfileSkeleton />;

  return (
    <>
      <div className="min-h-screen bg-page">
        <Navbar />
        <div className="max-w-[680px] mx-auto px-4 py-8 flex flex-col gap-5">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <User size={19} className="text-white" />
            </div>
            <h1 className="font-satoshi text-2xl font-extrabold text-heading-umber">My Account</h1>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Total Requests", val: "—", icon: <FileText size={20} className="text-orange-300" /> },
              { label: "Approved",       val: "—", icon: <CheckCircle size={20} className="text-green-400" /> },
              { label: "Pending",        val: "—", icon: <Clock size={20} className="text-orange-300" /> },
            ].map(s => (
              <div key={s.label} className="h-card p-4 text-center">
                <div className="mb-1.5 flex justify-center">{s.icon}</div>
                <p className="font-satoshi text-[22px] font-extrabold text-primary">{s.val}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1 bg-white border border-border rounded-2xl p-1.5 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 font-bold text-[11px] whitespace-nowrap px-3 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-150
                  ${tab === t.key ? "bg-primary text-white" : "bg-transparent text-slate-400 hover:bg-slate-50"}`}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {tab === "profile"     && <ProfileTab user={user} refreshProfile={refreshProfile} />}
          {tab === "request"     && <RequestProductTab />}
          {tab === "my-requests" && <MyRequestsTab />}
          {tab === "my-products" && <MyProductsTab />}

        </div>
      </div>
    </>
  );
};

export default Profile;
