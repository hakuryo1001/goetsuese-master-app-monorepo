import type { ReactNode } from "react";

type ToolCardProps = {
  children: ReactNode;
  className?: string;
};

/** Shared shell for home “tools & offerings” grid cells. */
export function ToolCard({ children, className = "" }: ToolCardProps) {
  return (
    <article
      className={`flex h-full min-h-[11rem] flex-col rounded-lg border border-white/20 bg-black p-6 text-start shadow-lg shadow-black transition-colors duration-100 ease-in hover:border-white/35 ${className}`.trim()}
    >
      {children}
    </article>
  );
}
