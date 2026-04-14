import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Search, User, MessageCircle, LogOut,
  Menu, X, Sparkles, Bell, Package, Home, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "@/lib/api";

function OnettLogo({ size = 32 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.25),
      background: "linear-gradient(135deg,#E6640A 0%,#cf5208 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 2px 8px rgba(230,100,10,0.35)",
    }}>
      <span style={{ color: "#fff", fontFamily: "'Satoshi', sans-serif", fontWeight: 800, fontSize: size * 0.3, lineHeight: 1, letterSpacing: "-0.5px" }}>ON</span>
      <span style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Satoshi', sans-serif", fontWeight: 700, fontSize: size * 0.22, lineHeight: 1, letterSpacing: "0.5px" }}>ETT</span>
    </div>
  );
}

const Navbar = () => {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try { const res = await notificationApi.getUnreadCount(); setUnreadCount(res?.unreadCount ?? 0); }
    catch { /* silent */ }
  }, [isAuthenticated]);

  useEffect(() => { fetchUnreadCount(); const id = setInterval(fetchUnreadCount, 30_000); return () => clearInterval(id); }, [fetchUnreadCount]);
  useEffect(() => { (window as any).__refreshNotifBadge = fetchUnreadCount; return () => { delete (window as any).__refreshNotifBadge; }; }, [fetchUnreadCount]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileOpen]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); setMobileOpen(false);
    }
  };
  const closeMobile = () => setMobileOpen(false);

  const BellBtn = ({ mobile = false }: { mobile?: boolean }) =>
    mobile ? (
      <Link to="/notifications" onClick={closeMobile} className="mob-menu-item">
        <Bell size={18} style={{ color: "#888", flexShrink: 0 }} />
        <span>Notifications</span>
        {unreadCount > 0 && <span className="nb-pill">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </Link>
    ) : (
      <Link to="/notifications" className="n-icon-btn" title="Notifications" style={{ position: "relative" }}>
        <Bell size={17} />
        {unreadCount > 0 && <span className="n-dot">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </Link>
    );

  return (
    <>
      <nav className={`onett-nav${scrolled ? " scrolled" : ""}`}>
        <div className="n-inner">

          {/* Brand */}
          <Link to="/" className="n-brand" onClick={closeMobile}>
            <OnettLogo size={34} />
            <span className="n-brand-name">ONETT<em>.</em></span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="n-search-form">
            <div className="n-search-wrap">
              <Search size={15} className="n-search-ico" />
              <input
                className="n-search-input"
                placeholder="Search products, brands, categories…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Desktop actions */}
          <div className="n-actions">
            <Link to="/" className="n-icon-btn" title="Home"><Home size={17} /></Link>
            <Link to="/ai-assistant" className="n-icon-btn" title="AI Assistant"><Sparkles size={17} /></Link>
            <button
              onClick={() => setDarkMode(d => !d)}
              className="n-icon-btn"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {isAuthenticated && (
              <>
                <Link to="/messages" className="n-icon-btn" title="Messages"><MessageCircle size={17} /></Link>
                <BellBtn />
                {!isSeller && <Link to="/orders" className="n-icon-btn" title="Orders"><Package size={17} /></Link>}
                {!isSeller && <Link to="/cart" className="n-icon-btn" title="Cart"><ShoppingCart size={17} /></Link>}
              </>
            )}
            <div className="n-sep" />
            {isAuthenticated ? (
              <>
                <Link to={isSeller ? "/seller/dashboard" : "/profile"} className="n-user-btn">
                  <div className="n-user-av"><User size={14} color="#E6640A" /></div>
                  <span className="n-user-name">{user?.fullName?.split(" ")[0]}</span>
                </Link>
                <button className="n-icon-btn" title="Log out" onClick={logout}><LogOut size={16} /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="n-btn-in">Sign In</Link>
                <Link to="/register" className="n-btn-reg">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile icon row — messages, cart, notifications, hamburger */}
          <div className="n-mob">
            <Link to="/search" className="n-mob-btn" title="Search"><Search size={19} /></Link>
            {isAuthenticated && (
              <Link to="/messages" className="n-mob-btn" title="Messages">
                <MessageCircle size={19} />
              </Link>
            )}
            {isAuthenticated && !isSeller && (
              <Link to="/cart" className="n-mob-btn" title="Cart">
                <ShoppingCart size={19} />
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/notifications" className="n-mob-btn" title="Notifications">
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="n-dot" style={{ top: 5, right: 5, fontSize: 8, minWidth: 14, height: 14 }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button className="n-menu-btn" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Drawer */}
      {mobileOpen && (
        <>
          <div className="n-overlay" onClick={closeMobile} />
          <div className="n-drawer">
            <div className="n-drawer-head">
              <span className="n-drawer-title">ONETT<em>.</em></span>
              <button className="n-drawer-close" onClick={closeMobile}><X size={15} /></button>
            </div>

            <div className="n-drawer-body">
              <form onSubmit={handleSearch} className="n-drawer-search">
                <Search size={15} className="n-drawer-search-ico" />
                <input
                  className="n-drawer-search-input"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </form>

              <div className="n-sec-label">Explore</div>
              <Link to="/" onClick={closeMobile} className="mob-menu-item">
                <Home size={18} style={{ color: "#E6640A", flexShrink: 0 }} /><span>Home</span>
              </Link>
              <Link to="/ai-assistant" onClick={closeMobile} className="mob-menu-item">
                <Sparkles size={18} style={{ color: "#E6640A", flexShrink: 0 }} /><span>AI Assistant</span><span className="mob-badge-new">New</span>
              </Link>
              <button
                onClick={() => { setDarkMode(d => !d); closeMobile(); }}
                className="mob-menu-item"
              >
                {darkMode
                  ? <Sun size={18} style={{ color: "#E6640A", flexShrink: 0 }} />
                  : <Moon size={18} style={{ color: "#888", flexShrink: 0 }} />}
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <Link to="/search?keyword=" onClick={closeMobile} className="mob-menu-item">
                <Search size={18} style={{ color: "#888", flexShrink: 0 }} /><span>All Products</span>
              </Link>
              <Link to="/categories" onClick={closeMobile} className="mob-menu-item">
                <Package size={18} style={{ color: "#888", flexShrink: 0 }} /><span>Categories</span>
              </Link>

              {isAuthenticated && (
                <>
                  <div className="n-sec-label">Account</div>
                  <Link to={isSeller ? "/seller/dashboard" : "/profile"} onClick={closeMobile} className="mob-user-card">
                    <div className="mob-user-av"><User size={18} color="#E6640A" /></div>
                    <div>
                      <div className="mob-user-name">{user?.fullName ?? "Profile"}</div>
                      <div className="mob-user-sub">{isSeller ? "Seller Dashboard" : "View profile"}</div>
                    </div>
                  </Link>
                  <Link to="/messages" onClick={closeMobile} className="mob-menu-item">
                    <MessageCircle size={18} style={{ color: "#888", flexShrink: 0 }} /><span>Messages</span>
                  </Link>
                  <BellBtn mobile />
                  {!isSeller && (
                    <Link to="/orders" onClick={closeMobile} className="mob-menu-item">
                      <Package size={18} style={{ color: "#888", flexShrink: 0 }} /><span>My Orders</span>
                    </Link>
                  )}
                  {!isSeller && (
                    <Link to="/cart" onClick={closeMobile} className="mob-menu-item">
                      <ShoppingCart size={18} style={{ color: "#888", flexShrink: 0 }} /><span>Cart</span>
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="n-drawer-footer">
              {isAuthenticated ? (
                <button className="mob-logout-btn" onClick={() => { logout(); closeMobile(); }}>
                  <LogOut size={18} /><span>Log out</span>
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 99, border: "1px solid #ddd", fontSize: 14, fontFamily: "'Manrope',sans-serif", fontWeight: 600, color: "#111", textDecoration: "none" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 99, background: "#E6640A", fontSize: 14, fontFamily: "'Manrope',sans-serif", fontWeight: 700, color: "#fff", textDecoration: "none", boxShadow: "0 3px 12px rgba(230,100,10,0.35)" }}
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
