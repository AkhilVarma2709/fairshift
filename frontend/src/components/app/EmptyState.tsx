import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, description, cta }: { icon: LucideIcon; title: string; description: string; cta?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 py-16 px-6 grid place-items-center text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[13px] text-muted-foreground max-w-md">{description}</p>
      {cta && <Button className="mt-5">{cta}</Button>}
    </div>
  );
}
