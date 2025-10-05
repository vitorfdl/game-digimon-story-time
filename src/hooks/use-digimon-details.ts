import { useMemo } from "react";
import { useAtomValue } from "jotai";

import { digimonDetailsAtomFamily } from "@/store/atoms";
import { type DigimonDetails } from "@/lib/grindosaur";

export function useDigimonDetails(slug: string): DigimonDetails {
  const detailsAtom = useMemo(() => digimonDetailsAtomFamily(slug), [slug]);
  return useAtomValue(detailsAtom);
}
