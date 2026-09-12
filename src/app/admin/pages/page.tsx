import { requireAdmin } from "@/lib/auth";
import { getPage } from "@/lib/db/queries/pages";
import { pageDefinitions } from "@/lib/pages";
import { PageEditor } from "@/components/admin/page-editor";
export default async function AdminPages() {
  await requireAdmin();
  const entries = await Promise.all(
    Object.entries(pageDefinitions).map(async ([slug, definition]) => ({
      slug,
      title: definition.title,
      content: (await getPage(slug))?.content ?? "",
    })),
  );
  return (
    <div className="max-w-3xl mx-auto">
      <p className="eyebrow">Kompendium</p>
      <h1 className="font-serif text-3xl mt-4">Sekcje strony</h1>
      <p className="text-muted-foreground my-6">
        Tutaj publikujesz własny opis świata, systemu mocy i autora. Pusty tekst
        wycofuje opis z widoku czytelnika.
      </p>
      {entries.map((entry) => (
        <PageEditor key={entry.slug} {...entry} />
      ))}
    </div>
  );
}
