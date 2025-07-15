"use client";

import type { i18n } from "i18next";
import { type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18next, type CreateI18nextProps } from "./i18next";

let i18next: i18n | undefined;
const createI18nextSingleton = ({
  language,
  namespaces,
}: CreateI18nextProps) => {
  if (typeof window === "undefined") {
    // Server: always make a new i18next
    return createI18next({
      language,
      namespaces,
    });
  }

  // Browser: use singleton pattern to keep the same i18next
  i18next ??= createI18next({
    language,
    namespaces,
  });

  return i18next;
};

interface TranslationProviderProps extends CreateI18nextProps {
  children: ReactNode;
}

export const TranslationProvider = ({
  children,
  language,
  namespaces,
}: TranslationProviderProps) => {
  const i18next = createI18nextSingleton({
    language,
    namespaces,
  });

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
};
