import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, Users, Sparkles, UserCheck, Package, Tag, GraduationCap, ClipboardList, Clock, LogOut, Shield, BarChart3, CreditCard, UserCircle2, CalendarDays, BarChart2, Share2, Inbox, ShieldAlert, Wallet, Banknote, Image, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = user?.role;

  const ownerNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/bookings", label: "Bookings", icon: Calendar },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/clients", label: "Clients (CRM)", icon: UserCircle2 },
    { href: "/specialists", label: "Specialists", icon: Users },
    { href: "/staff", label: "Staff Management", icon: UserCheck },
    { href: "/staff-schedule", label: "Staff Schedules", icon: Clock },
    { href: "/payroll", label: "Payroll", icon: Banknote },
    { href: "/services", label: "Services", icon: Sparkles },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/promotions", label: "Promotions", icon: Tag },
    { href: "/training", label: "Training", icon: GraduationCap },
    { href: "/marketing", label: "Marketing", icon: Share2 },
    { href: "/reviews", label: "Reviews", icon: Sparkles },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/policies", label: "Policies", icon: ShieldAlert },
    { href: "/wallet", label: "Wallet & Loyalty", icon: Wallet },
    { href: "/billing", label: "Billing & Plan", icon: CreditCard },
    { href: "/gallery", label: "Gallery & Discovery", icon: Image },
    { href: "/settings/payment", label: "Payment Settings", icon: CreditCard },
  ];

  const therapistNavItems = [
    { href: "/therapist", label: "My Schedule", icon: Clock },
    { href: "/therapist/history", label: "Customer History", icon: ClipboardList },
  ];

  const adminNavItems = [
    { href: "/", label: "Platform Overview", icon: BarChart3 },
    { href: "/platform", label: "Revenue Dashboard", icon: BarChart2 },
    { href: "/clients", label: "Global Users", icon: UserCircle2 },
  ];

  let navItems = ownerNavItems;
  if (role === 'THERAPIST') navItems = therapistNavItems;
  if (role === 'PLATFORM_ADMIN') navItems = adminNavItems;
  if (role === 'RECEPTIONIST') navItems = ownerNavItems.filter(item => !['/billing', '/platform'].includes(item.href));

  const roleLabel = role === 'PLATFORM_ADMIN' ? 'Platform Admin' :
    role === 'THERAPIST' ? 'Therapist' :
    role === 'SPA_OWNER' ? 'Spa Owner' :
    role === 'MANAGER' ? 'Manager' :
    role === 'RECEPTIONIST' ? 'Receptionist' : 'User';

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-sidebar text-sidebar-foreground flex-shrink-0 fixed inset-y-0 left-0 border-r border-sidebar-border flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 md:p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">Beauty Booker</h1>
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
              {role === 'PLATFORM_ADMIN' && <Shield className="w-3 h-3" />}
              <span>{roleLabel}</span>
            </div>
            {user && (
              <p className="text-sm text-white/80 mt-1 truncate">{user.name}</p>
            )}
          </div>
          <button 
            className="md:hidden text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="px-4 space-y-1 mt-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md shadow-black/10" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border/30">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen bg-secondary/30 flex flex-col w-full">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-border/50">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg">Beauty Booker</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-secondary rounded-md"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {role === 'SPA_OWNER' && user?.ownedSpas?.[0]?.approvalStatus === 'PENDING' && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Account Under Review</h3>
                <p className="text-xs opacity-90 mt-0.5">Your spa profile is currently pending approval. Customers cannot see your storefront on the app yet. You can still set up your services and staff.</p>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto backdrop-blur-sm bg-white/50 p-6 rounded-2xl shadow-sm border border-white/60 min-h-[calc(100vh-4rem)] w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

