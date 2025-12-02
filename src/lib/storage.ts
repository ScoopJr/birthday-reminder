import type { Birthday } from "@/types/birthday";

const STORAGE_KEY = "birthdays-v1";

export function loadBirthdays(): Birthday[] {
  // window is not defined on the server in Next.js,
  // so we guard against that.
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Birthday[];
  } catch {
    // if something is corrupted, just reset to empty
    return [];
  }
}

export function saveBirthdays(birthdays: Birthday[]) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(birthdays);
  window.localStorage.setItem(STORAGE_KEY, raw);
}
