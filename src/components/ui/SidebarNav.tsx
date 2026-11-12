import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  rotulo: string;
  descricao?: string;
  Icone: ComponentType<{ className?: string }>;
  ativo: boolean;
  contador?: number;
  onClick: () => void;
}

/** Item de navegação das sidebars (admin e parceiro). A sidebar é escura nos dois temas. */
export function SidebarNavItem({
  rotulo,
  descricao,
  Icone,
  ativo,
  contador,
  onClick,
}: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gema",
        ativo
          ? "bg-sidebar-foreground/10 text-sidebar-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/[0.06] hover:text-sidebar-foreground"
      )}
    >
      {ativo && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gema lg:block"
        />
      )}
      <span className="flex min-w-0 items-center gap-3">
        <Icone
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            ativo ? "text-gema" : "text-sidebar-foreground/50 group-hover:text-gema"
          )}
        />
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight lg:truncate">{rotulo}</span>
          {descricao && (
            <span className="hidden truncate text-[11px] text-sidebar-foreground/45 lg:block">
              {descricao}
            </span>
          )}
        </span>
      </span>

      {typeof contador === "number" && (
        <span
          className={cn(
            "min-w-[1.5rem] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold tabular-nums",
            ativo ? "bg-gema text-gema-foreground" : "bg-sidebar-foreground/10 text-sidebar-foreground/75"
          )}
        >
          {contador}
        </span>
      )}
    </button>
  );
}

export function SidebarSecao({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold text-sidebar-foreground/45">{titulo}</p>
      {children}
    </div>
  );
}

export function SidebarAtalho({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-between gap-2 text-xs font-medium text-sidebar-foreground/80",
        className
      )}
    >
      {children}
    </span>
  );
}
