import { redirect, RedirectType } from "next/navigation";
import { paths } from "@/config/routes";
import MainContainer from "@/shared/components/layout/MainContainer";
import { getSession, SessionProvider } from "@/features/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The middleware has confirmed we have a cookie, but we
  // still need to check if the user is authenticated
  if (!session?.user) {
    redirect(paths.landingPage, RedirectType.replace);
  }

  return (
    <SessionProvider session={session}>
      <MainContainer>{children}</MainContainer>
    </SessionProvider>
  );
}
