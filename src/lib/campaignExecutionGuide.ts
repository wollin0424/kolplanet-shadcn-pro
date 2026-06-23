export type CampaignExecutionGuide = {
  contentGuidelines: string;
  mention: string;
  hashtag: string;
  briefFiles: string[];
  referenceLinks: string[];
};

const STORAGE_KEY = "kolplanet:campaign-execution-guide:v1";
const GUIDE_EVENT = "kolplanet:campaign-execution-guide-change";

export const DEFAULT_CAMPAIGN_EXECUTION_GUIDE: CampaignExecutionGuide = {
  contentGuidelines: "打算赌神的萨达爱上打算打算赌神啊赌神啊打算的",
  mention: "打算大的赌神啊d",
  hashtag: "打算打算赌神啊赌神啊",
  briefFiles: ["Frame 2085665168.png", "Frame 2085665168.png"],
  referenceLinks: ["https://kolplanet-ab5zz5ztf-boluobao20-6161s-projects.vercel.app/"],
};

function readStored(): CampaignExecutionGuide | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CampaignExecutionGuide;
  } catch {
    return null;
  }
}

export function getCampaignExecutionGuide(): CampaignExecutionGuide {
  return readStored() ?? DEFAULT_CAMPAIGN_EXECUTION_GUIDE;
}

export function saveCampaignExecutionGuide(payload: CampaignExecutionGuide) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(GUIDE_EVENT, { detail: { key: STORAGE_KEY } }));
}

export function subscribeCampaignExecutionGuideChanges(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  const onCustom = () => listener();

  window.addEventListener("storage", onStorage);
  window.addEventListener(GUIDE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GUIDE_EVENT, onCustom);
  };
}
