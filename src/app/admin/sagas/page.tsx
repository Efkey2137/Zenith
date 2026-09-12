import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sagas } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { SagaForm } from "@/components/admin/saga-form";
export default async function AdminSagas({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;
  const all = await getDb()
    .select()
    .from(sagas)
    .orderBy(asc(sagas.order), asc(sagas.id));
  const saga = all.find((s) => s.id === Number(edit));
  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-10">
      <aside>
        <h2 className="eyebrow mb-5">Sagi</h2>
        <Link href="/admin/sagas" className="secondary-button mb-5">
          + Nowa saga
        </Link>
        <ul className="space-y-4 text-sm">
          {all.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/sagas?edit=${s.id}`}>
                {s.title}
                <span className="block mt-1 text-xs text-muted-foreground">
                  {s.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <section className="max-w-xl">
        <h1 className="font-serif text-3xl mb-8">
          {saga ? "Edytuj sagę" : "Dodaj sagę"}
        </h1>
        <SagaForm key={saga?.id ?? "new"} saga={saga} />
      </section>
    </div>
  );
}
