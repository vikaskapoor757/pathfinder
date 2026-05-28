import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./src/i18n/routing";
import { updateSession } from "./src/lib/supabase/middleware";

const intl = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = intl(request);
  await updateSession(request, response);
  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
