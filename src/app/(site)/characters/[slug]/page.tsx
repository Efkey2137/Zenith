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
    <article className="page-shell max-w-5xl">
      <Link href="/characters" className="back-link mb-8">
        ← Wszystkie postacie
      </Link>
      <div className="grid md:grid-cols-[280px_1fr] gap-10">
        <div className="portrait mx-auto w-full max-w-[320px] aspect-3/4">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={character.name}
              fill
              sizes="(max-width:768px) 320px, 280px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground font-serif">
              {character.name.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h1 className="page-heading">{character.name}</h1>
          {character.fraction && (
            <p className="mt-3 text-sm text-brass">{character.fraction}</p>
          )}
          <div className="mt-8 prose zenith-prose max-w-none">
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
