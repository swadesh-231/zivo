export const AUTH_COOKIE_PREFIX = "zivo";

export const SIGN_IN_PATH = "/sign-in";

export const AFTER_SIGN_IN_PATH = "/dashboard";

export const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/settings"];

export const GUEST_ONLY_PATHS = ["/", SIGN_IN_PATH];

export const SOCIAL_PROVIDERS = ["google", "github"] as const;

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export const SOCIAL_PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: "Google",
  github: "GitHub",
};

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as readonly string[]).includes(value);
}

export function listProviderLabels(providers: readonly SocialProvider[]) {
  return LIST_FORMAT.format(
    providers.map((provider) => SOCIAL_PROVIDER_LABELS[provider]),
  );
}

const LIST_FORMAT = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});
