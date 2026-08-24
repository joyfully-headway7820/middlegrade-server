export const FALLBACK_SESSION_SECRET = "insecure-development-secret";

export const resolveSessionSecret = (
  secret: string | undefined,
  isProduction: boolean
): string => {
  if (secret) {
    return secret;
  }

  if (isProduction) {
    console.error("SESSION_SECRET is not set");
  }

  return FALLBACK_SESSION_SECRET;
};
