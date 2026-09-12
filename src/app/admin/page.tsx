import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
export default async function AdminPage() {
  if (await isAdmin()) redirect("/admin/chapters");
  return (
    <div className="max-w-lg mx-auto py-8">
      <p className="eyebrow">Za kulisami Zenith</p>
      <h1 className="font-serif text-3xl mt-4 mb-6">Panel autora</h1>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="text-muted-foreground leading-relaxed">
          Panel czeka na konfigurację dostępu. Administrator musi ustawić hasło
          autora w konfiguracji aplikacji.
        </p>
      )}
    </div>
  );
}
