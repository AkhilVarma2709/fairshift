import { Search, Bell, ChevronDown, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="h-full flex items-center gap-4 px-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search employees, shifts, insights…"
            className="w-full h-9 pl-9 pr-14 rounded-lg bg-muted/60 border border-transparent focus:bg-card focus:border-border outline-none text-sm placeholder:text-muted-foreground transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center h-5 px-1.5 rounded border border-border bg-card text-[10.5px] font-medium text-muted-foreground">⌘K</kbd>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-card">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-70 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11.5px] font-medium">AI Online</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
              <div className="h-4 w-4 rounded bg-gradient-to-br from-primary to-chart-5" />
              <span className="text-[12.5px] font-medium">Northgate Health</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Northgate Health</DropdownMenuItem>
              <DropdownMenuItem>Bayline Retail Group</DropdownMenuItem>
              <DropdownMenuItem>Meridian Hospitality</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="relative h-8 w-8 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted transition-colors">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[9.5px] rounded-full bg-danger text-danger-foreground border-2 border-background">3</Badge>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 h-9 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-white text-[11px] font-semibold">SR</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-[12.5px] font-semibold">Sarah Reeves</div>
                <div className="text-[10.5px] text-muted-foreground">Ops Director</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
