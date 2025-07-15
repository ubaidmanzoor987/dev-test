import { TranslationProvider } from "@/features/i18n";
import { getLanguage } from "@/features/i18n";
import { redirect, RedirectType } from "next/navigation";
import { paths } from "@/config/routes";
import MainContainer from "@/shared/components/layout/MainContainer";
import { getSession, PublicSessionProvider } from "@/features/auth";

const I18N_NAMESPACES = ["home", "translation"];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, language] = await Promise.all([getSession(), getLanguage()]);

  if (session?.user) {
    redirect(paths.homePage, RedirectType.replace);
  }

  // We still want to provide a session to the context
  // to preserve auth state during authentication flows
  return (
    <PublicSessionProvider session={session}>
      <TranslationProvider language={language} namespaces={I18N_NAMESPACES}>
        <MainContainer>{children}</MainContainer>
      </TranslationProvider>
    </PublicSessionProvider>
  );
}
