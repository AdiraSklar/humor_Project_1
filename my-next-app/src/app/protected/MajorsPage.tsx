'use client'

import { useState } from 'react'
import { Major } from '@/types/major'

export default function MajorsPage({ majors, majorsError }: { majors: Major[], majorsError: any }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('')

  const filteredMajors = majors
    .filter((major) =>
      major.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((major) =>
      selectedLetter ? major.name.toUpperCase().startsWith(selectedLetter) : true
    );

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl px-4">
      <h1 className="font-extrabold text-4xl tracking-tight text-center">University Majors</h1>
      {majorsError && (
        <p className="text-red-300 bg-red-900/50 p-4 rounded-md text-center">Error loading majors: {majorsError.message}</p>
      )}

      {/* Filter and Search UI */}
      <div className="flex flex-col md:flex-row gap-4 my-4">
        <input
          type="text"
          placeholder="Search for a major..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-black rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter === selectedLetter ? '' : letter)}
            className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${
              selectedLetter === letter
                ? 'bg-white text-purple-600'
                : 'bg-white/20 hover:bg-white/40'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Majors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredMajors.length > 0 ? (
          filteredMajors.map((major) => (
            <div key={major.id} className="bg-white/20 p-6 rounded-xl shadow-2xl backdrop-blur-lg">
              <h3 className="text-xl font-semibold">{major.name}</h3>
              <p className="text-gray-300 mt-1">ID: {major.id}</p>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">No university majors found matching your criteria.</p>
        )}
      </div>
    </div>
  )
}
