import { SigninClient } from "./signin-client";
import { getEnabledProviders } from "@/lib/auth";

export default async function SigninPage() {
  const providers = getEnabledProviders();
  return <SigninClient providers={providers} />;
}
