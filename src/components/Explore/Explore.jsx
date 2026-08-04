import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CorrelationExplorer from './CorrelationExplorer'
import Quiz from './Quiz'
import About from './About'

const TABS = [
  { key: 'explore', label: 'Explore' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'about', label: 'About' },
]

export default function Explore({ defaultTab = 'explore', onRestart }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Sync with parent's defaultTab prop
  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  return (
    <div className="min-h-screen pb-12">
      {/* Tab bar */}
      <div className="sticky top-12 z-40 bg-bg/95 backdrop-blur-sm border-b border-[#1a3340]/5">
        <div className="max-w-[900px] mx-auto flex items-center px-4 py-3">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-body transition-all cursor-pointer
                  ${activeTab === tab.key
                    ? 'bg-text/8 text-text font-medium'
                    : 'text-text/50 hover:text-text/70 hover:bg-text/4'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {onRestart && (
            <button
              onClick={() => onRestart(null)}
              className="ml-auto text-xs text-text/40 hover:text-text/60 font-body cursor-pointer"
            >
              ← Pick new pair
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'explore' && <CorrelationExplorer />}
          {activeTab === 'quiz' && <Quiz />}
          {activeTab === 'about' && <About />}
        </motion.div>
      </div>
    </div>
  )
}
