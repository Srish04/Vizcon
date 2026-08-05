import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Expand icon (arrows pointing outward)
function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 2h4v4M6 14H2v-4M14 2L9.5 6.5M2 14l4.5-4.5"/>
    </svg>
  )
}

// Collapse icon (arrows pointing inward)
function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 6h-4V2M2 10h4v4M10 6l4.5-4.5M6 10L1.5 14.5"/>
    </svg>
  )
}

export default function ExpandableChart({ children, title }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      {/* Normal view with expand button */}
      <div className="relative group">
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-white/90 border border-gray-200 flex items-center justify-center text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#264653] hover:text-white hover:border-[#264653]"
          title="Expand view">
          <ExpandIcon/>
        </button>
        {children}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExpanded(false)}/>
            {/* Content */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-[95vw] max-h-[92vh] overflow-auto"
              style={{ width: '1200px' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                {title && <p className="font-body text-[18px] font-bold text-[#264653]">{title}</p>}
                <button onClick={() => setExpanded(false)}
                  className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-[#475569] cursor-pointer hover:bg-[#264653] hover:text-white transition-colors">
                  <CollapseIcon/>
                </button>
              </div>
              {/* Render children at larger size */}
              <div className="w-full">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


