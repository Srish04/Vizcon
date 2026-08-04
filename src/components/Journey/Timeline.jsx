import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'
import JourneyIntro from './JourneyIntro'

const MILESTONES = [
  { key: 'menarche', profileKey: 'menarche', label: 'Puberty', color: '#C2185B', unit: 'years old' },
  { key: 'education', profileKey: 'education', label: 'Education Ends', color: '#2D6A4F', unit: 'years old' },
  { key: 'leaving_home', profileKey: 'leaving_home', label: 'Leaving Home', color: '#2A9D8F', unit: 'years old' },
  { key: 'cohabitation', profileKey: 'cohabitation', label: 'First Partnership', color: '#00897B', unit: 'years old' },
  { key: 'first_home', profileKey: 'first_home', label: 'First Home', color: '#48BFE3', unit: 'years old' },
  { key: 'marriage', profileKey: 'marriage', label: 'Marriage', color: '#E76F51', unit: 'years old' },
  { key: 'first_baby', profileKey: 'first_baby', label: 'First Child', color: '#E9C46A', unit: 'years old' },
  { key: 'fertility_rate', profileKey: 'fertility_rate', label: 'Children per Woman', color: '#E9C46A', unit: 'children' },
  { key: 'menopause', profileKey: 'menopause', label: 'Menopause', color: '#AB47BC', unit: 'years old' },
  { key: 'retirement', profileKey: 'retirement_age', label: 'Retirement', color: '#457B9D', unit: 'years old' },
  { key: 'hale', profileKey: 'hale', label: 'Healthy Life Ends', color: '#7B2D8E', unit: 'years old' },
  { key: 'life_expectancy', profileKey: 'life_expectancy', label: 'End of Life', color: '#264653', unit: 'years old' },
]

const AGE_MIN = 10, AGE_MAX = 88

function getProfile(code) {
  return countryProfiles.find(c => c.country === code)
}

function getValue(profile, m) {
  const ms = profile.milestones?.[m.profileKey]
  if (ms && ms.value !== null && ms.value !== undefined) return ms.value
  const oc = profile.outcomes?.[m.profileKey]
  if (oc && oc.value !== null && oc.value !== undefined) return oc.value
  return null
}

function getSharedMilestones(profileA, profileB) {
  return MILESTONES.filter(m => {
    const vA = getValue(profileA, m)
    const vB = getValue(profileB, m)
    return vA !== null && vB !== null
  }).map(m => ({
    ...m,
    valueA: getValue(profileA, m),
    valueB: getValue(profileB, m),
  }))
}

function ageToPercent(age) {
  return ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100
}

function generateNarrative(m, profileA, profileB) {
  const gap = Math.abs(m.valueA - m.valueB).toFixed(1)
  const earlier = m.valueA <= m.valueB ? profileA.name : profileB.name
  const later = m.valueA <= m.valueB ? profileB.name : profileA.name
  const vE = Math.min(m.valueA, m.valueB)
  const vL = Math.max(m.valueA, m.valueB)

  switch (m.key) {
    case 'menarche': return `Both countries start within ${gap} years of each other. Biology sets a similar starting line. The divergence comes next.`
    case 'education': return parseFloat(gap) > 3
      ? `In ${later}, young people spend ${gap} more years in school than in ${earlier}. Everything after this shifts.`
      : `Education takes a similar amount of time in both countries, but what happens next couldn't be more different.`
    case 'leaving_home': return `In ${earlier}, independence begins at ${vE}. In ${later}, young people stay home until ${vL}. Culture makes the difference.`
    case 'cohabitation': return `${earlier} starts living with a partner at ${vE}. ${later} waits until ${vL}. ${gap} years of different relationship timelines.`
    case 'first_home': return `Homeownership at ${vE} in ${earlier}, but not until ${vL} in ${later}. It's about what the housing market allows.`
    case 'marriage': return parseFloat(gap) > 10
      ? `A ${gap}-year gap. In ${earlier}, women marry at ${vE}. In ${later}, not until ${vL}. This single number predicts almost everything that comes next.`
      : `${earlier} marries at ${vE}, ${later} at ${vL}. A ${gap}-year difference that ripples through every milestone after.`
    case 'first_baby': return `First child at ${vE} in ${earlier}, at ${vL} in ${later}. Later first births mean fewer children overall.`
    case 'fertility_rate': return `${profileA.name} has ${m.valueA} children per woman. ${profileB.name} has ${m.valueB}. Below 2.1, a country shrinks without immigration.`
    case 'menopause': return `Menopause at ${vE} in ${earlier}, ${vL} in ${later}. The reproductive window differs by ${gap} years.`
    case 'retirement': return `${earlier} stops working at ${vE}. ${later} works until ${vL}. The question is: how many years come after?`
    case 'hale': return `Healthy life ends at ${vE} in ${earlier} and ${vL} in ${later}. Everything after is lived in declining health.`
    case 'life_expectancy': return `Life ends at ${vE} in ${earlier} and ${vL} in ${later}. The question isn't just how long, it's how many of those years are healthy.`
    default: return ''
  }
}

// --- Left Panel: Sticky Timeline ---
function TimelinePanel({ profileA, profileB, milestones, activeIndex }) {
  const AGE_TICKS = [12, 20, 30, 40, 50, 60, 70, 80, 85]
  const timelineH = 550

  function ageToY(age) {
    return ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * timelineH
  }

  return (
    <div className="sticky top-16 h-[calc(100vh-64px)] flex items-center">
      <div className="w-full relative" style={{ height: `${timelineH + 40}px` }}>
        {/* Age axis */}
        <div className="absolute left-0 top-0 w-8" style={{ height: `${timelineH}px` }}>
          {AGE_TICKS.map(age => (
            <div key={age} className="absolute flex items-center" style={{ top: `${ageToY(age)}px`, transform: 'translateY(-50%)' }}>
              <span className="text-[9px] font-data text-text-faint w-6 text-right">{age}</span>
              <div className="w-1.5 h-px bg-text-faint/30 ml-0.5" />
            </div>
          ))}
          <div className="absolute left-7 w-px bg-text-faint/20" style={{ top: `${ageToY(12)}px`, height: `${ageToY(85) - ageToY(12)}px` }} />
        </div>

        {/* Country A Column */}
        <div className="absolute left-12 top-0" style={{ height: `${timelineH}px`, width: '40%' }}>
          <p className="text-xs font-body text-text-secondary font-medium mb-2 text-center">{profileA.flag} {profileA.name}</p>
          {milestones.map((m, i) => {
            const y = m.key === 'fertility_rate' ? ageToY(35) : ageToY(m.valueA)
            const isActive = i <= activeIndex
            return (
              <motion.div key={m.key} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ top: `${y}px`, transform: 'translate(-50%, -50%)' }}>
                <motion.div
                  className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? m.color : 'transparent',
                    borderColor: isActive ? m.color : m.color + '40',
                    boxShadow: isActive ? `0 0 8px ${m.color}40` : 'none',
                  }}
                />
                {isActive && (
                  <motion.span className="text-[8px] font-data mt-0.5 whitespace-nowrap"
                    style={{ color: m.color }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {m.key === 'fertility_rate' ? m.valueA : Math.round(m.valueA)}
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Country B Column */}
        <div className="absolute right-0 top-0" style={{ height: `${timelineH}px`, width: '40%' }}>
          <p className="text-xs font-body text-text-secondary font-medium mb-2 text-center">{profileB.flag} {profileB.name}</p>
          {milestones.map((m, i) => {
            const y = m.key === 'fertility_rate' ? ageToY(35) : ageToY(m.valueB)
            const isActive = i <= activeIndex
            return (
              <motion.div key={m.key} className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                style={{ top: `${y}px`, transform: 'translate(-50%, -50%)' }}>
                <motion.div
                  className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? m.color : 'transparent',
                    borderColor: isActive ? m.color : m.color + '40',
                    boxShadow: isActive ? `0 0 8px ${m.color}40` : 'none',
                  }}
                />
                {isActive && (
                  <motion.span className="text-[8px] font-data mt-0.5 whitespace-nowrap"
                    style={{ color: m.color }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {m.key === 'fertility_rate' ? m.valueB : Math.round(m.valueB)}
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Connecting lines for active milestones */}
        <svg className="absolute left-12 top-0 w-[calc(100%-48px)] pointer-events-none" style={{ height: `${timelineH}px` }}>
          {milestones.map((m, i) => {
            if (i > activeIndex) return null
            const yA = m.key === 'fertility_rate' ? ageToY(35) : ageToY(m.valueA)
            const yB = m.key === 'fertility_rate' ? ageToY(35) : ageToY(m.valueB)
            const gap = Math.abs(m.valueA - m.valueB).toFixed(m.key === 'fertility_rate' ? 2 : 1)
            const midY = (yA + yB) / 2
            return (
              <g key={m.key}>
                <motion.line
                  x1="20%" y1={yA} x2="80%" y2={yB}
                  stroke={m.color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <text x="50%" y={midY - 4} textAnchor="middle"
                  className="text-[9px] font-data" fill={m.color} fontWeight="600">
                  {m.valueA < m.valueB ? '+' : ''}{(m.valueB - m.valueA).toFixed(m.key === 'fertility_rate' ? 2 : 0)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// --- Right Panel: Narrative Cards ---
function NarrativeCard({ milestone, profileA, profileB, index, onActivate }) {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onActivate(index) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [index, onActivate])

  const narrative = generateNarrative(milestone, profileA, profileB)
  const gap = Math.abs(milestone.valueA - milestone.valueB)

  return (
    <div ref={ref} className="min-h-[60vh] flex items-center py-12">
      <motion.div
        className="p-6 md:p-8 rounded-xl border-l-4"
        style={{ borderColor: milestone.color, backgroundColor: milestone.color + '08' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3, once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-display text-xl md:text-2xl mb-4" style={{ color: milestone.color }}>
          {milestone.label}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-body text-text-muted mb-1">{profileA.flag} {profileA.name}</p>
            <p className="font-data text-2xl md:text-3xl text-text font-medium">
              {milestone.key === 'fertility_rate' ? milestone.valueA.toFixed(2) : milestone.valueA.toFixed(1)}
            </p>
            <p className="text-[10px] font-data text-text-faint">{milestone.unit}</p>
          </div>
          <div>
            <p className="text-xs font-body text-text-muted mb-1">{profileB.flag} {profileB.name}</p>
            <p className="font-data text-2xl md:text-3xl text-text font-medium">
              {milestone.key === 'fertility_rate' ? milestone.valueB.toFixed(2) : milestone.valueB.toFixed(1)}
            </p>
            <p className="text-[10px] font-data text-text-faint">{milestone.unit}</p>
          </div>
        </div>

        {/* Gap badge */}
        <motion.div className="inline-block px-3 py-1 rounded-full text-sm font-data font-medium mb-4"
          style={{ backgroundColor: milestone.color + '15', color: milestone.color }}
          initial={{ scale: 1 }}
          whileInView={{ scale: [1, 1.1, 1] }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}>
          Gap: {gap.toFixed(milestone.key === 'fertility_rate' ? 2 : 1)} {milestone.unit === 'children' ? 'children' : 'years'}
        </motion.div>

        <p className="font-body text-sm md:text-base text-text-secondary leading-relaxed">
          {narrative}
        </p>
      </motion.div>
    </div>
  )
}

// --- Main Timeline Component ---
export default function Timeline({ pair, onComplete }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [started, setStarted] = useState(false)

  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const milestones = getSharedMilestones(profileA, profileB)

  // Compute annotations for the end card
  const socialMs = milestones.filter(m => !['menarche', 'menopause', 'hale', 'life_expectancy', 'fertility_rate'].includes(m.key))
  const spanA = socialMs.length > 0 ? (Math.max(...socialMs.map(m => m.valueA)) - Math.min(...socialMs.map(m => m.valueA))).toFixed(0) : 0
  const spanB = socialMs.length > 0 ? (Math.max(...socialMs.map(m => m.valueB)) - Math.min(...socialMs.map(m => m.valueB))).toFixed(0) : 0

  if (!started) {
    return (
      <div onClick={() => setStarted(true)} className="cursor-pointer">
        <JourneyIntro profileA={profileA} profileB={profileB} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Sticky timeline (55%) */}
      <div className="hidden md:block w-[55%] bg-white border-r border-text-faint/10 px-4">
        <TimelinePanel
          profileA={profileA}
          profileB={profileB}
          milestones={milestones}
          activeIndex={activeIndex}
        />
      </div>

      {/* Right: Scrolling narrative cards (45%) */}
      <div className="w-full md:w-[45%] bg-bg px-4 md:px-6 py-8">
        {/* Mobile: show a mini progress bar */}
        <div className="md:hidden sticky top-16 z-30 bg-bg/90 backdrop-blur-sm py-2 mb-4">
          <div className="flex gap-1 justify-center">
            {milestones.map((m, i) => (
              <div key={m.key} className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: i <= activeIndex ? m.color : m.color + '30' }} />
            ))}
          </div>
        </div>

        {/* Narrative cards */}
        {milestones.map((m, i) => (
          <NarrativeCard
            key={m.key}
            milestone={m}
            profileA={profileA}
            profileB={profileB}
            index={i}
            onActivate={setActiveIndex}
          />
        ))}

        {/* End card */}
        <div className="min-h-[50vh] flex items-center py-12">
          <motion.div className="text-center w-full"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ amount: 0.5, once: true }} transition={{ duration: 0.6 }}>
            <p className="font-body text-sm md:text-base text-text-secondary mb-2">
              {profileA.name} fits {socialMs.length} milestones across {spanA} years.
            </p>
            <p className="font-body text-sm md:text-base text-text-secondary mb-6">
              {profileB.name} fits {socialMs.length} milestones across {spanB} years.
            </p>
            <p className="font-display text-lg md:text-xl text-text mb-6">
              Does the timing matter? Keep going.
            </p>
            <motion.button onClick={onComplete}
              className="px-8 py-3 rounded-full border border-text/20 font-body text-sm text-text cursor-pointer hover:bg-white hover:shadow-md transition-all"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              See the connections →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
