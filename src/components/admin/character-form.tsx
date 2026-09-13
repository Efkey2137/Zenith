"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createCharacterAction } from "@/lib/actions/characters";
interface Character {
  id: number;
  name: string;
  slug: string;
  fraction: string | null;
  bio: string;
  imageUrl: string | null;
}
export function CharacterForm({ character }: { character?: Character }) {
  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; message: string }, data: FormData) => {
      const result = await createCharacterAction(data);
      return {
        success: result.success,
        message: result.success ? "Postać została zapisana." : result.error,
      };
    },
    { success: false, message: "" },
  );
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    const frame = requestAnimationFrame(() => setPreview(url));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(url);
    };
  }, [image]);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={character?.id ?? ""} />
      <label className="block">
        <span className="field-label">Imię</span>
        <input
          className="field"
          name="name"
          defaultValue={character?.name}
          required
          maxLength={200}
        />
      </label>
      <label className="block">
        <span className="field-label">
          Adres postaci {character ? "(stały)" : "(opcjonalnie)"}
        </span>
        <input
          className="field"
          name="slug"
          defaultValue={character?.slug}
          readOnly={!!character}
          placeholder="np. imie-postaci"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={160}
        />
      </label>
      <label className="block">
        <span className="field-label">Frakcja (opcjonalnie)</span>
        <input
          className="field"
          name="faction"
          defaultValue={character?.fraction ?? ""}
          maxLength={200}
        />
      </label>
      <label className="block">
        <span className="field-label">Biografia (Markdown)</span>
        <textarea
          className="field"
          name="bio"
          defaultValue={character?.bio}
          rows={10}
          required
          maxLength={100000}
        />
      </label>
      <label className="block">
        <span className="field-label">
          Portret · JPG, PNG lub WebP, do 2 MB
        </span>
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm max-w-full"
          onChange={(e) => {
            setImage(e.target.files?.[0] ?? null);
            setPreview(null);
          }}
        />
      </label>
      {(preview || character?.imageUrl) && (
        <div>
          <Image
            unoptimized
            width={128}
            height={171}
            src={preview ?? character!.imageUrl!}
            alt="Podgląd portretu"
            className="w-32 aspect-3/4 object-cover border border-border"
          />
        </div>
      )}
      {character?.imageUrl && (
        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="removeImage" />
          Usuń portret z profilu
        </label>
      )}
      <button className="primary-button" disabled={pending}>
        {pending
          ? "Zapisywanie…"
          : character
            ? "Zapisz zmiany"
            : "Dodaj postać"}
      </button>
      <p
        role="status"
        className={`text-sm ${state.success ? "text-emerald-300" : "text-red-300"}`}
      >
        {state.message}
      </p>
      {state.success && character && (
        <Link
          className="inline-block text-sm"
          href={`/characters/${character.slug}`}
        >
          Zobacz profil →
        </Link>
      )}
    </form>
  );
}
