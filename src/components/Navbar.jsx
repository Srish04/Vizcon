import { useState, useEffect } from 'react'

const LINKS = [
  { id: 'explore', label: 'Explore' },
  { id: 'compare', label: 'Compare' },
  { id: 'discoveries', label: 'Discoveries' },
  { id: 'quiz', label: 'Quiz' },
]

export default function Navbar() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }) },
      { threshold: 0.3 }
    )
    LINKS.forEach(l => {
      const el = document.getElementById(l.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 h-12 bg-white/90 backdrop-blur-sm border-b border-[#1a3340]/8 flex items-center px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-base text-[#1a3340] cursor-pointer hover:opacity-70 transition-opacity">
          Life Milestones
        </button>
        <div className="flex items-center gap-1 md:gap-4">
          {LINKS.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              className={`text-[11px] md:text-xs font-body px-2 py-1 cursor-pointer transition-all rounded
                ${active === l.id ? 'text-[#1a3340] border-b-2 border-[#E76F51]' : 'text-[#4a6e7f] hover:text-[#1a3340]'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
