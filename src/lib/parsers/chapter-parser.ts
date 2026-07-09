import matter from 'gray-matter';
import slugify from 'slugify';

interface ParsedChapter {
  slug: string;
  title: string;
  chapterNumber: number;
  sagaSlug: string;
  content: string;
}

export function parseChapterFile(rawFile: string, fallbackTitle: string): ParsedChapter {
  const { data, content } = matter(rawFile);

  const title: string = data.title ?? fallbackTitle;
  const chapterNumber = Number(data.chapterNumber);
  const sagaSlug: string = data.saga;
  const slug: string = data.slug ?? slugify(title, { lower: true, strict: true });

  if (!title || Number.isNaN(chapterNumber)) {
    throw new Error('Plik musi zawierać frontmatter z polami "title" i "chapterNumber".');
  }
  if (!sagaSlug) {
    throw new Error('Plik musi zawierać pole "saga" wskazujące slug istniejącej Sagi, np.:\nsaga: cykl-duszorzezcy');
  }

  return { slug, title, chapterNumber, sagaSlug, content: content.trim() };
}