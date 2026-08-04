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

function getProfile(code) { return countryProfiles.find(c => c.country === code) }

function getValue(profile, m) {
  const ms = profile.milestones?.[m.profileKey]
  if (ms?.value != null) return ms.value
  const oc = profile.outcomes?.[m.profileKey]
  if (oc?.value != null) return oc.value
  return null
}

function getSharedMilestones(profileA, profileB) {
  return MILESTONES.filter(m => getValue(profileA, m) != null && getValue(profileB, m) != null)
    .map(m => ({ ...m, valueA: getValue(profileA, m), valueB: getValue(profileB, m) }))
}

function ageToY(age, h = 500) { return ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * h }

function generateNarrative(m, profileA, profileB) {
  const gap = Math.abs(m.valueA - m.valueB).toFixed(1)
  const earlier = m.valueA <= m.valueB ? profileA.name : profileB.name
  const later = m.valueA <= m.valueB ? profileB.name : profileA.name
  const vE = Math.min(m.valueA, m.valueB), vL = Math.max(m.valueA, m.valueB)
  switch (m.key) {
    case 'menarche': return `Both countries start within ${gap} years. Biology sets a similar starting line.`
    case 'education': return parseFloat(gap) > 3 ? `${later} spends ${gap} more years in school than ${earlier}. Everything after shifts.` : `Education takes similar time in both, but what happens next couldn't be more different.`
    case 'leaving_home': return `Independence at ${vE} in ${earlier}, not until ${vL} in ${later}. Culture makes the difference.`
    case 'cohabitation': return `${earlier} starts with a partner at ${vE}. ${later} waits until ${vL}.`
    case 'first_home': return `Homeownership at ${vE} in ${earlier}, not until ${vL} in ${later}.`
    case 'marriage': return parseFloat(gap) > 10 ? `A ${gap}-year gap. ${earlier} marries at ${vE}, ${later} at ${vL}. This predicts almost everything.` : `${earlier} marries at ${vE}, ${later} at ${vL}. A ${gap}-year difference that ripples forward.`
    case 'first_baby': return `First child at ${vE} in ${earlier}, ${vL} in ${later}. Later births mean fewer children overall.`
    case 'fertility_rate': return `${profileA.name} has ${m.valueA} children per woman. ${profileB.name} has ${m.valueB}. Below 2.1, population shrinks.`
    case 'menopause': return `Menopause at ${vE} in ${earlier}, ${vL} in ${later}.`
    case 'retirement': return `${earlier} stops working at ${vE}. ${later} works until ${vL}.`
    case 'hale': return `Healthy life ends at ${vE} in ${earlier}, ${vL} in ${later}. Everything after is declining health.`
    case 'life_expectancy': return `Life ends at ${vE} in ${earlier}, ${vL} in ${later}.`
    default: return ''
  }
}

// --- Left: Vertical Timeline (sticky) ---
function TimelineLeft({ profileA, profileB, milestones, hoveredIndex }) {
  const h = 500
  const AGE_TICKS = [12, 20, 30, 40, 50, 60, 70, 80, 85]

  return (
    <div className="sticky top-16 h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="relative" style={{ height: `${h + 40}px`, width: '100%', maxWidth: '320px' }}>
        {/* Age axis */}
        <div className="absolute left-0 top-0 w-8" style={{ height: `${h}px` }}>
          {AGE_TICKS.map(age => (
            <div key={age} className="absolute flex items-center" style={{ top: `${ageToY(age, h)}px`, transform: 'translateY(-50%)' }}>
              <span className="text-[9px] font-data text-text-faint w-6 text-right">{age}</span>
              <div className="w-1.5 h-px bg-text-faint/30 ml-0.5" />
            </div>
          ))}
          <div className="absolute left-7 w-px bg-text-faint/15" style={{ top: `${ageToY(12, h)}px`, height: `${ageToY(85, h) - ageToY(12, h)}px` }} />
        </div>

        {/* Column headers */}
        <div className="absolute left-10 right-0 top-[-20px] flex justify-around">
          <span className="text-[10px] font-body text-text-secondary">{profileA.flag} {profileA.name}</span>
          <span className="text-[10px] font-body text-text-secondary">{profileB.flag} {profileB.name}</span>
        </div>

        {/* Milestone dots */}
        {milestones.map((m, i) => {
          const yA = m.key === 'fertility_rate' ? ageToY(35, h) : ageToY(m.valueA, h)
          const yB = m.key === 'fertility_rate' ? ageToY(35, h) : ageToY(m.valueB, h)
          const isHovered = hoveredIndex === i
          const isActive = hoveredIndex === -1 || isHovered

          return (
            <g key={m.key}>
              {/* Country A dot */}
              <motion.div className="absolute" style={{ left: '30%', top: `${yA}px`, transform: 'translate(-50%, -50%)' }}
                animate={{ scale: isHovered ? 1.4 : 1, opacity: isActive ? 1 : 0.3 }}
                transition={{ duration: 0.2 }}>
                <div className="w-3.5 h-3.5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: isHovered ? m.color : m.color + '60', borderColor: m.color, boxShadow: isHovered ? `0 0 12px ${m.color}80` : 'none' }} />
                {isHovered && <span className="absolute -left-8 top-0 text-[8px] font-data" style={{ color: m.color }}>{m.key === 'fertility_rate' ? m.valueA : Math.round(m.valueA)}</span>}
              </motion.div>

              {/* Country B dot */}
              <motion.div className="absolute" style={{ right: '30%', top: `${yB}px`, transform: 'translate(50%, -50%)' }}
                animate={{ scale: isHovered ? 1.4 : 1, opacity: isActive ? 1 : 0.3 }}
                transition={{ duration: 0.2 }}>
                <div className="w-3.5 h-3.5 rounded-full border-2 transition-all"
                  style={{ backgroundColor: isHovered ? m.color : m.color + '60', borderColor: m.color, boxShadow: isHovered ? `0 0 12px ${m.color}80` : 'none' }} />
                {isHovered && <span className="absolute -right-8 top-0 text-[8px] font-data" style={{ color: m.color }}>{m.key === 'fertility_rate' ? m.valueB : Math.round(m.valueB)}</span>}
              </motion.div>

              {/* Connecting line (shown on hover) */}
              {isHovered && (
                <motion.div className="absolute left-[30%] right-[30%] border-t-2 border-dashed"
                  style={{ top: `${(yA + yB) / 2}px`, borderColor: m.color + '60' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-4 text-[9px] font-data px-1 bg-white rounded" style={{ color: m.color }}>
                    {Math.abs(m.valueA - m.valueB).toFixed(m.key === 'fertility_rate' ? 2 : 0)} {m.unit === 'children' ? '' : 'yr'}
                  </span>
                </motion.div>
              )}
            </g>
          )
        })}
      </div>
    </div>
  )
}

// --- Right: All milestone cards (hover to highlight) ---
function MilestoneCard({ milestone, profileA, profileB, index, onHover }) {
  const narrative = generateNarrative(milestone, profileA, profileB)
  const gap = Math.abs(milestone.valueA - milestone.valueB)

  return (
    <div className="py-6 border-b border-text-faint/10"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(-1)}>
      <div className="flex items-start gap-3 cursor-default">
        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: milestone.color }} />
        <div className="flex-1">
          <h4 className="font-display text-base md:text-lg mb-2" style={{ color: milestone.color }}>{milestone.label}</h4>
          <div className="flex gap-6 mb-2 text-sm font-data">
            <span className="text-text">{profileA.flag} {milestone.key === 'fertility_rate' ? milestone.valueA.toFixed(2) : milestone.valueA.toFixed(1)}</span>
            <span className="text-text">{profileB.flag} {milestone.key === 'fertility_rate' ? milestone.valueB.toFixed(2) : milestone.valueB.toFixed(1)}</span>
            <span className="font-medium" style={{ color: milestone.color }}>Gap: {gap.toFixed(milestone.key === 'fertility_rate' ? 2 : 1)}</span>
          </div>
          <p className="font-body text-sm text-text-secondary leading-relaxed">{narrative}</p>
        </div>
      </div>
    </div>
  )
}

// --- Main Timeline ---
export default function Timeline({ pair, onComplete }) {
  const [started, setStarted] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const milestones = getSharedMilestones(profileA, profileB)

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
      {/* Left: Sticky vertical timeline (55%) */}
      <div className="hidden md:block w-[50%] bg-white border-r border-text-faint/10 px-4">
        <TimelineLeft profileA={profileA} profileB={profileB} milestones={milestones} hoveredIndex={hoveredIndex} />
      </div>

      {/* Right: All milestone cards (50%) */}
      <div className="w-full md:w-[50%] bg-bg px-4 md:px-8 py-8">
        <h2 className="font-display text-xl md:text-2xl text-text mb-2">
          {profileA.flag} {profileA.name} vs {profileB.flag} {profileB.name}
        </h2>
        <p className="text-text-muted font-body text-sm mb-6">Hover over any milestone to highlight it on the timeline.</p>

        {/* All milestones visible at once */}
        {milestones.map((m, i) => (
          <MilestoneCard key={m.key} milestone={m} profileA={profileA} profileB={profileB} index={i} onHover={setHoveredIndex} />
        ))}

        {/* End summary */}
        <div className="mt-8 py-8 text-center">
          <p className="font-body text-sm text-text-secondary mb-2">
            {profileA.name}: {socialMs.length} milestones across {spanA} years.
          </p>
          <p className="font-body text-sm text-text-secondary mb-6">
            {profileB.name}: {socialMs.length} milestones across {spanB} years.
          </p>
          <motion.button onClick={onComplete}
            className="px-8 py-3 rounded-full border border-text/20 font-body text-sm text-text cursor-pointer hover:bg-white hover:shadow-md transition-all"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Does timing matter? →
          </motion.button>
        </div>
      </div>
    </div>
  )
}
