export const pageDefinitions = {
  world: {
    title: "Świat",
    eyebrow: "Atlas Zenith",
    description: "Miejsca, krainy i historie, które tworzą świat powieści.",
    empty: "Atlas czeka na pierwsze wpisy autora.",
  },
  "power-system": {
    title: "System Mocy",
    eyebrow: "Kompendium",
    description: "Zasady, możliwości i granice mocy w świecie Zenith.",
    empty: "Opis systemu mocy pojawi się tutaj po publikacji przez autora.",
  },
  author: {
    title: "Autor",
    eyebrow: "Za opowieścią",
    description: "O autorze i pracy nad powieścią.",
    empty: "Autor nie opublikował jeszcze informacji o sobie.",
  },
} as const;
export type PageSlug = keyof typeof pageDefinitions;
export function isPageSlug(slug: string): slug is PageSlug {
  return Object.hasOwn(pageDefinitions, slug);
}
