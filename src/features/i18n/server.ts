import { cookieName, fallbackLng } from "@/config/i18n";
import type { FlatNamespace, KeyPrefix } from "i18next";
import { cookies } from "next/headers";
import { cache } from "react";
import type { FallbackNs } from "react-i18next";
import { createI18next } from "./i18next";
import type { $FirstNamespace, $Tuple } from "./types";

export const createI18nextCached = cache(createI18next);

export const getLanguage = async () => {
  return (await cookies()).get(cookieName)?.value ?? fallbackLng;
};

export async function getTranslation<
  Ns extends FlatNamespace | $Tuple<FlatNamespace>,
  KPrefix extends KeyPrefix<
    FallbackNs<
      Ns extends FlatNamespace ? FlatNamespace : $FirstNamespace<FlatNamespace>
    >
  > = undefined,
>(ns?: Ns, options: { keyPrefix?: KPrefix } = {}) {
  const language = await getLanguage();

  const i18next = createI18nextCached({
    language,
    namespaces: ns as string | string[],
  });

  if (language && i18next.resolvedLanguage !== language) {
    await i18next.changeLanguage(language);
  }

  if (ns && !i18next.hasLoadedNamespace(ns as string | string[])) {
    await i18next.loadNamespaces(ns as string | string[]);
  }

  return {
    t: Array.isArray(ns)
      ? i18next.getFixedT(
          language,
          (ns as $Tuple<FlatNamespace>)[0],
          options.keyPrefix,
        )
      : i18next.getFixedT(language, ns as FlatNamespace, options.keyPrefix),

    i18n: i18next,
  };
}
