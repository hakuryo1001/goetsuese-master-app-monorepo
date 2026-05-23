import type { ReactNode } from "react";

type ToolCardProps = {
  children: ReactNode;
  className?: string;
};

/** Shared shell for home “tools & offerings” grid cells. */
export function ToolCard({ children, className = "" }: ToolCardProps) {
  return (
    <article
      className={`flex h-full min-h-[11rem] flex-col rounded-lg border border-line bg-elevated p-6 text-start shadow-[0_10px_40px_var(--color-card-shadow)] transition-colors duration-100 ease-in hover:border-line-strong ${className}`.trim()}
    >
      {children}
    </article>
  );
}
