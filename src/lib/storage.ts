import type { ChartInput, ChartData } from "../types/astro";

const PROFILES_KEY = "genastral_profiles";
const LAST_INPUT_KEY = "genastral_last_input";

export interface SavedProfile {
  id: string;
  name: string;
  input: ChartInput;
  savedAt: string;
}

export const saveProfiles = (profiles: SavedProfile[]): void => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const loadProfiles = (): SavedProfile[] => {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveLastInput = (input: ChartInput): void => {
  localStorage.setItem(LAST_INPUT_KEY, JSON.stringify(input));
};

export const loadLastInput = (): ChartInput | null => {
  const raw = localStorage.getItem(LAST_INPUT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
