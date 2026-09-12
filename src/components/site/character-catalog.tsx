"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { normalizeSearch } from "@/lib/validation";
interface Character {
  slug: string;
  name: string;
  fraction: string | null;
  imageUrl: string | null;
}
export function CharacterCatalog({ characters }: { characters: Character[] }) {
  const [query, setQuery] = useState("");
  const [faction, setFaction] = useState("");
  const factions = [
    ...new Set(
      characters.map((c) => c.fraction).filter((f): f is string => !!f),
    ),
  ].sort((a, b) => a.localeCompare(b, "pl"));
  const filtered = characters.filter(
    (c) =>
      (!faction || c.fraction === faction) &&
      normalizeSearch(c.name).includes(normalizeSearch(query)),
  );
  return (
    <>
      {characters.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <label>
            <span className="field-label">Szukaj postaci</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field"
              placeholder="Imię lub przydomek…"
            />
          </label>
          <label>
            <span className="field-label">Frakcja</span>
            <select
              className="field"
              value={faction}
              onChange={(e) => setFaction(e.target.value)}
            >
              <option value="">Wszystkie frakcje</option>
              {factions.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <p role="status" className="text-xs text-muted-foreground mb-6">
        {filtered.length} z {characters.length} postaci
      </p>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filtered.map((c) => (
            <Link key={c.slug} href={`/characters/${c.slug}`} className="group">
              <div className="relative aspect-3/4 rounded-sm overflow-hidden bg-zinc-900 border border-border group-hover:border-primary transition-colors">
                {c.imageUrl ? (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(max-width:640px) 45vw, (max-width:768px) 30vw, 210px"
                    className="object-cover grayscale-40 group-hover:grayscale-0 transition-all"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-5xl text-muted-foreground font-serif">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="mt-3 font-serif text-lg">{c.name}</h2>
              {c.fraction && (
                <p className="text-xs text-muted-foreground mt-1">
                  {c.fraction}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {characters.length
              ? "Nie znaleziono postaci pasujących do filtrów."
              : "Postacie pojawią się tutaj po publikacji przez autora."}
          </p>
          {characters.length > 0 && (
            <button
              className="secondary-button mt-5"
              onClick={() => {
                setQuery("");
                setFaction("");
              }}
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}
    </>
  );
}
