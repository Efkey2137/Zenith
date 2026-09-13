import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "./session";

export const ADMIN_COOKIE = "zenith-admin";
export function adminConfigured() {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 24;
}
export async function isAdmin() {
  return verifySession(
    (await cookies()).get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_PASSWORD ?? "",
  );
}
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}
