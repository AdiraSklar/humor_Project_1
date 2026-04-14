'use client'

import { useState } from 'react'
import { type PostgrestError } from '@supabase/supabase-js'
import { Major } from '@/types/major'
import { Search } from 'lucide-react'


export default function MajorsPage({ majors, majorsError }: { majors: Major[], majorsError: PostgrestError | null }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('')

  const filteredMajors = majors
    .filter((major) => major.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((major) => selectedLetter ? major.name.toUpperCase().startsWith(selectedLetter) : true)

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl px-4 pb-16">

      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center pt-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-400/60">Majors</span>
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          University Majors
        </h1>
        <p className="text-sm text-white/35 max-w-xs leading-relaxed">
          Browse {majors.length} majors from universities across the app
        </p>
      </div>

      {majorsError && (
        <p className="text-red-300 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-center text-sm">
          Error loading majors: {majorsError.message}
        </p>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
        <input
          type="text"
          placeholder="Search majors..."
          value={searchTerm}
          onChange={(e) => { setSelectedLetter(''); setSearchTerm(e.target.value); }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/40 focus:bg-white/[0.07] text-white placeholder:text-white/25 text-sm outline-none transition-all"
        />
      </div>

      {/* Alphabet filter */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => { setSearchTerm(''); setSelectedLetter(letter === selectedLetter ? '' : letter); }}
            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all duration-150 ${
              selectedLetter === letter
                ? 'bg-violet-500/25 text-violet-200 border border-violet-400/40 shadow-[0_0_10px_rgba(124,58,237,0.2)]'
                : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70 border border-white/[0.06]'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(searchTerm || selectedLetter) && (
        <p className="text-center text-white/30 text-xs tracking-wide">
          {filteredMajors.length} result{filteredMajors.length !== 1 ? 's' : ''}
          {selectedLetter ? ` starting with "${selectedLetter}"` : ''}
          {searchTerm ? ` for "${searchTerm}"` : ''}
        </p>
      )}

      {/* Majors grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMajors.length > 0 ? (
          filteredMajors.map((major) => (
            <div
              key={major.id}
              className="bg-white/[0.04] hover:bg-violet-500/[0.07] border border-white/[0.07] hover:border-violet-500/25 rounded-xl px-5 py-4 transition-all duration-200 group"
            >
              <h3 className="text-sm font-medium text-white/80 group-hover:text-white/95 transition-colors leading-snug">
                {major.name}
              </h3>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-white/30 text-sm py-10">
            No majors found{selectedLetter ? ` starting with "${selectedLetter}"` : ''}{searchTerm ? ` matching "${searchTerm}"` : ''}.
          </p>
        )}
      </div>

    </div>
  )
}
