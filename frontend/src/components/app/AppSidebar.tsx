import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarCog, Users, AlertTriangle, Sparkles,
  BarChart3, FileText, Settings, LifeBuoy, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schedule", label: "Schedule Optimizer", icon: CalendarCog },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/flight-risk", label: "Flight Risk", icon: AlertTriangle },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
];
const footerNav = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: LifeBuoy },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-sidebar z-30">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2.4} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight">FairGuard</div>
          <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-medium">Workforce AI</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
        {nav.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} />
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        {footerNav.map((item) => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} />
        ))}
        <div className="mt-3 mx-1 rounded-xl border border-sidebar-border bg-gradient-to-br from-primary-soft to-transparent p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI Credits
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">2,418 / 5,000 used this month</div>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-[48%] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} strokeWidth={2} />
      <span>{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
    </Link>
  );
}
