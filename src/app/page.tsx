"use client";

import { useEffect, useState } from "react";
import type { Birthday } from "@/types/birthday";
import { loadBirthdays, saveBirthdays } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatBirthdayDate(b: Birthday): string {
  const monthName = MONTH_NAMES[b.month - 1] ?? `Month ${b.month}`;
  return `${b.day} ${monthName}`;
}

// Helper: how many days until this birthday (ignoring year)
function daysUntil(b: Birthday): number {
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const thisYear = new Date(
    today.getFullYear(),
    b.month - 1,
    b.day
  );

  let next = thisYear;

  if (next < todayMidnight) {
    next = new Date(today.getFullYear() + 1, b.month - 1, b.day);
  }

  const diffMs = next.getTime() - todayMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Helper: what age they are turning (if year known)
function ageTurning(b: Birthday): number | null {
  if (!b.year) return null;

  const today = new Date();
  const birthThisYear = new Date(
    today.getFullYear(),
    b.month - 1,
    b.day
  );

  let age = today.getFullYear() - b.year;
  if (birthThisYear > today) {
    age -= 1;
  }

  return age + 1;
}

export default function HomePage() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [timezone, setTimezone] = useState("Asia/Tokyo");
  const [photoUrl, setPhotoUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadBirthdays();
    setBirthdays(stored);
  }, []);

  useEffect(() => {
    saveBirthdays(birthdays);
  }, [birthdays]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const dayNum = Number(day);
    const monthNum = Number(month);

    if (!trimmedName || !day || !month) {
      setError("Please fill in name, day and month.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (Number.isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      setError("Day must be between 1 and 31.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setError("Please select a valid month.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const baseBirthday: Omit<Birthday, "id"> = {
      name: trimmedName,
      day: dayNum,
      month: monthNum,
      year: year ? Number(year) : undefined,
      timezone: timezone.trim(),
      photoUrl: photoUrl.trim() || undefined,
    };

    let updated: Birthday[];

    if (editingId) {
      // update existing
      updated = birthdays
        .map((b) =>
          b.id === editingId ? { ...b, ...baseBirthday } : b
        )
        .sort((a, b) => daysUntil(a) - daysUntil(b));
    } else {
      // create new
      const newBirthday: Birthday = {
        id: uuidv4(),
        ...baseBirthday,
      };

      updated = [...birthdays, newBirthday].sort(
        (a, b) => daysUntil(a) - daysUntil(b)
      );
    }

    setBirthdays(updated);
    setName("");
    setDay("");
    setMonth("");
    setYear("");
    setPhotoUrl("");
    setEditingId(null);
    setError(null);
  };

  const handleDelete = (id: string) => {
    const updated = birthdays.filter((b) => b.id !== id);
    setBirthdays(updated);
  };

  const handleEdit = (b: Birthday) => {
    setEditingId(b.id);
    setName(b.name);
    setDay(String(b.day));
    setMonth(String(b.month));
    setYear(b.year ? String(b.year) : "");
    setTimezone(b.timezone);
    setPhotoUrl(b.photoUrl ?? "");
    setError(null);
  };

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Simple Birthday Reminder
        </h1>

        {error && (
          <div className="bg-red-900/40 border border-red-500/60 text-red-100 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Add birthday form */}
        <form
          onSubmit={handleAdd}
          className="space-y-4 bg-slate-800 p-4 rounded-xl"
        >
          <div className="space-y-1">
            <label className="text-sm">Name</label>
            <input
              className="w-full rounded-md px-3 py-2 bg-white text-slate-900 border border-slate-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mum, John, Best mate..."
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-sm">Day</label>
              <input
                type="number"
                min={1}
                max={31}
                className="w-full rounded-md px-3 py-2 bg-white text-slate-900 border border-slate-300"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="12"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm">Month</label>
              <select
                className="w-full rounded-md px-3 py-2 bg-white text-slate-900 border border-slate-300"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">--</option>
                <option value="1">Jan</option>
                <option value="2">Feb</option>
                <option value="3">Mar</option>
                <option value="4">Apr</option>
                <option value="5">May</option>
                <option value="6">Jun</option>
                <option value="7">Jul</option>
                <option value="8">Aug</option>
                <option value="9">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-sm">Year (optional)</label>
              <input
                type="number"
                className="w-full rounded-md px-3 py-2 bg-white text-slate-900 border border-slate-300"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="1985"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm">Timezone</label>
            <input
              className="w-full rounded-md px-3 py-2 bg-white text-slate-900 border border-slate-300"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Tokyo"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Photo URL (optional)</label>
            <input
              className="w-full rounded-md px-3 py-2 bg-white text-slate-900 border border-slate-300"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold py-2 rounded-md"
          >
            {editingId ? "Save changes" : "Add birthday"}
          </button>

          {editingId && (
            <button
              type="button"
              className="mt-2 w-full text-sm text-slate-300 hover:text-slate-100"
              onClick={() => {
                setEditingId(null);
                setName("");
                setDay("");
                setMonth("");
                setYear("");
                setPhotoUrl("");
                setError(null);
              }}
            >
              Cancel edit
            </button>
          )}
        </form>

        {/* List of birthdays */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Upcoming birthdays ({birthdays.length})
          </h2>

          {birthdays.length === 0 && (
            <p className="text-sm text-slate-400">
              No birthdays yet. Add someone above 👆
            </p>
          )}

          <ul className="space-y-3">
            {birthdays.map((b) => {
              const days = daysUntil(b);
              const turning = ageTurning(b);
              const isToday =
                b.month === todayMonth && b.day === todayDay;

              return (
                <li
                  key={b.id}
                  className={`flex items-center gap-3 bg-slate-800 rounded-lg p-3 ${
                    isToday ? "border border-amber-400" : ""
                  }`}
                >
                  {b.photoUrl && (
                    <img
                      src={b.photoUrl}
                      alt={b.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-slate-400">
                      {formatBirthdayDate(b)} • {b.timezone}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {isToday ? (
                      <div className="text-amber-300 font-bold">
                        Today 🎉
                      </div>
                    ) : (
                      <div>{days} days</div>
                    )}
                    <div className="text-xs text-slate-400 mb-1">
                      {turning ? `Turning ${turning}` : "Year unknown"}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        className="text-[11px] text-emerald-300 hover:text-emerald-200"
                        onClick={() => handleEdit(b)}
                      >
                        edit
                      </button>
                      <button
                        className="text-[11px] text-red-300 hover:text-red-200"
                        onClick={() => handleDelete(b.id)}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
