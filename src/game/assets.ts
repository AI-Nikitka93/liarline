export const ASSETS = {
  caseHero: "/assets/case-lab-hero.png",
  interrogationBackground: "/assets/interrogation-bg.png",
  evidencePaper: "/assets/evidence-paper.png",
  suspectPortraits: {
    suspect_ivo: "/assets/suspect-ivo.png",
    suspect_mara: "/assets/suspect-mara.png",
    suspect_theo: "/assets/suspect-theo.png",
    suspect_lena: "/assets/suspect-lena.png"
  }
} as const;

export function getSuspectPortrait(suspectId: string): string | null {
  return ASSETS.suspectPortraits[suspectId as keyof typeof ASSETS.suspectPortraits] ?? null;
}
