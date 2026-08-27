"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { SCREENS } from "./screens";

type NavigationValue = {
  activeId: string | null;
  navigate: (id: string) => void;
  /** True inside a single interactive phone, false on the overview canvas. */
  isFocused: boolean;
};

const NavigationContext = createContext<NavigationValue>({
  activeId: null,
  navigate: () => {},
  isFocused: false,
});

export function NavigationProvider({
  activeId,
  onNavigate,
  isFocused,
  children,
}: {
  activeId: string | null;
  onNavigate: (id: string) => void;
  isFocused: boolean;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ activeId, navigate: onNavigate, isFocused }),
    [activeId, onNavigate, isFocused],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Move to another screen by id.
 *
 * In focus mode this swaps the screen inside the phone. On the canvas, where
 * every screen is already visible, it scrolls that frame into view instead —
 * so a tab bar stays honest in both places without the screen knowing which
 * one it is in.
 */
export function useNavigate() {
  return useContext(NavigationContext).navigate;
}

export function useScreen() {
  return useContext(NavigationContext);
}

/**
 * Drives the canvas/focus switch in `app/page.tsx`.
 *
 * `navigate` here is the canvas behaviour only — every screen is already on
 * screen, so a tab tap scrolls its frame into view rather than swapping
 * anything. Focus mode passes `setFocusId` instead, which is the real
 * navigation. Same hook in the screen either way.
 */
export function useScreenRouter() {
  const [focusId, setFocusId] = useState<string | null>(null);

  const navigate = useCallback((id: string) => {
    if (!SCREENS.some((screen) => screen.id === id)) return;

    document
      .getElementById(`frame-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, []);

  return { focusId, setFocusId, navigate };
}
