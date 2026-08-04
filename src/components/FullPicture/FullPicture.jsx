import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'

const MILESTONES = [
  { key: 'menarche', profileKey: 'menarche', label: 'Puberty', color: '#C2185B' },
  { key: 'education', profileKey: 'education', label: 'Education', color: '#2D6A4F' },
  { key: 'leaving_home', profileKey: 'leaving_home', label: 'Leave Home', color: '#2A9D8F' },
  { key: 'cohabitation', profileKey: 'cohabitation', label: 'Partner', color: '#00897B' },
  { key: 'first_home', profileKey: 'first_home', label: 'First Home', color: '#48BFE3' },
  { key: 'marriage', profileKey: 'marriage', label: 'Marriage', color: '#E76F51' },
  { key: 'first_baby', profileKey: 'first_baby', label: 'First Child', color: '#E9C46A' },
  { key: 'menopause', profileKey: 'menopause', label: 'Menopause', color: '#AB47BC' },
  { key: 'retirement', profileKey: 'retirement_age', label: 'Retirement', color: '#457B9D' },
  { key: 'hale', profileKey: 'hale', label: 'Healthy End', color: '#7B2D8E' },
  { key: 'life_expectancy', profileKey: 'life_expectancy', label: 'Life End', color: '#264653' },
]

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

function getMarkers(profile) {
  return MILESTONES
    .map(m => {
      const val = getValue(profile, m)
      if (val === null) return null
      return { ...m, value: val }
    })
    .filter(Boolean)
    .sort((a, b) => a.value - b.value)
}

// Build timeline rows: each unique age gets a row
function buildTimelineRows(markersA, markersB) {
  const allEvents = []
  markersA.forEach(m => allEvents.push({ ...m, side: 'A' }))
  markersB.forEach(m => allEvents.push({ ...m, side: 'B' }))
  allEvents.sort((a, b) => a.value - b.value)

  // Group events that are within 0.5 years of each other
  const rows = []
  for (const event of allEvents) {
    const existing = rows.find(r => Math.abs(r.age - event.value) < 0.8)
    if (existing) {
      existing.events.push(event)
      existing.age = (existing.age + event.value) / 2 // average
    } else {
      rows.push({ age: event.value, events: [event] })
    }
  }
  return rows.sort((a, b) => a.age - b.age)
}

function computeAnnotations(profileA, profileB, markersA, markersB) {
  const annotations = []

  // Compression
  const eduA = markersA.find(m => m.key === 'education')?.value
  const retA = markersA.find(m => m.key === 'retirement')?.value
  const eduB = markersB.find(m => m.key === 'education')?.value
  const retB = markersB.find(m => m.key === 'retirement')?.value

  if (eduA && retA) {
    const countA = markersA.filter(m => m.value >= eduA && m.value <= retA).length
    const spanA = Math.round(retA - eduA)
    const firstA = Math.round(eduA)
    const lastA = Math.round(retA)
    if (eduB && retB) {
      const countB = markersB.filter(m => m.value >= eduB && m.value <= retB).length
      const spanB = Math.round(retB - eduB)
      annotations.push(
        `${profileA.name} fits ${countA} milestones between ages ${firstA} and ${lastA}. ${profileB.name} fits ${countB} between ${Math.round(eduB)} and ${Math.round(retB)}.`
      )
    }
  }

  // Sequence violation
  const marA = markersA.find(m => m.key === 'marriage')?.value
  const babyA = markersA.find(m => m.key === 'first_baby')?.value
  const marB = markersB.find(m => m.key === 'marriage')?.value
  const babyB = markersB.find(m => m.key === 'first_baby')?.value

  if (marA && babyA && babyA < marA) {
    annotations.push(`In ${profileA.name}, first child arrives ${(marA - babyA).toFixed(1)} years before marriage. The traditional sequence reversed.`)
  }
  if (marB && babyB && babyB < marB) {
    annotations.push(`In ${profileB.name}, first child arrives ${(marB - babyB).toFixed(1)} years before marriage. The traditional sequence reversed.`)
  }

  // Life span summary
  const lifeA = markersA.find(m => m.key === 'life_expectancy')?.value
  const lifeB = markersB.find(m => m.key === 'life_expectancy')?.value
  if (lifeA && lifeB) {
    const gap = Math.abs(lifeA - lifeB).toFixed(0)
    annotations.push(`${profileA.name}: ${lifeA} years. ${profileB.name}: ${lifeB} years. ${gap} years apart.`)
  }

  return annotations
}

// Find shared milestones for connector lines
function getSharedMilestones(markersA, markersB) {
  const shared = []
  for (const mA of markersA) {
    const mB = markersB.find(mb => mb.key === mA.key)
    if (mB) {
      shared.push({ key: mA.key, ageA: mA.value, ageB: mB.value, color: mA.color, label: mA.label })
    }
  }
  return shared
}

export default function FullPicture({ pair, onComplete }) {
  const [animDone, setAnimDone] = useState(false)
  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const markersA = getMarkers(profileA)
  const markersB = getMarkers(profileB)
  const annotations = computeAnnotations(profileA, profileB, markersA, markersB)
  const shared = getSharedMilestones(markersA, markersB)

  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), 2500)
    return () => clearTimeout(t)
  }, [])

  // Age range for the vertical axis
  const AGE_MIN = 10
  const AGE_MAX = 88
  const TIMELINE_HEIGHT = 580 // px

  function ageToY(age) {
    return ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * TIMELINE_HEIGHT
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-8">
      <div className="w-full max-w-[800px]">
        {/* Title */}
        <motion.h2
          className="font-display text-2xl md:text-4xl text-center mb-2 text-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          The shape of two lives
        </motion.h2>
        <motion.p
          className="text-center text-text-secondary font-body text-sm md:text-base mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Every milestone they share, and every one they don't, on a single timeline.
        </motion.p>

        {/* Column headers */}
        <div className="flex items-center mb-4 pl-12">
          <div className="flex-1 text-center">
            <span className="font-body font-medium text-sm md:text-base text-text/80">
              {profileA.flag} {profileA.name}
            </span>
          </div>
          <div className="w-16 md:w-24" /> {/* Gap column */}
          <div className="flex-1 text-center">
            <span className="font-body font-medium text-sm md:text-base text-text/80">
              {profileB.flag} {profileB.name}
            </span>
          </div>
        </div>

        {/* Vertical timeline */}
        <div className="relative overflow-y-auto max-h-[65vh] md:max-h-none" style={{ height: `${TIMELINE_HEIGHT + 20}px` }}>
          {/* Age axis (left side) */}
          <div className="absolute left-0 top-0 w-10 h-full">
            {[12, 20, 30, 40, 50, 60, 70, 80, 85].map(age => (
              <div
                key={age}
                className="absolute flex items-center"
                style={{ top: `${ageToY(age)}px`, transform: 'translateY(-50%)' }}
              >
                <span className="text-[9px] font-data text-text/40 w-7 text-right">{age}</span>
                <div className="w-2 h-px bg-text/20 ml-1" />
              </div>
            ))}
            {/* Vertical line */}
            <div
              className="absolute left-9 w-px bg-text/15"
              style={{ top: `${ageToY(12)}px`, height: `${ageToY(85) - ageToY(12)}px` }}
            />
          </div>

          {/* Content area */}
          <div className="ml-12 relative h-full">
            {/* Connecting lines for shared milestones */}
            {shared.map((s, i) => {
              const yA = ageToY(s.ageA)
              const yB = ageToY(s.ageB)
              const yMin = Math.min(yA, yB)
              const yMax = Math.max(yA, yB)
              const gap = Math.abs(s.ageA - s.ageB).toFixed(1)

              if (Math.abs(s.ageA - s.ageB) < 0.5) return null

              return (
                <motion.div
                  key={s.key}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                  style={{ top: `${yMin}px`, height: `${yMax - yMin}px`, width: '80px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
                >
                  {/* Dashed line */}
                  <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed" style={{ borderColor: s.color + '50' }} />
                  {/* Gap label */}
                  <span className="text-[9px] font-data px-1 bg-bg rounded" style={{ color: s.color }}>
                    {s.ageA < s.ageB ? '+' : ''}{(s.ageB - s.ageA).toFixed(0)} yr
                  </span>
                </motion.div>
              )
            })}

            {/* Country A markers (left side) */}
            {markersA.map((marker, i) => (
              <motion.div
                key={`A-${marker.key}`}
                className="absolute flex items-center justify-end pr-2"
                style={{
                  top: `${ageToY(marker.value)}px`,
                  transform: 'translateY(-50%)',
                  right: '52%',
                  left: 0,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
              >
                <span className="text-[10px] md:text-xs font-body text-text/60 mr-2 whitespace-nowrap">
                  {marker.label} ({Math.round(marker.value)})
                </span>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: marker.color }}
                />
              </motion.div>
            ))}

            {/* Country B markers (right side) */}
            {markersB.map((marker, i) => (
              <motion.div
                key={`B-${marker.key}`}
                className="absolute flex items-center pl-2"
                style={{
                  top: `${ageToY(marker.value)}px`,
                  transform: 'translateY(-50%)',
                  left: '52%',
                  right: 0,
                }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: marker.color }}
                />
                <span className="text-[10px] md:text-xs font-body text-text/60 ml-2 whitespace-nowrap">
                  {marker.label} ({Math.round(marker.value)})
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Annotations */}
        <motion.div
          className="text-center space-y-2 mt-8 mb-4 max-w-[650px] mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={animDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {annotations.map((text, i) => (
            <p key={i} className="text-text-secondary font-body text-sm md:text-base leading-relaxed">
              {text}
            </p>
          ))}
        </motion.div>

        {/* Milestone legend */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-8 max-w-[600px] mx-auto"
          initial={{ opacity: 0 }}
          animate={animDone ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {MILESTONES.map(m => (
            <span key={m.key} className="flex items-center gap-1 text-[10px] font-data text-text-muted">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: m.color }} />
              {m.label}
            </span>
          ))}
        </motion.div>

        {/* Transition */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={animDone ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl border border-text/20 font-body text-sm text-text hover:bg-white hover:shadow-md transition-all cursor-pointer"
          >
            Does the timing matter? →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
