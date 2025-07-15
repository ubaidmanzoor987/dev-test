import { getSession, signOut } from "@/features/auth";
import { WelcomeMessage } from "@/features/home";

const HomePage = async () => {
  const session = await getSession();

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <WelcomeMessage name={session?.user.name ?? ""} signOut={handleSignOut} />
  );
};

export default HomePage;
