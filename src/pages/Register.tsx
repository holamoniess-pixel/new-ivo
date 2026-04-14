import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ShoppingBag,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  CheckSquare,
  Square,
  PenLine,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import savvyLogo from "@/assets/savvy-logo.png";

/* ─────────────────────────────────────────────
   Signature Canvas
───────────────────────────────────────────── */
const SignatureCanvas = ({
  onSign,
  onClear,
  signed,
}: {
  onSign: (dataUrl: string) => void;
  onClear: () => void;
  signed: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a2e";
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL());
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-inter text-xs text-muted-foreground">
          Sign below to confirm your agreement
        </p>
        <button
          type="button"
          onClick={clear}
          className="font-inter flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
      </div>
      <div className="relative rounded-xl border-2 border-dashed border-border bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={560}
          height={100}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!signed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="font-inter text-xs text-muted-foreground/50 flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5" /> Draw your signature here
            </p>
          </div>
        )}
        {/* baseline */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-border/60 pointer-events-none" />
      </div>
      {signed && (
        <p className="font-inter text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckSquare className="h-3 w-3" /> Signature captured
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Terms Modal — full legal document style
───────────────────────────────────────────── */
const TermsModal = ({
  onAccept,
  onDecline,
}: {
  onAccept: (sig: string) => void;
  onDecline: () => void;
}) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [signature, setSignature] = useState("");
  const [signedName, setSignedName] = useState("");

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
      setScrolledToBottom(true);
    }
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const canAccept = scrolledToBottom && signature && signedName.trim().length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-background rounded-2xl border border-border shadow-2xl flex flex-col max-h-[92vh]">

        {/* Modal header */}
        <div className="px-8 pt-6 pb-4 border-b border-border flex-shrink-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-primary">
              Onett Marketplace
            </span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Terms &amp; Conditions
          </h2>
          <p className="font-inter text-xs text-muted-foreground mt-1">
            Effective Date: April 8, 2025 &nbsp;·&nbsp; Version 1.0
          </p>
          {!scrolledToBottom && (
            <p className="font-inter text-[11px] text-amber-500 mt-2">
              ↓ Please read the full document before signing
            </p>
          )}
        </div>

        {/* Document body */}
        <div
          className="flex-1 overflow-y-auto px-8 py-6"
          onScroll={handleScroll}
        >
          <div className="font-inter text-sm text-foreground leading-relaxed space-y-5 max-w-none">

            {/* Preamble */}
            <p>
              Welcome to Onett. These Terms and Conditions (<strong>"Terms"</strong>) constitute a legally binding agreement between you (<strong>"User"</strong>) and Onett (<strong>"Company"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), governing your access to and use of our website, mobile applications, and related services (collectively, the <strong>"Platform"</strong>). By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety. If you do not agree to these Terms, you must immediately cease all use of the Platform.
            </p>

            <hr className="border-border" />

            <section>
              <h3 className="font-heading font-bold text-base mb-2">1. Eligibility</h3>
              <p>
                By registering for and using this Platform, you represent and warrant that: (a) you are at least 18 years of age, or have obtained verifiable parental or legal guardian consent; (b) you possess the full legal capacity and authority to enter into binding contractual obligations; (c) your use of the Platform does not violate any applicable laws or regulations in your jurisdiction; and (d) all information you provide during registration and thereafter is accurate, current, and complete.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">2. User Accounts</h3>
              <p>
                To access certain features of the Platform, you may be required to register and maintain an active account. You are solely responsible for: (a) maintaining the strict confidentiality of your account credentials; (b) all activities that occur under your account; and (c) promptly notifying us of any unauthorised use or suspected breach of security. You agree to provide accurate, current, and complete information and to update such information as necessary. We reserve the right, at our sole discretion, to suspend, restrict, or permanently terminate any account found to be fraudulent, abusive, or in violation of these Terms, without prior notice and without liability.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">3. Products and Services</h3>
              <p>
                All products and services listed on the Platform are subject to availability. We reserve the right, without notice, to: (a) modify, suspend, or discontinue any product, service, or feature; (b) impose limits on certain features or restrict access; and (c) update product descriptions, specifications, and pricing. Product images are for illustrative purposes only and may not exactly represent the final product. We do not warrant that product descriptions or other content on the Platform are accurate, complete, or error-free.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">4. Orders and Payments</h3>
              <p>
                All orders placed through the Platform are subject to acceptance and availability confirmation. Prices are displayed in Ghanaian Cedis (GHS) and are inclusive of applicable taxes unless otherwise stated. Payment must be completed through our approved and verified payment methods. We reserve the right to cancel, refuse, or limit any order at our discretion, including but not limited to cases involving pricing errors or technical glitches, suspected fraudulent or unauthorised activity, product unavailability, or failure of payment authorisation. In the event of a cancellation, you will receive a full refund of any payments made.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">5. Pre-Orders</h3>
              <p>
                Certain products may be made available on a pre-order basis prior to general availability. By placing a pre-order, you acknowledge that: (a) pre-orders may require partial or full advance payment at the time of order placement; (b) estimated delivery dates are projections only and are not guaranteed; (c) delays may occur due to manufacturing, logistics, customs, or other factors beyond our reasonable control; and (d) we reserve the right to cancel pre-orders that cannot be fulfilled, with a full refund issued accordingly.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">6. Refund Policy</h3>
              <p className="mb-3">
                <strong>6.1 General Policy.</strong> All sales are considered final upon order confirmation unless expressly stated otherwise in these Terms or required by applicable law.
              </p>
              <p className="mb-3">
                <strong>6.2 Pre-Order Refunds.</strong> For products purchased on a pre-order basis where a partial (50%) deposit has been made: refund requests must be formally submitted within seven (7) calendar days from the date of payment. Upon expiry of the seven (7) day period, all payments become strictly non-refundable and no exceptions will be made under any circumstances.
              </p>
              <p className="mb-3">
                <strong>6.3 Non-Refundable Cases.</strong> Refunds will not be issued in the following circumstances: expiry of the applicable refund window; change of mind or buyer's remorse after purchase confirmation; orders incorrectly placed by the user; digital or downloadable products once accessed or delivered; products that have been used, damaged, or returned without original packaging.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-amber-800 text-xs font-semibold flex items-start gap-2">
                  <span className="text-base leading-none">⚠️</span>
                  <span><strong>Pre-Order Refund Notice:</strong> Refund requests for partially paid pre-orders must be submitted within 7 days of payment. After this period, no refunds will be granted under any circumstances.</span>
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">7. Delivery</h3>
              <p>
                Delivery timelines provided at checkout are estimates based on standard logistics conditions and do not constitute guaranteed delivery dates. We shall not be held liable for delays arising from circumstances beyond our reasonable control, including but not limited to carrier delays, adverse weather conditions, customs clearance, civil unrest, or force majeure events. Risk of loss or damage to products passes to you upon delivery to the shipping address provided.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">8. Returns and Exchanges</h3>
              <p>
                Returns and exchanges are accepted exclusively for products that are defective upon receipt or materially differ from their description on the Platform. To initiate a return or exchange, you must: (a) contact our support team within 48 hours of delivery; (b) provide photographic or video evidence of the defect or discrepancy; and (c) return the item unused, in its original condition and packaging. We reserve the right to reject return requests that do not meet these conditions. Items returned without prior authorisation will not be accepted.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">9. Intellectual Property</h3>
              <p>
                All content available on or through the Platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the exclusive property of Onett or its content suppliers and is protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform solely for personal, non-commercial purposes. Any unauthorised reproduction, distribution, modification, or commercial exploitation of Platform content is strictly prohibited.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">10. Prohibited Conduct</h3>
              <p>
                You agree not to engage in any of the following prohibited activities: (a) using the Platform for any unlawful, fraudulent, or malicious purpose; (b) attempting to gain unauthorised access to any part of the Platform or its related systems; (c) transmitting any harmful, offensive, or disruptive content; (d) using automated tools, bots, or scrapers to access or collect data from the Platform without our express written consent; (e) impersonating any person or entity or misrepresenting your affiliation; (f) interfering with or disrupting the integrity or performance of the Platform.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">11. Limitation of Liability</h3>
              <p>
                To the fullest extent permitted by applicable law, Onett, its directors, employees, agents, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or other intangible losses, arising from your use of or inability to use the Platform. In no event shall our aggregate liability to you for any claim arising out of or relating to these Terms or your use of the Platform exceed the total amount paid by you to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">12. Privacy</h3>
              <p>
                Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection, use, and disclosure of your personal information as described in our Privacy Policy. We are committed to handling your personal data in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">13. Amendments to Terms</h3>
              <p>
                We reserve the right to revise, update, or replace any part of these Terms at any time at our sole discretion. We will notify you of material changes by posting the updated Terms on the Platform with a revised effective date. Your continued access to or use of the Platform following the posting of any changes constitutes your binding acceptance of the revised Terms. We encourage you to review these Terms periodically.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">14. Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of Ghana, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
              </p>
            </section>

            <section>
              <h3 className="font-heading font-bold text-base mb-2">15. Contact Information</h3>
              <p>
                If you have any questions, concerns, or complaints regarding these Terms or the Platform, please contact us at:
              </p>
              <div className="mt-2 pl-4 border-l-2 border-border space-y-0.5 text-muted-foreground">
                <p><strong className="text-foreground">Onett Marketplace</strong></p>
                <p>Email: support@onett.com</p>
                <p>Phone: +233 XX XXX XXXX</p>
                <p>Address: Accra, Ghana</p>
              </div>
            </section>

            <hr className="border-border" />

            {/* Signature block */}
            <section className="space-y-4 pb-2">
              <div>
                <h3 className="font-heading font-bold text-base mb-1">
                  Acknowledgement &amp; Signature
                </h3>
                <p className="text-muted-foreground text-xs">
                  By signing below, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions in their entirety, including the pre-order refund policy.
                </p>
              </div>

              {/* Printed name */}
              <div className="space-y-1.5">
                <Label className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name (Print)
                </Label>
                <Input
                  value={signedName}
                  onChange={e => setSignedName(e.target.value)}
                  placeholder="Type your full name"
                  className="font-inter"
                />
              </div>

              {/* Signature canvas */}
              <SignatureCanvas
                onSign={setSignature}
                onClear={() => setSignature("")}
                signed={!!signature}
              />

              {/* Date */}
              <div className="flex items-center justify-between text-xs text-muted-foreground font-inter">
                <span>Date of Acceptance:</span>
                <span className="font-semibold text-foreground">{today}</span>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0 flex flex-col gap-2">
          {!scrolledToBottom && (
            <p className="font-inter text-center text-xs text-amber-500">
              Please scroll to the bottom and sign before accepting
            </p>
          )}
          <Button
            onClick={() => onAccept(signature)}
            disabled={!canAccept}
            className="font-heading w-full rounded-xl h-11 font-semibold text-sm"
          >
            Accept &amp; Sign Agreement
          </Button>
          <Button
            variant="ghost"
            onClick={onDecline}
            className="font-inter w-full rounded-xl h-10 text-sm text-muted-foreground hover:text-foreground"
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Register Page
───────────────────────────────────────────── */
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁 password toggle

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    bio: "",
    location: "",
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const update = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const data = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: `+233${form.phoneNumber}`,
        bio: form.bio,
        location: form.location,
      };
      formData.append(
        "data",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      if (profilePic) formData.append("profilePic", profilePic);
      await register(formData, false);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showTermsModal && (
        <TermsModal
          onAccept={() => {
            setTermsAccepted(true);
            setShowTermsModal(false);
            toast.success("Terms accepted and signed!");
          }}
          onDecline={() => {
            setTermsAccepted(false);
            setShowTermsModal(false);
          }}
        />
      )}

      <div className="font-inter flex min-h-screen items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass rounded-3xl border border-white/30 shadow-elevated p-8">

            {/* Header */}
            <div className="text-center mb-7">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
                <img src={savvyLogo} alt="Onett" className="h-8 w-8" />
                <span className="font-satoshi text-xl font-bold">
                  On<span className="text-gradient">ett</span>
                </span>
              </Link>
              <h1 className="font-satoshi text-2xl font-bold heading-umber">Create your account</h1>
              <p className="font-inter text-sm text-muted-foreground mt-1">
                Start shopping smarter with AI
              </p>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-3 rounded-xl border border-muted bg-muted/40 p-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-ui text-sm font-semibold">
                  Creating a Buyer account
                </p>
                <p className="font-inter text-[11px] text-muted-foreground">
                  Browse, shop, and discover products with AI
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div className="space-y-2">
              <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.fullName}
                  onChange={e => update("fullName", e.target.value)}
                  required
                  placeholder="John Doe"
                  className="font-inter pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="font-inter pl-10"
                />
              </div>
            </div>

            {/* Password + Phone */}
            <div className="grid grid-cols-2 gap-3">

              {/* Password with show/hide toggle */}
              <div className="space-y-2">
                <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 chars"
                    className="font-inter pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Phone with +233 prefix */}
              <div className="space-y-2">
                <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Phone
                </Label>
                <div className="relative flex">
                  {/* Prefix badge */}
                  <div className="flex items-center gap-1.5 px-3 rounded-l-md border border-r-0 border-input bg-secondary/60 text-sm text-muted-foreground font-inter shrink-0">
                    <Phone className="h-3.5 w-3.5" />
                    <span>+233</span>
                  </div>
                  <Input
                    value={form.phoneNumber}
                    onChange={e => {
                      // strip leading 0 if user types it after +233
                      const val = e.target.value.replace(/^0+/, "");
                      update("phoneNumber", val);
                    }}
                    required
                    placeholder="XX XXX XXXX"
                    className="font-inter rounded-l-none"
                    maxLength={9}
                  />
                </div>
              </div>

            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.location}
                  onChange={e => update("location", e.target.value)}
                  placeholder="Accra, Ghana"
                  className="font-inter pl-10"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bio{" "}
                <span className="normal-case font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                value={form.bio}
                onChange={e => update("bio", e.target.value)}
                rows={2}
                placeholder="Tell us a bit about yourself"
                className="font-inter"
              />
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <Label className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Profile Picture{" "}
                <span className="normal-case font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={e => setProfilePic(e.target.files?.[0] || null)}
                className="font-inter"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!termsAccepted) {
                      setShowTermsModal(true);
                    } else {
                      setTermsAccepted(false);
                    }
                  }}
                  className="mt-0.5 flex-shrink-0 text-primary"
                >
                  {termsAccepted
                    ? <CheckSquare className="h-5 w-5" />
                    : <Square className="h-5 w-5 text-muted-foreground" />}
                </button>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                  I have read, signed, and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary font-semibold hover:underline"
                  >
                    Terms &amp; Conditions
                  </button>{" "}
                  of Onett Marketplace, including the strict pre-order refund policy.
                </p>
              </div>

              {!termsAccepted && (
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="font-heading w-full text-xs font-semibold text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Read &amp; Sign Agreement
                </button>
              )}

              {termsAccepted && (
                <p className="font-inter text-xs text-green-600 font-medium flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Agreement signed — {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="font-heading w-full rounded-xl h-11 font-semibold"
              disabled={loading || !termsAccepted}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="font-inter text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
      </div>
    </>
  );
};

export default Register;