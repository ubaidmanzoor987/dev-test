import MainContainer from "@/shared/components/layout/MainContainer";
import { getSession, PublicSessionProvider } from "@/features/auth";

export default async function UniversalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // It doesn't matter if the user is authenticated or not,
  // so just pass down a nullable session.
  return (
    <PublicSessionProvider session={session}>
      <MainContainer>{children}</MainContainer>
    </PublicSessionProvider>
  );
}
