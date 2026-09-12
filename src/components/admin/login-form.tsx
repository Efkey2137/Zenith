"use client";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, "");
  return (
    <form action={action} className="max-w-sm space-y-5">
      <label className="block">
        <span className="field-label">Hasło autora</span>
        <input
          className="field"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
        />
      </label>
      <button className="primary-button" disabled={pending}>
        {pending ? "Logowanie…" : "Wejdź do panelu"}
      </button>
      <p role="status" className="text-sm text-red-300">
        {error}
      </p>
    </form>
  );
}
