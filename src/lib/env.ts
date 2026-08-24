export function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function optionalEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }

  return undefined;
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function appUrl() {
  return (
    optionalEnv("BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    "http://localhost:3000"
  );
}
