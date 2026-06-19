export type OutboundClickParams = {
  url: string;
  linkText: string;
  /** Stable id for GA4 reports, e.g. `kowloon_publishing_books`. */
  linkId: string;
};

/** Fire a GA4 custom event for an outbound link click (no-op if gtag is absent). */
export function trackOutboundClick({
  url,
  linkText,
  linkId,
}: OutboundClickParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "outbound_click", {
    link_url: url,
    link_text: linkText,
    link_id: linkId,
  });
}
