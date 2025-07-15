import { defaultNS, fallbackLng, languages } from "@/config/i18n";
import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

export interface CreateI18nextProps {
  readonly language: string;
  readonly namespaces: string | string[];
}

export const createI18next = ({ language, namespaces }: CreateI18nextProps) => {
  const i18nInstance = createInstance();

  void i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./namespaces/${namespace}/${language}.json`),
      ),
    )
    .init({
      supportedLngs: languages,
      fallbackLng,
      lng: language,
      ns: namespaces,
      fallbackNS: defaultNS,
      defaultNS,
      preload: languages,
    });

  return i18nInstance;
};
