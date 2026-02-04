"use client";
import { supabase } from "@/utils/supabase/client";
import { useEffect, useMemo, useState } from "react";

type Major = {
  id: number;
  name: string;
};

export default function Home() {
  const [majors, setMajors] = useState<Major[] | null>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from("university_majors").select();
      data?.sort((a, b) => a.name.localeCompare(b.name));
      setMajors(data);
    };

    getData();
  }, []);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    majors?.forEach((major) => {
      letters.add(major.name.charAt(0).toUpperCase());
    });
    return Array.from(letters).sort();
  }, [majors]);

  const rainbowColors = [
    "#FF0000", // Red
    "#FF7F00", // Orange
    "#E0B400", // Mustard Yellow
    "#7FFF00", // Chartreuse
    "#00B300", // Darker Green
    "#00FF7F", // Spring Green
    "#00FFFF", // Cyan
    "#007FFF", // Azure
    "#0000FF", // Blue
    "#7F00FF", // Violet
    "#FF00FF", // Magenta
    "#FF007F", // Rose
    "#8B0000", // Dark Red
    "#8B4513", // SaddleBrown
    "#B8860B", // DarkGoldenrod
    "#556B2F", // DarkOliveGreen
    "#2E8B57", // SeaGreen
    "#4682B4", // SteelBlue
    "#4169E1", // RoyalBlue
    "#8A2BE2", // BlueViolet
    "#DA70D6", // Orchid
    "#BA55D3", // MediumOrchid
    "#9370DB", // MediumPurple
    "#6A5ACD", // SlateBlue
    "#483D8B", // DarkSlateBlue
    "#191970", // MidnightBlue
  ];

  const majorColors = useMemo(() => {
    const colors = new Map<string, string>();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    majors?.forEach((major) => {
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
    if (!selectedLetter) {
      return majors;
    }
    return majors?.filter(
      (major) => major.name.charAt(0).toUpperCase() === selectedLetter
    );
  }, [majors, selectedLetter]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8 pt-16">
      <h1 className="mb-8 text-4xl font-sans font-bold text-black">
        University Majors
      </h1>
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
        {filteredMajors?.map((major) => (
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
