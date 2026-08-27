import { DesignCanvas } from "@/design/canvas";

/**
 * The whole app is one route: the design workspace.
 *
 * Screens are entries in `design/screens.ts`, not Next.js routes. Adding a
 * route would put a second navigation model next to the one the design already
 * has, and the preview would show one of them at random.
 */
export default function DesignPage() {
  return <DesignCanvas />;
}
