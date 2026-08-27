/**
 * Everything a screen is allowed to import from the shell.
 *
 * Screens import from "@/design" and nothing deeper — the internals move, this
 * surface does not.
 */
export {
  Screen,
  ScreenBody,
  NavBar,
  TabBar,
  IconButton,
  type TabItem,
} from "./chrome";
export { useNavigate, useScreen } from "./navigation";
export { palette, type Palette, type Scheme } from "./palette";
export { APP_META } from "./app-meta";
export { SCREENS } from "./screens";
export type { AppMeta, ScreenDef } from "./types";
