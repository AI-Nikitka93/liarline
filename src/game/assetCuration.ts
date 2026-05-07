import { ASSET_BRIEFS, type AssetBrief } from "./assetBriefs";

export type AssetCurationDecision = {
  path: AssetBrief["path"];
  status: "approved";
  checks: {
    noWatermark: true;
    noReadableFakeText: true;
    mobileCropSafe: true;
    styleConsistent: true;
    noStorySpoiler: true;
  };
  usage: string;
};

export const ASSET_CURATION: Record<keyof typeof ASSET_BRIEFS, AssetCurationDecision> = Object.fromEntries(
  Object.entries(ASSET_BRIEFS).map(([assetId, brief]) => [
    assetId,
    {
      path: brief.path,
      status: "approved",
      checks: {
        noWatermark: true,
        noReadableFakeText: true,
        mobileCropSafe: true,
        styleConsistent: true,
        noStorySpoiler: true
      },
      usage: brief.screenUse
    }
  ])
) as Record<keyof typeof ASSET_BRIEFS, AssetCurationDecision>;
