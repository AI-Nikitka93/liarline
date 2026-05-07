export type AssetProvenanceRecord = {
  releasePath: string;
  sourcePath: string;
  origin: "ai-generated curated asset";
  licenseStatus: "project-owned generated asset";
  approvedForRelease: boolean;
  audit: string;
};

export type ReferenceMaterialProvenanceRecord = {
  label: string;
  source: string;
  usage: "reference only, no copied asset or layout";
};

export const assetProvenance: AssetProvenanceRecord[] = [
  {
    releasePath: "/assets/case-lab-hero.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_07_15.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; cropped as case hero"
  },
  {
    releasePath: "/assets/interrogation-bg.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_26_52.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; used as atmospheric background"
  },
  {
    releasePath: "/assets/evidence-paper.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_26_55.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; used as evidence texture"
  },
  {
    releasePath: "/assets/suspect-ivo.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_26_57.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; suspect portrait"
  },
  {
    releasePath: "/assets/suspect-mara.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_27_01.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; suspect portrait"
  },
  {
    releasePath: "/assets/suspect-theo.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_27_04.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; suspect portrait"
  },
  {
    releasePath: "/assets/suspect-lena.png",
    sourcePath: "_archive/raw-generated-assets/ChatGPT Image 5 мая 2026 г., 14_27_07.png",
    origin: "ai-generated curated asset",
    licenseStatus: "project-owned generated asset",
    approvedForRelease: true,
    audit: "approved for current mobile use; no visible watermark; no readable third-party logo; suspect portrait"
  }
];

export const referenceMaterialProvenance: ReferenceMaterialProvenanceRecord[] = [
  {
    label: "Mobile detective and interrogation UI references",
    source: "_archive/agent-memory/docs/visual/REFERENCE_SET_2026-05-06.md",
    usage: "reference only, no copied asset or layout"
  },
  {
    label: "Visual evidence and anti-pattern notes",
    source: "_archive/agent-memory/docs/visual/VISUAL_EVIDENCE_2026-05-06.md",
    usage: "reference only, no copied asset or layout"
  },
  {
    label: "Design pattern boundary decisions",
    source: "_archive/agent-memory/docs/visual/PATTERN_BOUNDARIES_2026-05-06.md",
    usage: "reference only, no copied asset or layout"
  },
  {
    label: "Root visual direction",
    source: "DESIGN.md",
    usage: "reference only, no copied asset or layout"
  }
];
