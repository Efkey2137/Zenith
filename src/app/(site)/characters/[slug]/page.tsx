import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getCharacterBySlug } from "@/lib/db/queries/characters";

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const character = await getCharacterBySlug(slug);

  if (!character) notFound();

  return (
    <article className="max-w-4xl mx-auto px-6 py-20">
      <Link
        href="/characters"
        className="inline-block text-sm text-muted-foreground mb-8"
      >
        ← Wszystkie postacie
      </Link>
      <div className="grid md:grid-cols-[280px_1fr] gap-10">
        <div className="relative aspect-3/4 rounded-md overflow-hidden bg-zinc-900 border border-border">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={character.name}
              fill
              sizes="280px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground font-serif">
              {character.name.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-serif text-foreground">
            {character.name}
          </h1>
          {character.fraction && (
            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
              {character.fraction}
            </p>
          )}
          <div className="mt-8 prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed">
            <ReactMarkdown>{character.bio}</ReactMarkdown>
          </div>
        </div>
      </div>
    </article>
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const character = await getCharacterBySlug(slug);
  return { title: character?.name ?? "Postać nie istnieje" };
}
