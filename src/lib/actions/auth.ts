"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminConfigured } from "@/lib/auth";
import { equalSecrets, signSession, SESSION_SECONDS } from "@/lib/auth/session";

export async function loginAction(_state: string, data: FormData) {
  const password = data.get("password");
  if (!adminConfigured())
    return "Panel autora nie został jeszcze skonfigurowany.";
  if (
    typeof password !== "string" ||
    password.length > 1024 ||
    !equalSecrets(password, process.env.ADMIN_PASSWORD!)
  ) {
    return "Nieprawidłowe hasło.";
  }
  (await cookies()).set(
    ADMIN_COOKIE,
    signSession(process.env.ADMIN_PASSWORD!),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_SECONDS,
    },
  );
  redirect("/admin/chapters");
}
export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}
