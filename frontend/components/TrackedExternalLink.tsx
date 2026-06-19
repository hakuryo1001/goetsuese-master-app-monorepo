"use client";

import { trackOutboundClick } from "@/lib/analytics";
import { uiStyles } from "@/lib/ui-styles";

type TrackedExternalLinkProps = {
  href: string;
  label: string;
  variant?: "button" | "text";
  analyticsLinkId?: string;
};

export function TrackedExternalLink({
  href,
  label,
  variant = "button",
  analyticsLinkId,
}: TrackedExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={variant === "text" ? uiStyles.textLink : uiStyles.outlineButton}
      onClick={() => {
        if (analyticsLinkId) {
          trackOutboundClick({
            url: href,
            linkText: label,
            linkId: analyticsLinkId,
          });
        }
      }}
    >
      {label}
    </a>
  );
}
