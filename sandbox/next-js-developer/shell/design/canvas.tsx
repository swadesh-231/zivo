"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight, LayoutGrid, X } from "lucide-react";

import { APP_META } from "./app-meta";
import { PhoneFrame } from "./frame";
import { NavigationProvider, useScreenRouter } from "./navigation";
import { palette } from "./palette";
import { SCREENS } from "./screens";

const CANVAS_SCALE = 0.46;

function EmptyState() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
      <LayoutGrid className="size-7 opacity-25" />
      <p className="text-sm font-medium">This design has no screens yet</p>
      <p className="max-w-xs text-[13px] leading-relaxed opacity-60">
        Add entries to <code className="font-mono">design/screens.ts</code>.
      </p>
    </div>
  );
}

/** The overview: every screen at once, which is what makes it read as a design. */
function Canvas({
  onOpen,
  onNavigate,
}: {
  onOpen: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const accent = palette(APP_META.accentHue, "light").accent;

  return (
    <div className="zv-canvas min-h-svh w-full">
      <header className="flex flex-col items-center gap-1.5 px-6 pt-14 pb-10 text-center">
        <span
          className="mb-1 size-2.5 rounded-full"
          style={{ background: accent }}
          aria-hidden
        />
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em]">
          {APP_META.name}
        </h1>
        <p className="max-w-md text-[13px] leading-relaxed opacity-55">
          {APP_META.tagline}
        </p>
        <p className="mt-3 text-[11px] tracking-wide opacity-40 uppercase">
          {SCREENS.length} screens · tap any screen to open it
        </p>
      </header>

      <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10 px-8 pb-24">
        {SCREENS.map((screen, index) => (
          <div
            key={screen.id}
            id={`frame-${screen.id}`}
            className="flex flex-col items-center gap-3"
          >
            {/* One provider per frame, not one for the canvas: on the overview
                each phone IS its own screen, so its tab bar has to report that
                screen as active. Sharing a single provider highlighted the same
                tab in all six frames, including the ones that are not it. */}
            <NavigationProvider
              activeId={screen.id}
              onNavigate={onNavigate}
              isFocused={false}
            >
              <div className="relative transition-transform duration-200 hover:-translate-y-1">
                {/*
                  The frame is NOT inside the button, and the screen is inert.

                  Wrapping it was invalid HTML the moment a screen contained a
                  button of its own — which every screen does, for its tab bar
                  alone. Nested buttons fail hydration, and React then rebuilds
                  the whole tree on the client. It also silently centred every
                  screen, because browsers default a button to text-align:
                  center and the screens inherited it: the overview showed a
                  layout that did not exist in focus mode.

                  `inert` keeps the preview's own controls out of the tab order
                  and lets the overlay take the click, which is the right
                  behaviour anyway — the canvas is for looking, focus is for
                  using.
                */}
                <div inert>
                  <PhoneFrame scale={CANVAS_SCALE}>
                    <screen.component />
                  </PhoneFrame>
                </div>

                <button
                  type="button"
                  onClick={() => onOpen(screen.id)}
                  aria-label={`Open ${screen.label}`}
                  className="absolute inset-0 rounded-[26px] focus-visible:ring-2 focus-visible:ring-current/50 focus-visible:outline-none"
                />
              </div>
            </NavigationProvider>

            <div className="text-center">
              <p className="text-[12px] font-medium tracking-[-0.01em]">
                <span className="mr-1.5 tabular-nums opacity-35">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {screen.label}
              </p>
              {screen.note ? (
                <p className="mt-0.5 max-w-[180px] text-[11px] leading-snug opacity-45">
                  {screen.note}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One screen, full size and fully interactive. */
function Focus({
  activeId,
  onClose,
  onStep,
  onNavigate,
}: {
  activeId: string;
  onClose: () => void;
  onStep: (delta: number) => void;
  onNavigate: (id: string) => void;
}) {
  const index = SCREENS.findIndex((screen) => screen.id === activeId);
  const screen = SCREENS[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  if (!screen) return null;

  return (
    <div className="zv-canvas flex min-h-svh flex-col items-center">
      <div className="flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-current/5"
        >
          <X className="size-3.5" />
          Overview
        </button>

        <div className="min-w-0 text-center">
          <p className="truncate text-[13px] font-medium">{screen.label}</p>
          {screen.note ? (
            <p className="truncate text-[11px] opacity-50">{screen.note}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {[
            { delta: -1, icon: ArrowLeft, label: "Previous screen" },
            { delta: 1, icon: ArrowRight, label: "Next screen" },
          ].map(({ delta, icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onStep(delta)}
              aria-label={label}
              className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-current/5"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 pb-12">
        <NavigationProvider
          activeId={activeId}
          onNavigate={onNavigate}
          isFocused
        >
          <PhoneFrame>
            <screen.component />
          </PhoneFrame>
        </NavigationProvider>
      </div>
    </div>
  );
}

/**
 * The design workspace. `app/page.tsx` renders this and nothing else.
 *
 * Both modes share one navigation context, so a tab bar written once works in
 * both: in focus it swaps the screen, on the canvas it scrolls that frame into
 * view. The screen never has to know which mode it is in.
 */
export function DesignCanvas() {
  const { focusId, setFocusId, navigate } = useScreenRouter();

  if (SCREENS.length === 0) return <EmptyState />;

  const step = (delta: number) => {
    const index = SCREENS.findIndex((screen) => screen.id === focusId);
    const next = SCREENS[(index + delta + SCREENS.length) % SCREENS.length];

    if (next) setFocusId(next.id);
  };

  return (
    <main className="min-h-svh w-full">
      {focusId === null ? (
        <Canvas onOpen={setFocusId} onNavigate={navigate} />
      ) : (
        <Focus
          activeId={focusId}
          onClose={() => setFocusId(null)}
          onStep={step}
          onNavigate={setFocusId}
        />
      )}
    </main>
  );
}
