/**
 * Shared controls — keep in sync with the font resources “outline” actions.
 */
export const uiStyles = {
  outlineButton:
    "inline-flex w-fit items-center justify-center border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-brand hover:bg-brand hover:text-canvas",
  textLink:
    "inline-flex w-fit text-sm text-ink-muted underline underline-offset-4 transition hover:text-brand",
} as const;
