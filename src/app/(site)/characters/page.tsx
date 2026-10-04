import { getAllCharacters } from "@/lib/db/queries/characters";
import { CharacterCatalog } from "@/components/site/character-catalog";
export const metadata = { title: "Postacie" };
export default async function CharactersPage() {
  const characters = await getAllCharacters();
  return (
    <div className="page-shell">
      <p className="eyebrow">Bohaterowie opowieści</p>
      <h1 className="page-heading mt-3">Postacie</h1>
      <p className="text-muted-foreground leading-relaxed mt-4 mb-9">
        Poznaj bohaterów Zenith. Ich biografie mogą zdradzać wydarzenia z
        powieści.
      </p>
      <CharacterCatalog characters={characters} />
    </div>
  );
}
