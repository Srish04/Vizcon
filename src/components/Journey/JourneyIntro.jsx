import { motion } from 'framer-motion'

export default function JourneyIntro({ profileA, profileB, onBegin }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-display text-3xl md:text-5xl mb-4 text-text">
          {profileA.flag} {profileA.name} & {profileB.flag} {profileB.name}
        </h1>
        <p className="text-text-secondary font-body text-base md:text-lg mb-12 max-w-[500px] mx-auto">
          What does a life look like in {profileA.name}? In {profileB.name}? Scroll, and watch two paths unfold.
        </p>
        <motion.div
          className="text-text-faint"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-xs font-body mt-1 block">Scroll to begin</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
