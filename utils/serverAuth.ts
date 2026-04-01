"use server";

import { cookies } from "next/headers";
import { User } from "@/types";
import { getServerAppOrigin } from "@/utils/getServerAppOrigin";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const uid = cookieStore.get("uid")?.value;

    if (!uid) {
      return null;
    }

    const origin = await getServerAppOrigin();
    const response = await fetch(`${origin}/api/users/${encodeURIComponent(uid)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user as User;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}
