import type { SVGProps } from "react";

export type IconName = "write" | "archive" | "report" | "help" | "chevron" | "arrow" | "search" | "attach" | "check" | "close" | "download" | "lock" | "calendar" | "trash" | "book" | "tag";

const paths: Record<IconName, React.ReactNode> = {
  write: <><path d="m15 4 5 5M5 19l4-1L20 7a2 2 0 0 0-5-5L4 13l-1 5Z" /><path d="M13 20h8" /></>,
  archive: <><rect x="3" y="4" width="18" height="4" rx="1.5" /><path d="M5 8v12h14V8M10 12h4" /></>,
  report: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 16v-3m4 3V8m4 8v-5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-1 .6-1.5 1.2-1.5 2.2M12 16h.01" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  attach: <path d="m8 12 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9m-6 12 7-7" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18M7 15h3m4 0h3" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z" /><path d="M4 19V5m4-2v16" /></>,
  tag: <><path d="M3 12V4h8l9 9-8 8Z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
};

export default function AppIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
