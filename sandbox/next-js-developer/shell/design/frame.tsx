"use client";

import { cn } from "@/lib/utils";
import { APP_META } from "./app-meta";
import { StatusBar, HomeIndicator } from "./chrome";
import { paletteVars } from "./palette";

/** iPhone 15 logical resolution. Every screen is designed against exactly this. */
export const FRAME_WIDTH = 393;
export const FRAME_HEIGHT = 852;

/**
 * The device the design is seen through.
 *
 * Scaling is done with a transform on a wrapper sized to the scaled result,
 * rather than by shrinking the layout: at 0.42 the design has to be *the same
 * design*, laid out at 393px and photographed smaller. Reflowing it instead
 * would mean the canvas showed a layout that exists nowhere.
 */
export function PhoneFrame({
  scale = 1,
  children,
  className,
  ...props
}: {
  scale?: number;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{
        width: FRAME_WIDTH * scale,
        height: FRAME_HEIGHT * scale,
      }}
      {...props}
    >
      <div
        className="origin-top-left"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {/* Bezel. Thin, dark, and the same in both schemes — a real phone does
            not change colour with the app inside it. */}
        <div className="relative h-full w-full rounded-[54px] bg-[oklch(0.19_0.004_285)] p-[11px] shadow-[0_1px_2px_rgba(0,0,0,0.16),0_24px_48px_-12px_rgba(0,0,0,0.28)]">
          <div
            // text-left is defensive: a screen's alignment is the screen's
            // decision, and must not change with whatever the frame is nested
            // inside on the canvas.
            className="relative flex h-full w-full flex-col overflow-hidden rounded-[43px] bg-app-bg text-left text-app-text"
            style={paletteVars(APP_META.accentHue, APP_META.scheme)}
          >
            {/* Dynamic Island. Sits above the status bar row, not inside it. */}
            <div
              aria-hidden
              className="absolute top-[11px] left-1/2 z-30 h-[35px] w-[124px] -translate-x-1/2 rounded-full bg-[oklch(0.14_0.004_285)]"
            />

            <StatusBar />

            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              {children}
            </div>

            <HomeIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}
