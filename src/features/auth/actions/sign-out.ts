"use server";

import { signOut } from "@/features/auth";

export async function handleSignOut() {
  await signOut();
}
