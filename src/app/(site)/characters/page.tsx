import { getAllCharacters } from "@/lib/db/queries/characters";
import { CharacterCatalog } from "@/components/site/character-catalog";
export const metadata = { title: "Postacie" };
export default async function CharactersPage() {
  const characters = await getAllCharacters();
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="eyebrow">Bohaterowie opowieści</p>
      <h1 className="text-4xl font-serif mt-4">Postacie</h1>
      <p className="text-muted-foreground mt-4 mb-10">
        Poznaj bohaterów Zenith. Ich biografie mogą zdradzać wydarzenia z
        powieści.
      </p>
      <CharacterCatalog characters={characters} />
    </div>
  );
}
