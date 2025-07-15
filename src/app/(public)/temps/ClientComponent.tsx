"use client";

import { cookieName } from "@/config/i18n";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const setLanguageCookie = (value: string) => {
  document.cookie = `${cookieName}=${value}`;
};

const ClientComponent = () => {
  const router = useRouter();

  const { t, i18n } = useTranslation();

  return (
    <div>
      <Button
        variant="secondary"
        className="mb-4"
        onClick={async () => {
          const newLanguage = i18n.resolvedLanguage === "en" ? "de" : "en";
          await i18n.changeLanguage(newLanguage);
          setLanguageCookie(newLanguage);
          router.refresh();
        }}
      >
        Change language to {i18n.resolvedLanguage === "en" ? "de" : "en"}
      </Button>

      <p className="underline">ClientComponent: </p>
      <p>Title: {t("title")}</p>
      <p>Description: {t("translation:description")}</p>
      <p>Text: {t("home:text")}</p>
    </div>
  );
};

export default ClientComponent;
