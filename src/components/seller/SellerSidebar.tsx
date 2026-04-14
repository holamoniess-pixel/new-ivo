import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  MessageSquare,
  Sparkles,
  Settings,
  Store,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainItems = [
  { title: "Dashboard", url: "/seller/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/seller/products", icon: Package },
  { title: "Categories", url: "/seller/categories", icon: FolderOpen },
  { title: "Orders", url: "/seller/orders", icon: ShoppingCart },
  { title: "Messages", url: "/seller/messages", icon: MessageSquare },
  { title: "AI Tools", url: "/seller/ai-tools", icon: Sparkles },
];

export function SellerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-satoshi text-sm font-bold text-sidebar-foreground">Savvy Seller</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.storeName || user?.fullName}</p>
            </div>
          </div>
        )}
        {collapsed && <Store className="h-6 w-6 text-primary mx-auto" />}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={logout}>
            Log out
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
