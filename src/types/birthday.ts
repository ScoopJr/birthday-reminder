export type Birthday = {
  id: string;
  name: string;
  day: number;      // 1–31
  month: number;    // 1–12
  year?: number;    // OPTIONAL
  timezone: string;
  photoUrl?: string;
};
