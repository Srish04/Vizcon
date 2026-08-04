import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

const MILESTONES = [
  { key: 'menarche', profileKey: 'menarche', label: 'Puberty', color: '#C2185B', unit: 'years old', range: [10, 18] },
  { key: 'education', profileKey: 'education', label: 'Education Ends', color: '#2D6A4F', unit: 'years old', range: [14, 30] },
  { key: 'leaving_home', profileKey: 'leaving_home', label: 'Leaving Home', color: '#2A9D8F', unit: 'years old', range: [16, 35] },
  { key: 'cohabitation', profileKey: 'cohabitation', label: 'First Partnership', color: '#00897B', unit: 'years old', range: [18, 38] },
  { key: 'first_home', profileKey: 'first_home', label: 'First Home', color: '#48BFE3', unit: 'years old', range: [20, 42] },
  { key: 'marriage', profileKey: 'marriage', label: 'Marriage', color: '#E76F51', unit: 'years old', range: [18, 40] },
  { key: 'first_baby', profileKey: 'first_baby', label: 'First Child', color: '#E9C46A', unit: 'years old', range: [18, 38] },
  { key: 'fertility_rate', profileKey: 'fertility_rate', label: 'Children per Woman', color: '#E9C46A', unit: 'children', range: [0, 4] },
  { key: 'menopause', profileKey: 'menopause', label: 'Menopause', color: '#AB47BC', unit: 'years old', range: [45, 56] },
  { key: 'retirement', profileKey: 'retirement_age', label: 'Retirement', color: '#457B9D', unit: 'years old', range: [55, 75] },
  { key: 'hale', profileKey: 'hale', label: 'Healthy Life Ends', color: '#7B2D8E', unit: 'years old', range: [55, 80] },
  { key: 'life_expectancy', profileKey: 'life_expectancy', label: 'End of Life', color: '#264653', unit: 'years old', range: [60, 90] },
]

function getProfile(code) {
  return countryProfiles.find(c => c.country === code)
}

function getMilestoneValue(profile, milestone) {
  // Check milestones object first
  const m = profile.milestones?.[milestone.profileKey]
  if (m && m.value !== null && m.value !== undefined) return m.value
  // Check outcomes for hale and life_expectancy
  const o = profile.outcomes?.[milestone.profileKey]
  if (o && o.value !== null && o.value !== undefined) return o.value
  return null
}

function getAvailableMilestones(profileA, profileB) {
  return MILESTONES.filter(m => {
    const vA = getMilestoneValue(profileA, m)
    const vB = getMilestoneValue(profileB, m)
    return vA !== null && vB !== null
  })
}

function generateNarrative(milestone, profileA, profileB, vA, vB) {
  const nameA = profileA.name
  const nameB = profileB.name
  const gap = Math.abs(vA - vB).toFixed(1)
  const earlier = vA <= vB ? nameA : nameB
  const later = vA <= vB ? nameB : nameA
  const vEarlier = vA <= vB ? vA : vB
  const vLater = vA <= vB ? vB : vA

  switch (milestone.key) {
    case 'menarche':
      return `Both countries start within ${gap} years of each other. Biology sets a similar starting line. The divergence comes next.`

    case 'education':
      if (parseFloat(gap) > 3) {
        return `In ${later}, young people spend ${gap} more years in school than in ${earlier}. That's ${gap} extra years before entering the workforce, finding a partner, or starting a family. Everything after this shifts.`
      }
      return `Education takes a similar amount of time in both countries, but what happens next couldn't be more different.`

    case 'leaving_home':
      return `In ${earlier}, independence begins at ${vEarlier}. In ${later}, young people stay home until ${vLater}. Same continent, same wealth bracket. Culture makes the difference.`

    case 'cohabitation':
      return `${earlier} starts living with a partner at ${vEarlier}. ${later} waits until ${vLater}. ${gap} years of different relationship timelines.`

    case 'first_home':
      return `Homeownership at ${vEarlier} in ${earlier}, but not until ${vLater} in ${later}. This isn't about choice. It's about what the housing market allows.`

    case 'marriage':
      if (parseFloat(gap) > 10) {
        return `A ${gap}-year gap. In ${earlier}, women marry at ${vEarlier}. In ${later}, not until ${vLater}. This single number will predict almost everything that comes next.`
      }
      return `${earlier} marries at ${vEarlier}, ${later} at ${vLater}. A ${gap}-year difference that ripples through every milestone after.`

    case 'first_baby':
      return `First child at ${vEarlier} in ${earlier}, at ${vLater} in ${later}. Later first births mean fewer children overall, and a completely different shape to family life.`

    case 'fertility_rate':
      return `${nameA} has ${vA} children per woman. ${nameB} has ${vB}. Below 2.1, a country's population begins to shrink without immigration.`

    case 'menopause': {
      const menarcheA = getMilestoneValue(profileA, MILESTONES[0])
      const menarcheB = getMilestoneValue(profileB, MILESTONES[0])
      const windowA = menarcheA ? (vA - menarcheA).toFixed(0) : '?'
      const windowB = menarcheB ? (vB - menarcheB).toFixed(0) : '?'
      return `Menopause at ${vEarlier} in ${earlier}, ${vLater} in ${later}. The reproductive window, from puberty to menopause, is ${windowA} years in ${nameA} and ${windowB} years in ${nameB}.`
    }

    case 'retirement': {
      const yearsA = profileA.milestones?.years_after_exit?.value
      const yearsB = profileB.milestones?.years_after_exit?.value
      let text = `${earlier} stops working at ${vEarlier}. ${later} works until ${vLater}. But here's what matters: how many years come after?`
      if (yearsA && yearsB) {
        text += ` ${nameA}: ${yearsA} years of retirement. ${nameB}: ${yearsB} years.`
      }
      return text
    }

    case 'hale':
      return `Healthy life ends at ${vEarlier} in ${earlier} and ${vLater} in ${later}. Everything after this age is lived in declining health.`

    case 'life_expectancy': {
      const poorA = profileA.outcomes?.years_poor_health?.value
      const poorB = profileB.outcomes?.years_poor_health?.value
      let text = `Life ends at ${vEarlier} in ${earlier} and ${vLater} in ${later}. But the question isn't just how long. It's how many of those years are healthy.`
      if (poorA && poorB) {
        text += ` ${nameA} spends ${poorA} years in poor health. ${nameB} spends ${poorB}.`
      }
      return text
    }

    default:
      return ''
  }
}

// --- Milestone Section ---
function MilestoneSection({ milestone, profileA, profileB, vA, vB, index, total }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.4, once: true })
  const narrative = generateNarrative(milestone, profileA, profileB, vA, vB)

  const isFertility = milestone.key === 'fertility_rate'

  return (
    <section
      ref={ref}
      className="min-h-screen snap-start flex flex-col items-center justify-center px-4 md:px-8 py-12"
      style={{
        backgroundColor: `rgba(${hexToRgb(milestone.color)}, 0.06)`,
        borderLeft: `4px solid ${milestone.color}`,
      }}
    >
      <div className="w-full max-w-[800px]">
        {/* Milestone label */}
        <motion.h2
          className="font-display text-2xl md:text-4xl text-center mb-8"
          style={{ color: milestone.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          {milestone.label}
        </motion.h2>

        {/* Visualization */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {isFertility ? (
            <FertilityViz profileA={profileA} profileB={profileB} vA={vA} vB={vB} color={milestone.color} isInView={isInView} />
          ) : (
            <BarViz
              milestone={milestone}
              profileA={profileA}
              profileB={profileB}
              vA={vA}
              vB={vB}
              isInView={isInView}
            />
          )}
        </motion.div>

        {/* Gap annotation */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-data font-medium"
            style={{ backgroundColor: milestone.color + '15', color: milestone.color }}
          >
            {isFertility
              ? `Gap: ${Math.abs(vA - vB).toFixed(2)} children`
              : `Gap: ${Math.abs(vA - vB).toFixed(1)} years`
            }
          </span>
        </motion.div>

        {/* Narrative */}
        <motion.p
          className="text-text/70 font-body text-base md:text-lg text-center leading-relaxed max-w-[650px] mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          {narrative}
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          className="mt-8 text-center text-text/30 text-xs font-data"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.3 }}
        >
          {index + 1} / {total}
        </motion.div>
      </div>
    </section>
  )
}

// --- Bar Visualization ---
function BarViz({ milestone, profileA, profileB, vA, vB, isInView }) {
  const [rangeMin, rangeMax] = milestone.range
  const pctA = ((vA - rangeMin) / (rangeMax - rangeMin)) * 100
  const pctB = ((vB - rangeMin) / (rangeMax - rangeMin)) * 100
  const longerIsA = vA >= vB

  return (
    <div className="space-y-4">
      {/* Country A bar */}
      <div className="flex items-center gap-3">
        <div className="w-20 md:w-28 flex-shrink-0 text-right">
          <span className="text-sm font-body text-text/70">
            {profileA.flag} {profileA.name}
          </span>
        </div>
        <div className="flex-1 relative h-8 bg-text/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              backgroundColor: milestone.color,
              opacity: longerIsA ? 1.0 : 0.7,
            }}
            initial={{ width: '0%' }}
            animate={isInView ? { width: `${Math.min(Math.max(pctA, 2), 100)}%` } : { width: '0%' }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          />
          <motion.span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-data font-medium text-text/80"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.0, duration: 0.3 }}
          >
            {vA}
          </motion.span>
        </div>
      </div>

      {/* Country B bar */}
      <div className="flex items-center gap-3">
        <div className="w-20 md:w-28 flex-shrink-0 text-right">
          <span className="text-sm font-body text-text/70">
            {profileB.flag} {profileB.name}
          </span>
        </div>
        <div className="flex-1 relative h-8 bg-text/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              backgroundColor: milestone.color,
              opacity: longerIsA ? 0.7 : 1.0,
            }}
            initial={{ width: '0%' }}
            animate={isInView ? { width: `${Math.min(Math.max(pctB, 2), 100)}%` } : { width: '0%' }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          />
          <motion.span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-data font-medium text-text/80"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            {vB}
          </motion.span>
        </div>
      </div>

      {/* Axis labels */}
      <div className="flex items-center gap-3">
        <div className="w-20 md:w-28 flex-shrink-0" />
        <div className="flex-1 flex justify-between px-1">
          <span className="text-[10px] font-data text-text/40">{rangeMin}</span>
          <span className="text-[10px] font-data text-text/40">{rangeMax}</span>
        </div>
      </div>
    </div>
  )
}

// --- Fertility Rate Visualization ---
function FertilityViz({ profileA, profileB, vA, vB, color, isInView }) {
  function renderIcons(value, name, flag) {
    const full = Math.floor(value)
    const partial = value - full
    const icons = []
    for (let i = 0; i < full; i++) {
      icons.push(
        <span key={i} className="text-2xl md:text-3xl">👶</span>
      )
    }
    if (partial > 0) {
      icons.push(
        <span key="partial" className="text-2xl md:text-3xl" style={{ opacity: partial }}>👶</span>
      )
    }
    return (
      <div className="flex items-center gap-4 py-3">
        <div className="w-20 md:w-28 text-right flex-shrink-0">
          <span className="text-sm font-body text-text/70">{flag} {name}</span>
        </div>
        <div className="flex items-center gap-1">
          {icons}
          <span className="ml-2 font-data text-sm font-medium" style={{ color }}>{value}</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {renderIcons(vA, profileA.name, profileA.flag)}
      {renderIcons(vB, profileB.name, profileB.flag)}
      <div className="flex items-center gap-3 mt-2">
        <div className="w-20 md:w-28 flex-shrink-0" />
        <span className="text-[10px] font-data text-text/40">Replacement rate: 2.1 children per woman</span>
      </div>
    </motion.div>
  )
}

// --- Progress Dots ---
function ProgressDots({ milestones, currentIndex }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-50 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
      {milestones.map((m, i) => (
        <div
          key={m.key}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: i === currentIndex ? m.color : '#e0e0e0',
            transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

// --- Main Component ---
export default function MilestoneWalk({ pair, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(-1) // -1 = intro
  const scrollRef = useRef(null)

  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const milestones = getAvailableMilestones(profileA, profileB)

  // Track scroll position for progress dots
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    function handleScroll() {
      const scrollTop = container.scrollTop
      const sectionHeight = container.clientHeight
      const idx = Math.round(scrollTop / sectionHeight) - 1 // -1 for intro section
      setCurrentIndex(Math.max(-1, Math.min(idx, milestones.length - 1)))
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [milestones.length])

  return (
    <div
      ref={scrollRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
    >
      {/* Intro section */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4">
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
            className="text-text/30"
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

      {/* Milestone sections */}
      {milestones.map((milestone, i) => {
        const vA = getMilestoneValue(profileA, milestone)
        const vB = getMilestoneValue(profileB, milestone)
        return (
          <MilestoneSection
            key={milestone.key}
            milestone={milestone}
            profileA={profileA}
            profileB={profileB}
            vA={vA}
            vB={vB}
            index={i}
            total={milestones.length}
          />
        )
      })}

      {/* Outro / transition section */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ amount: 0.5, once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl md:text-4xl text-text mb-4">
            You've seen the milestones one by one.
          </h2>
          <p className="text-text/60 font-body text-base md:text-lg mb-8">
            Now let's see the whole life.
          </p>
          <motion.button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl border border-text/20 font-body text-sm text-text hover:bg-white hover:shadow-md transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue →
          </motion.button>
        </motion.div>
      </section>

      {/* Progress dots */}
      {currentIndex >= 0 && (
        <ProgressDots milestones={milestones} currentIndex={currentIndex} />
      )}
    </div>
  )
}
