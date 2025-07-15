import { cookieName, fallbackLng, languages } from "@/config/i18n";
import type { Middleware } from "../types";
import acceptLanguage from "accept-language";
import { type NextResponse, type NextRequest } from "next/server";
import { withCookies } from "../utils";

acceptLanguage.languages(languages);

const detectLanguage = (req: NextRequest) => {
  const cookieLanguage = req.cookies.has(cookieName)
    ? acceptLanguage.get(req.cookies.get(cookieName)?.value)
    : null;

  if (cookieLanguage && languages.includes(cookieLanguage)) {
    return cookieLanguage;
  }

  const headerLanguage = acceptLanguage.get(req.headers.get("Accept-Language"));

  if (headerLanguage && languages.includes(headerLanguage)) {
    return headerLanguage;
  }

  return fallbackLng;
};

export const i18nMiddleware: Middleware = async (req, next) => {
  const language = detectLanguage(req);

  const response = await next();

  const newResponse = withCookies(response as NextResponse, {
    [cookieName]: { value: language, options: { path: "/" } },
  });

  return newResponse;
};
