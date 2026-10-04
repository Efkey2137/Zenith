"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search } from "lucide-react";
import { normalizeSearch } from "@/lib/validation";
import { FilterPills } from "./filter-pills";
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
      normalizeSearch(`${c.name} ${c.fraction ?? ""}`).includes(
        normalizeSearch(query),
      ),
  );
  return (
    <>
      {characters.length > 0 && (
        <div className="mb-6 space-y-4">
          <label className="block">
            <span className="sr-only">Szukaj postaci</span>
            <span className="search-field">
              <Search size={19} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="field"
                placeholder="Szukaj imienia lub przydomka…"
              />
            </span>
          </label>
          <FilterPills
            label="Frakcja"
            value={faction}
            onChange={setFaction}
            options={[
              { value: "", label: "Wszystkie frakcje" },
              ...factions.map((f) => ({ value: f, label: f })),
            ]}
          />
        </div>
      )}
      <p role="status" className="mb-7 text-sm text-muted-foreground">
        {filtered.length} z {characters.length} postaci
      </p>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-7">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              href={`/characters/${c.slug}`}
              className="group rounded-2xl"
            >
              <div className="portrait aspect-3/4">
                {c.imageUrl ? (
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="(max-width:640px) 45vw, (max-width:1024px) 30vw, 255px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-5xl text-muted-foreground">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="mt-3 font-serif text-xl">{c.name}</h2>
              {c.fraction && (
                <p className="mt-1 text-sm text-muted-foreground">
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
