import { getCharacterBySlug } from "@/lib/db/queries/characters";
import { mobileResponse, mobileError } from "@/lib/mobile-response";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const character = await getCharacterBySlug(slug);
    if (!character)
      return mobileResponse({ error: "Nie znaleziono postaci." }, 404);
    return mobileResponse({
      slug: character.slug,
      name: character.name,
      fraction: character.fraction,
      imageUrl: character.imageUrl,
      bio: character.bio,
    });
  } catch {
    return mobileError();
  }
}
