import { SigninClient } from "./signin-client";
import { getEnabledProviders } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const providers = getEnabledProviders();
  return <SigninClient providers={providers} />;
}
