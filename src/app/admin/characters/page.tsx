import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { CharacterForm } from "@/components/admin/character-form";
export default async function AdminCharacters({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireAdmin();
  const { edit } = await searchParams;
  const all = await getDb()
    .select({ id: characters.id, name: characters.name })
    .from(characters)
    .orderBy(asc(characters.name));
  const character = edit
    ? (
        await getDb()
          .select()
          .from(characters)
          .where(eq(characters.id, Number(edit)))
          .limit(1)
      )[0]
    : undefined;
  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-10">
      <aside>
        <h2 className="eyebrow mb-5">Postacie</h2>
        <Link href="/admin/characters" className="secondary-button mb-5">
          + Nowa postać
        </Link>
        <ul className="space-y-3 text-sm">
          {all.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/characters?edit=${c.id}`}
                aria-current={character?.id === c.id ? "page" : undefined}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <section className="max-w-xl">
        <h1 className="font-serif text-3xl mb-8">
          {character ? `Edytuj: ${character.name}` : "Dodaj postać"}
        </h1>
        <CharacterForm key={character?.id ?? "new"} character={character} />
      </section>
    </div>
  );
}
