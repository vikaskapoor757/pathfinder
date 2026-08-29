import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Root route auto-detects browser language and routes to /de or /en.
// Everything non-English defaults to /de since Germany is the target market.
export default async function RootPage() {
  const acceptLang = (await headers()).get("accept-language") ?? "";
  const primary = acceptLang
    .toLowerCase()
    .split(",")[0]
    ?.split("-")[0]
    ?.trim();
  redirect(primary === "en" ? "/en" : "/de");
}
