import { getSession } from "@/features/auth";
import HomeClient from './HomeClient';

export default async function HomePage() {
  const session = await getSession();
  return <HomeClient userName={session?.user?.name ?? null} session={session} />;
}
