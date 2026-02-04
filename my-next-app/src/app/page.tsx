"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/utils/supabase/client";

type Major = {
  id: number;
  name: string;
};

export default function Home() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from("university_majors")
            .select("id,name");

        if (error) {
          setError(error.message);
          setMajors([]);
          return;
        }

        const sorted = (data ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
        setMajors(sorted);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
        setMajors([]);
      }
    };

    getData();
  }, []);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    majors.forEach((major) => {
      letters.add(major.name.charAt(0).toUpperCase());
    });
    return Array.from(letters).sort();
  }, [majors]);

  const rainbowColors = [
    "#FF0000", "#FF7F00", "#E0B400", "#7FFF00", "#00B300", "#00FF7F",
    "#00FFFF", "#007FFF", "#0000FF", "#7F00FF", "#FF00FF", "#FF007F",
    "#8B0000", "#8B4513", "#B8860B", "#556B2F", "#2E8B57", "#4682B4",
    "#4169E1", "#8A2BE2", "#DA70D6", "#BA55D3", "#9370DB", "#6A5ACD",
    "#483D8B", "#191970",
  ];

  const majorColors = useMemo(() => {
    const colors = new Map<string, string>();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    majors.forEach((major) => {
      const firstLetter = major.name.charAt(0).toUpperCase();
      if (alphabet.includes(firstLetter) && !colors.has(firstLetter)) {
        const colorIndex = alphabet.indexOf(firstLetter) % rainbowColors.length;
        colors.set(firstLetter, rainbowColors[colorIndex]);
      } else if (!colors.has(firstLetter)) {
        colors.set(firstLetter, "#808080");
      }
    });

    return colors;
  }, [majors]);

  const filteredMajors = useMemo(() => {
    if (!selectedLetter) return majors;
    return majors.filter(
        (major) => major.name.charAt(0).toUpperCase() === selectedLetter
    );
  }, [majors, selectedLetter]);

  return (
      <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8 pt-16">
        <h1 className="mb-8 text-4xl font-sans font-bold text-black">
          University Majors
        </h1>

        {error && (
            <div className="mb-6 w-full max-w-3xl rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
              <div className="font-semibold">Error loading majors</div>
              <div className="mt-1 text-sm break-words">{error}</div>
            </div>
        )}

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
              onClick={() => setSelectedLetter(null)}
              className="rounded-md bg-gray-300 px-4 py-2 font-semibold text-black hover:bg-gray-400"
          >
            See All
          </button>

          {availableLetters.map((letter) => (
              <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`rounded-md px-3 py-1 font-semibold ${
                      selectedLetter === letter
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-black hover:bg-gray-400"
                  }`}
              >
                {letter}
              </button>
          ))}
        </div>

        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredMajors.map((major) => (
              <div key={major.id} className="rounded-lg bg-white p-6 shadow-md">
                <h2
                    className="text-xl font-semibold"
                    style={{
                      color: majorColors.get(major.name.charAt(0).toUpperCase()),
                    }}
                >
                  {major.name}
                </h2>
                <p className="text-gray-600">ID: {major.id}</p>
              </div>
          ))}
        </div>
      </div>
  );
}