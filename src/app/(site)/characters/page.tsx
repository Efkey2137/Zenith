import Link from 'next/link';
import Image from 'next/image';
import { getAllCharacters } from '@/lib/db/queries/characters';

export default async function CharactersPage() {
  const allCharacters = await getAllCharacters();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-serif text-foreground mb-10">Postacie</h1>

      {allCharacters.length === 0 ? (
        <p className="text-muted-foreground">Brak dodanych postaci.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {allCharacters.map((character) => (
            <Link key={character.slug} href={`/characters/${character.slug}`} className="group">
              <div className="relative aspect-3/4 rounded-md overflow-hidden bg-zinc-900 border border-border group-hover:border-primary transition-colors">
                {character.imageUrl ? (
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover grayscale-40 group-hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground font-serif">
                    {character.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="mt-3 text-foreground font-medium group-hover:text-primary transition-colors">
                {character.name}
              </p>
              {character.fraction && (
                <p className="text-xs text-muted-foreground">{character.fraction}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}