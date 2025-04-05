export type ProviderConfig = {
  id: string;
  name: string;
  enabled: boolean;
};

export function getEnabledProviders(): ProviderConfig[] {
  return [
    {
      id: "keycloak",
      name: "Keycloak",
      enabled: Boolean(
        process.env.KEYCLOAK_ID &&
          process.env.KEYCLOAK_SECRET &&
          process.env.KEYCLOAK_ISSUER
      ),
    },
    {
      id: "github",
      name: "GitHub",
      enabled: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
    },
    {
      id: "google",
      name: "Google",
      enabled: Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
    },
  ].filter((provider) => provider.enabled);
}
