import { motion } from 'framer-motion'

export default function Navbar({ currentAct, hasPair, pairNames, onNavigate }) {
  const links = [
    { key: 'journey', label: hasPair && pairNames ? `The Journey: ${pairNames}` : 'The Journey', enabled: hasPair },
    { key: 'reveals', label: 'Discoveries', enabled: true },
    { key: 'explore', label: 'Explore', enabled: true },
    { key: 'quiz', label: 'Quiz', enabled: true },
    { key: 'about', label: 'About', enabled: true },
  ]

  function isActive(linkKey) {
    if (linkKey === 'journey') return currentAct === 'journey' || currentAct === 'fullpicture' || currentAct === 'outcomes'
    if (linkKey === 'reveals') return currentAct === 'reveals'
    if (linkKey === 'explore') return currentAct === 'explore'
    // Quiz and About are subtabs of explore, handled via navigation
    if (linkKey === 'quiz') return false
    if (linkKey === 'about') return false
    return false
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 h-12 bg-white/90 backdrop-blur-sm border-b border-[#1a3340]/8 flex items-center px-4 md:px-6"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="font-display text-sm md:text-base text-[#1a3340] cursor-pointer hover:opacity-70 transition-opacity"
        >
          Life Milestones
        </button>

        <div className="flex items-center gap-1 md:gap-3">
          {links.map(link => (
            <button
              key={link.key}
              onClick={() => link.enabled && onNavigate(link.key)}
              className={`text-[11px] md:text-xs font-body px-2 py-1 rounded transition-all cursor-pointer
                ${isActive(link.key)
                  ? 'text-[#1a3340] border-b-2 border-[#E76F51]'
                  : link.enabled
                    ? 'text-[#4a6e7f] hover:text-[#1a3340]'
                    : 'text-[#6b8f9e] cursor-not-allowed'
                }`}
              disabled={!link.enabled}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
