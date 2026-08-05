import { useState, useEffect } from 'react'

const LINKS = [
  { id: 'explore', label: 'Explore' },
  { id: 'compare', label: 'Compare' },
  { id: 'discoveries', label: 'Discoveries' },
  { id: 'quiz', label: 'Quiz' },
]

const MARKER_COLORS = ['#C2185B','#2D6A4F','#2A9D8F','#00897B','#48BFE3','#E76F51','#E9C46A','#AB47BC','#457B9D','#7B2D8E','#264653']

export default function Navbar() {
  const [active, setActive] = useState('')
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.3 }
    )
    LINKS.forEach(l => { const el = document.getElementById(l.id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollPct(h > 0 ? window.scrollY / h : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50">
      <div className="h-12 bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex items-center px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display text-lg font-bold text-[#264653] cursor-pointer hover:opacity-70 transition-opacity">
            Life Markers
          </button>
          <div className="flex items-center gap-2 md:gap-5">
            {LINKS.map(l => (
              <button key={l.id} onClick={() => scrollTo(l.id)}
                className={`text-sm font-body font-medium px-1 py-1 cursor-pointer transition-all
                  ${active === l.id ? 'text-[#264653] border-b-2 border-[#E76F51]' : 'text-gray-500 hover:text-[#264653]'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Scroll progress bar */}
      <div className="h-[3px] w-full bg-gray-100">
        <div className="h-full transition-all duration-100"
          style={{
            width: `${scrollPct * 100}%`,
            background: `linear-gradient(90deg, ${MARKER_COLORS.join(', ')})`
          }} />
      </div>
    </nav>
  )
}


