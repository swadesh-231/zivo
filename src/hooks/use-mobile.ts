import * as React from "react";

const MOBILE_BREAKPOINT = 1024;

const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onStoreChange);

  return () => query.removeEventListener("change", onStoreChange);
}
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
