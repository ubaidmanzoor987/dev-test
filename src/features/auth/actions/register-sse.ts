 "use server";

import { getSession } from "@/features/auth";
import { redirect } from "next/navigation";
import { paths } from "@/config/routes";

export async function handlePostSignIn() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect(paths.landingPage);
  }

  // Redirect to home page with SSE registration flag
  redirect(`${paths.homePage}?register_sse=true`);
}