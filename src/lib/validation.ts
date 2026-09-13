import slugify from "slugify";
export class ValidationError extends Error {}

export function textField(data: FormData, name: string, max = 200) {
  const value = data.get(name);
  if (value !== null && typeof value !== "string")
    throw new ValidationError("Nieprawidłowy format formularza.");
  const text = (value ?? "").trim();
  if (text.length > max)
    throw new ValidationError(
      `Pole jest zbyt długie (maksymalnie ${max} znaków).`,
    );
  return text;
}
export function validSlug(value: unknown, fallback = "") {
  const slug =
    typeof value === "string" && value.trim()
      ? value.trim()
      : slugify(fallback, { lower: true, strict: true });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160)
    throw new ValidationError(
      "Adres może zawierać małe litery, cyfry i myślniki (do 160 znaków).",
    );
  return slug;
}
export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}
