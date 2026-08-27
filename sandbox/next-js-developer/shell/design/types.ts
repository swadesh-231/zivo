import type { ComponentType } from "react";

/** One screen in the design. `id` is what `navigate()` and tab bars refer to. */
export type ScreenDef = {
  id: string;
  /** Shown under the frame on the canvas. Two or three words. */
  label: string;
  /** One line on what this screen is for. Shown in focus mode. */
  note?: string;
  component: ComponentType;
};

export type AppMeta = {
  /** The product name, exactly as it should appear in the UI. */
  name: string;
  /** Four to seven words on what the app does. */
  tagline: string;
  /**
   * The single hue every colour in the design derives from, 0-360.
   * 25 red · 60 amber · 145 green · 200 cyan · 250 blue · 285 violet · 340 pink
   */
  accentHue: number;
  scheme: "light" | "dark";
};
