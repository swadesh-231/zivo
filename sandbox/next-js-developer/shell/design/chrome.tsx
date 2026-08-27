"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNavigate, useScreen } from "./navigation";

/**
 * Platform chrome, supplied so it is identical on every screen.
 *
 * A status bar and a tab bar redrawn from scratch per screen is the single
 * most reliable way for a generated design to look unfinished: the clock moves
 * two pixels, the tab labels change weight, the safe area is right on four
 * screens and wrong on the fifth. These are fixed so the design agent cannot
 * spend attention there, and cannot get it wrong.
 */

/** The 44pt strip at the top of the frame. Rendered by PhoneFrame. */
export function StatusBar() {
  return (
    <div className="relative z-20 flex h-[44px] shrink-0 items-center justify-between px-6 text-app-text">
      <span className="text-[15px] font-semibold tracking-tight tabular-nums">
        9:41
      </span>

      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-[11px] w-[17px]" aria-hidden>
          {[0, 1, 2, 3].map((bar) => (
            <rect
              key={bar}
              x={bar * 4.5}
              y={9 - bar * 2.6}
              width="3"
              height={3 + bar * 2.6}
              rx="1"
              fill="currentColor"
            />
          ))}
        </svg>

        <svg viewBox="0 0 16 12" className="h-[11px] w-[15px]" aria-hidden>
          <path
            d="M8 10.5 5.6 8.1a3.4 3.4 0 0 1 4.8 0L8 10.5ZM3.2 5.7a6.8 6.8 0 0 1 9.6 0l-1.4 1.4a4.8 4.8 0 0 0-6.8 0L3.2 5.7ZM.8 3.3a10.2 10.2 0 0 1 14.4 0l-1.4 1.4a8.2 8.2 0 0 0-11.6 0L.8 3.3Z"
            fill="currentColor"
          />
        </svg>

        <div className="flex items-center gap-[1.5px]">
          <div className="h-[11px] w-[22px] rounded-[3.5px] border border-current/35 p-[1.5px]">
            <div className="h-full w-[72%] rounded-[1.5px] bg-current" />
          </div>
          <div className="h-[4px] w-[1.5px] rounded-r-full bg-current/35" />
        </div>
      </div>
    </div>
  );
}

/** The 34pt strip at the bottom. Rendered by PhoneFrame. */
export function HomeIndicator() {
  return (
    <div className="relative z-20 flex h-[34px] shrink-0 items-end justify-center pb-[8px]">
      <div className="h-[5px] w-[134px] rounded-full bg-app-text/25" />
    </div>
  );
}

/**
 * The screen root. Lays out nav bar, scrolling body, and tab bar in the space
 * the frame leaves between the status bar and the home indicator.
 */
export function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-app-bg", className)}>
      {children}
    </div>
  );
}

/** Scrolling content. Everything that is not chrome belongs in here. */
export function ScreenBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "zv-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function NavBar({
  title,
  large = false,
  back,
  trailing,
  className,
}: {
  title: string;
  /** iOS large title: 28px, left aligned, sits above the content. */
  large?: boolean;
  /** Screen id to go back to. Renders the chevron. */
  back?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();

  if (large) {
    return (
      <div className={cn("shrink-0 bg-app-bg px-5 pt-2 pb-3", className)}>
        <div className="flex min-h-[32px] items-center justify-between gap-3">
          {back ? (
            <button
              type="button"
              onClick={() => navigate(back)}
              aria-label="Back"
              className="-ml-2 flex size-8 items-center justify-center rounded-full text-app-accent transition-colors active:bg-app-faint"
            >
              <ChevronLeft className="size-[22px]" />
            </button>
          ) : (
            <span />
          )}
          {trailing}
        </div>

        <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-[-0.02em] text-app-text">
          {title}
        </h1>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-[44px] shrink-0 items-center justify-center border-b border-app-border/70 bg-app-bg px-4",
        className,
      )}
    >
      {back ? (
        <button
          type="button"
          onClick={() => navigate(back)}
          aria-label="Back"
          className="absolute left-2 flex size-8 items-center justify-center rounded-full text-app-accent transition-colors active:bg-app-faint"
        >
          <ChevronLeft className="size-[22px]" />
        </button>
      ) : null}

      <span className="max-w-[60%] truncate text-[17px] font-semibold tracking-[-0.01em] text-app-text">
        {title}
      </span>

      <div className="absolute right-3 flex items-center gap-1">{trailing}</div>
    </div>
  );
}

export type TabItem = {
  /** The screen id this tab opens. */
  id: string;
  label: string;
  icon: LucideIcon;
};

/**
 * The bottom tab bar. Active state comes from the navigation context, so the
 * same `TABS` array is correct on every screen without being told which one is
 * current.
 */
export function TabBar({
  items,
  className,
}: {
  items: TabItem[];
  className?: string;
}) {
  const { activeId } = useScreen();
  const navigate = useNavigate();

  return (
    <nav
      className={cn(
        "flex shrink-0 items-stretch border-t border-app-border/70 bg-app-surface/95 pt-1.5 backdrop-blur-xl",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-[3px] pb-1 transition-colors",
              isActive ? "text-app-accent" : "text-app-muted",
            )}
          >
            <item.icon
              className="size-[23px]"
              strokeWidth={isActive ? 2.2 : 1.8}
            />
            <span className="text-[10px] leading-none font-medium tracking-[-0.01em]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/** Circular icon button for nav bar trailing slots. */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-app-text transition-colors active:bg-app-faint",
        className,
      )}
    >
      <Icon className="size-[21px]" strokeWidth={1.9} />
    </button>
  );
}
