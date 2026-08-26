import "server-only";

import { SOCIAL_PROVIDERS, type SocialProvider } from "@/lib/auth-config";
import { optionalEnv } from "@/lib/env";

type Credentials = { clientId: string; clientSecret: string };

const ENV_NAMES: Record<SocialProvider, { id: string; secret: string }> = {
  google: { id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET" },
  github: { id: "GITHUB_CLIENT_ID", secret: "GITHUB_CLIENT_SECRET" },
};

export function socialProviderCredentials() {
  const configured: Partial<Record<SocialProvider, Credentials>> = {};

  for (const provider of SOCIAL_PROVIDERS) {
    const names = ENV_NAMES[provider];
    const clientId = optionalEnv(names.id);
    const clientSecret = optionalEnv(names.secret);

    if (clientId && clientSecret) {
      configured[provider] = { clientId, clientSecret };
      continue;
    }
    if (clientId || clientSecret) {
      console.error(
        `Ignoring the ${provider} sign-in provider: set both ${names.id} and ${names.secret}.`,
      );
    }
  }

  return configured;
}

export function configuredSocialProviders(): SocialProvider[] {
  return Object.keys(socialProviderCredentials()) as SocialProvider[];
}
