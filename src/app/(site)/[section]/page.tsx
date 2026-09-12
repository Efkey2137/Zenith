import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPage } from "@/lib/db/queries/pages";
import { isPageSlug, pageDefinitions } from "@/lib/pages";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: isPageSlug(section)
      ? pageDefinitions[section].title
      : "Nie znaleziono strony",
  };
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isPageSlug(section)) notFound();
  const definition = pageDefinitions[section];
  const page = await getPage(section);
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <p className="eyebrow">{definition.eyebrow}</p>
      <h1 className="font-serif text-4xl mt-4">{definition.title}</h1>
      <p className="text-muted-foreground mt-4 mb-10 leading-relaxed">
        {definition.description}
      </p>
      {page?.content ? (
        <div className="prose prose-invert prose-zinc prose-headings:font-serif max-w-none break-words">
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </div>
      ) : (
        <div className="empty-state">
          <p>{definition.empty}</p>
          <Link href="/chapters" className="secondary-button mt-6">
            Przejdź do opowieści →
          </Link>
        </div>
      )}
    </article>
  );
}
