import { useState } from 'react'
import { motion } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'
import marriageBySex from '../../data/marriage_by_sex.json'
import haleBySex from '../../data/hale_by_sex.json'
import lifeExpBySex from '../../data/life_expectancy_by_sex.json'
import yearsPoorBySex from '../../data/years_poor_health_by_sex.json'
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

// Build gender data lookup
function buildGenderLookup() {
  const lookup = {}
  function ensure(code) { if (!lookup[code]) lookup[code] = {} }

  marriageBySex.forEach(r => {
    ensure(r.country)
    if (!lookup[r.country].marriage) lookup[r.country].marriage = {}
    lookup[r.country].marriage[r.sex.toLowerCase()] = r.age
  })
  haleBySex.forEach(r => {
    ensure(r.country)
    if (!lookup[r.country].hale) lookup[r.country].hale = {}
    lookup[r.country].hale[r.sex.toLowerCase()] = r.hale
  })
  lifeExpBySex.forEach(r => {
    ensure(r.country)
    if (!lookup[r.country].life_expectancy) lookup[r.country].life_expectancy = {}
    lookup[r.country].life_expectancy[r.sex.toLowerCase()] = r.life_expectancy
  })
  yearsPoorBySex.forEach(r => {
    ensure(r.country_code)
    if (!lookup[r.country_code].years_poor_health) lookup[r.country_code].years_poor_health = {}
    lookup[r.country_code].years_poor_health[r.sex.toLowerCase()] = r.years_poor_health
  })
  return lookup
}

const GENDER_DATA = buildGenderLookup()
const GENDER_MILESTONES = new Set(['marriage', 'hale', 'life_expectancy', 'years_poor_health'])

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
    case 'menarche': return `Both start within ${gap} years. Biology sets a similar starting line.`
    case 'education': return parseFloat(gap) > 3 ? `${later} spends ${gap} more years in school.` : `Similar time in education, but different paths after.`
    case 'leaving_home': return `Independence at ${vE} in ${earlier}, ${vL} in ${later}.`
    case 'cohabitation': return `${earlier} partners at ${vE}. ${later} waits until ${vL}.`
    case 'first_home': return `Home at ${vE} in ${earlier}, ${vL} in ${later}.`
    case 'marriage': return parseFloat(gap) > 10 ? `A ${gap}-year gap. This predicts almost everything.` : `${gap}-year difference that ripples forward.`
    case 'first_baby': return `First child at ${vE} in ${earlier}, ${vL} in ${later}.`
    case 'fertility_rate': return `${profileA.name}: ${m.valueA}. ${profileB.name}: ${m.valueB}. Below 2.1, population shrinks.`
    case 'menopause': return `Menopause at ${vE} in ${earlier}, ${vL} in ${later}.`
    case 'retirement': return `${earlier} retires at ${vE}. ${later} works until ${vL}.`
    case 'hale': return `Healthy life ends at ${vE} in ${earlier}, ${vL} in ${later}.`
    case 'life_expectancy': return `Life ends at ${vE} in ${earlier}, ${vL} in ${later}.`
    default: return ''
  }
}

function generateGenderNarrative(m, profileA, profileB) {
  const gA = GENDER_DATA[profileA.country]?.[m.key]
  const gB = GENDER_DATA[profileB.country]?.[m.key]
  if (!gA || !gB) return null
  const gapA = (gA.female - gA.male).toFixed(1)
  const gapB = (gB.female - gB.male).toFixed(1)
  switch (m.key) {
    case 'marriage': {
      let text = `In ${profileA.name}, women marry at ${gA.female} and men at ${gA.male} (gap: ${gapA}yr). In ${profileB.name}, women at ${gB.female}, men at ${gB.male} (gap: ${gapB}yr).`
      if ((parseFloat(gapA) > 0 && parseFloat(gapB) < 0) || (parseFloat(gapA) < 0 && parseFloat(gapB) > 0)) text += ' A complete reversal in gender dynamics.'
      return text
    }
    case 'hale': return `Healthy life ends at ${gA.female} for women and ${gA.male} for men in ${profileA.name} (women get ${gapA} more years). In ${profileB.name}: ${gB.female} vs ${gB.male} (${gapB}yr).`
    case 'life_expectancy': return `Women outlive men by ${gapA} years in ${profileA.name} and ${gapB} years in ${profileB.name}.`
    case 'years_poor_health': return `Women spend ${gA.female}yr in poor health in ${profileA.name} vs ${gA.male}yr for men (${gapA}yr more). In ${profileB.name}: ${gB.female} vs ${gB.male} (${gapB}yr).`
    default: return null
  }
}

// --- Gender Toggle ---
function GenderToggle({ genderView, setGenderView }) {
  return (
    <div className="sticky top-16 z-20 bg-bg/95 backdrop-blur-sm py-2 mb-4 flex justify-center">
      <div className="inline-flex rounded-full border border-text-faint/20 p-0.5">
        <button onClick={() => setGenderView(false)}
          className={`px-4 py-1.5 rounded-full text-xs font-body cursor-pointer transition-all ${!genderView ? 'bg-[#264653] text-white' : 'text-text-muted hover:text-text'}`}>
          All
        </button>
        <button onClick={() => setGenderView(true)}
          className={`px-4 py-1.5 rounded-full text-xs font-body cursor-pointer transition-all ${genderView ? 'bg-[#E07A5F] text-white' : 'text-text-muted hover:text-text'}`}>
          ♂ Male / ♀ Female
        </button>
      </div>
    </div>
  )
}

// --- Left Timeline ---
function TimelineLeft({ profileA, profileB, milestones, hoveredIndex, genderView }) {
  const h = 500
  const AGE_TICKS = [12, 20, 30, 40, 50, 60, 70, 80, 85]

  return (
    <div className="sticky top-16 h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="relative" style={{ height: `${h + 40}px`, width: '100%', maxWidth: '320px' }}>
        <div className="absolute left-0 top-0 w-8" style={{ height: `${h}px` }}>
          {AGE_TICKS.map(age => (
            <div key={age} className="absolute flex items-center" style={{ top: `${ageToY(age, h)}px`, transform: 'translateY(-50%)' }}>
              <span className="text-[9px] font-data text-text-faint w-6 text-right">{age}</span>
              <div className="w-1.5 h-px bg-text-faint/30 ml-0.5" />
            </div>
          ))}
          <div className="absolute left-7 w-px bg-text-faint/15" style={{ top: `${ageToY(12, h)}px`, height: `${ageToY(85, h) - ageToY(12, h)}px` }} />
        </div>

        <div className="absolute left-10 right-0 top-[-20px] flex justify-around">
          <span className="text-[10px] font-body text-text-secondary">{profileA.flag} {profileA.name}</span>
          <span className="text-[10px] font-body text-text-secondary">{profileB.flag} {profileB.name}</span>
        </div>

        {milestones.map((m, i) => {
          const isHovered = hoveredIndex === i
          const isActive = hoveredIndex === -1 || isHovered
          const hasGender = genderView && GENDER_MILESTONES.has(m.key)
          const gA = GENDER_DATA[profileA.country]?.[m.key]
          const gB = GENDER_DATA[profileB.country]?.[m.key]

          if (hasGender && gA && gB) {
            const yAm = ageToY(gA.male, h), yAf = ageToY(gA.female, h)
            const yBm = ageToY(gB.male, h), yBf = ageToY(gB.female, h)
            return (
              <g key={m.key}>
                {/* Male dots */}
                <motion.div className="absolute" style={{ left: '28%', top: `${yAm}px`, transform: 'translate(-50%, -50%)' }}
                  animate={{ scale: isHovered ? 1.3 : 1, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#78909C', boxShadow: isHovered ? '0 0 8px #78909C80' : 'none' }} />
                </motion.div>
                <motion.div className="absolute" style={{ left: '35%', top: `${yAf}px`, transform: 'translate(-50%, -50%)' }}
                  animate={{ scale: isHovered ? 1.3 : 1, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E07A5F', boxShadow: isHovered ? '0 0 8px #E07A5F80' : 'none' }} />
                </motion.div>
                <motion.div className="absolute" style={{ right: '28%', top: `${yBm}px`, transform: 'translate(50%, -50%)' }}
                  animate={{ scale: isHovered ? 1.3 : 1, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#78909C', boxShadow: isHovered ? '0 0 8px #78909C80' : 'none' }} />
                </motion.div>
                <motion.div className="absolute" style={{ right: '35%', top: `${yBf}px`, transform: 'translate(50%, -50%)' }}
                  animate={{ scale: isHovered ? 1.3 : 1, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E07A5F', boxShadow: isHovered ? '0 0 8px #E07A5F80' : 'none' }} />
                </motion.div>
              </g>
            )
          }

          // Single dots (no gender data or all view)
          const yA = m.key === 'fertility_rate' ? ageToY(35, h) : ageToY(m.valueA, h)
          const yB = m.key === 'fertility_rate' ? ageToY(35, h) : ageToY(m.valueB, h)
          return (
            <g key={m.key}>
              <motion.div className="absolute" style={{ left: '30%', top: `${yA}px`, transform: 'translate(-50%, -50%)' }}
                animate={{ scale: isHovered ? 1.4 : 1, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                <div className="w-3.5 h-3.5 rounded-full border-2" style={{ backgroundColor: isHovered ? m.color : m.color + '60', borderColor: m.color, boxShadow: isHovered ? `0 0 12px ${m.color}80` : 'none' }} />
              </motion.div>
              <motion.div className="absolute" style={{ right: '30%', top: `${yB}px`, transform: 'translate(50%, -50%)' }}
                animate={{ scale: isHovered ? 1.4 : 1, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.2 }}>
                <div className="w-3.5 h-3.5 rounded-full border-2" style={{ backgroundColor: isHovered ? m.color : m.color + '60', borderColor: m.color, boxShadow: isHovered ? `0 0 12px ${m.color}80` : 'none' }} />
              </motion.div>
              {isHovered && (
                <motion.div className="absolute left-[30%] right-[30%] border-t-2 border-dashed"
                  style={{ top: `${(yA + yB) / 2}px`, borderColor: m.color + '60' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="absolute left-1/2 -translate-x-1/2 -top-4 text-[9px] font-data px-1 bg-white rounded" style={{ color: m.color }}>
                    {Math.abs(m.valueA - m.valueB).toFixed(m.key === 'fertility_rate' ? 2 : 0)}yr
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

// --- Milestone Card ---
function MilestoneCard({ milestone, profileA, profileB, index, onHover, genderView }) {
  const narrative = genderView && GENDER_MILESTONES.has(milestone.key)
    ? generateGenderNarrative(milestone, profileA, profileB) || generateNarrative(milestone, profileA, profileB)
    : generateNarrative(milestone, profileA, profileB)

  const gap = Math.abs(milestone.valueA - milestone.valueB)
  const pctA = milestone.key === 'fertility_rate' ? (milestone.valueA / 4) * 100 : (milestone.valueA / AGE_MAX) * 100
  const pctB = milestone.key === 'fertility_rate' ? (milestone.valueB / 4) * 100 : (milestone.valueB / AGE_MAX) * 100
  const hasGender = GENDER_MILESTONES.has(milestone.key)
  const gA = GENDER_DATA[profileA.country]?.[milestone.key]
  const gB = GENDER_DATA[profileB.country]?.[milestone.key]

  return (
    <div className="py-5 border-b border-text-faint/10" onMouseEnter={() => onHover(index)} onMouseLeave={() => onHover(-1)}>
      <div className="flex items-start gap-3 cursor-default">
        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: milestone.color }} />
        <div className="flex-1">
          <h4 className="font-display text-base md:text-lg mb-2" style={{ color: milestone.color }}>{milestone.label}</h4>

          {/* Gender view table */}
          {genderView && hasGender && gA && gB ? (
            <div className="mb-3">
              <table className="text-[11px] font-data w-full max-w-[280px]">
                <thead>
                  <tr className="text-text-muted">
                    <td className="pr-3"></td>
                    <td className="pr-3">{profileA.flag} {profileA.name}</td>
                    <td>{profileB.flag} {profileB.name}</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pr-3 text-[#78909C]">♂ Male</td>
                    <td className="pr-3 text-[#78909C]">{gA.male}</td>
                    <td className="text-[#78909C]">{gB.male}</td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-[#E07A5F]">♀ Female</td>
                    <td className="pr-3 text-[#E07A5F]">{gA.female}</td>
                    <td className="text-[#E07A5F]">{gB.female}</td>
                  </tr>
                  <tr className="border-t border-text-faint/10">
                    <td className="pr-3 text-text-muted pt-1">Gap (F-M)</td>
                    <td className={`pr-3 pt-1 font-medium ${Math.abs(gA.female - gA.male) > 2 ? 'text-[#E07A5F]' : 'text-text-muted'}`}>
                      {(gA.female - gA.male) > 0 ? '+' : ''}{(gA.female - gA.male).toFixed(1)}
                    </td>
                    <td className={`pt-1 font-medium ${Math.abs(gB.female - gB.male) > 2 ? 'text-[#E07A5F]' : 'text-text-muted'}`}>
                      {(gB.female - gB.male) > 0 ? '+' : ''}{(gB.female - gB.male).toFixed(1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* Standard bars */
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-data text-text-muted w-14">{profileA.flag} {milestone.key === 'fertility_rate' ? milestone.valueA.toFixed(2) : milestone.valueA.toFixed(1)}</span>
                <div className="flex-1 h-2.5 bg-[#1a3340]/6 rounded-full overflow-hidden max-w-[200px]">
                  <div className="h-full rounded-full" style={{ backgroundColor: milestone.color, width: `${pctA}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-data text-text-muted w-14">{profileB.flag} {milestone.key === 'fertility_rate' ? milestone.valueB.toFixed(2) : milestone.valueB.toFixed(1)}</span>
                <div className="flex-1 h-2.5 bg-[#1a3340]/6 rounded-full overflow-hidden max-w-[200px]">
                  <div className="h-full rounded-full" style={{ backgroundColor: milestone.color, opacity: 0.6, width: `${pctB}%` }} />
                </div>
              </div>
            </div>
          )}

          {!genderView && hasGender && <span className="text-[9px] text-text-faint font-data">(toggle ♂/♀ for gender split)</span>}

          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-data font-medium mb-2"
            style={{ backgroundColor: milestone.color + '15', color: milestone.color }}>
            Gap: {gap.toFixed(milestone.key === 'fertility_rate' ? 2 : 1)} {milestone.unit === 'children' ? 'children' : 'years'}
          </span>
          <p className="font-body text-sm text-text-secondary leading-relaxed">{narrative}</p>
        </div>
      </div>
    </div>
  )
}

// --- Main ---
export default function Timeline({ pair, onComplete }) {
  const [started, setStarted] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [genderView, setGenderView] = useState(false)

  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const milestones = getSharedMilestones(profileA, profileB)
  const socialMs = milestones.filter(m => !['menarche', 'menopause', 'hale', 'life_expectancy', 'fertility_rate'].includes(m.key))
  const spanA = socialMs.length > 0 ? (Math.max(...socialMs.map(m => m.valueA)) - Math.min(...socialMs.map(m => m.valueA))).toFixed(0) : 0
  const spanB = socialMs.length > 0 ? (Math.max(...socialMs.map(m => m.valueB)) - Math.min(...socialMs.map(m => m.valueB))).toFixed(0) : 0

  if (!started) return <div onClick={() => setStarted(true)} className="cursor-pointer"><JourneyIntro profileA={profileA} profileB={profileB} /></div>

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-[50%] bg-white border-r border-text-faint/10 px-4">
        <TimelineLeft profileA={profileA} profileB={profileB} milestones={milestones} hoveredIndex={hoveredIndex} genderView={genderView} />
      </div>
      <div className="w-full md:w-[50%] bg-bg px-4 md:px-8 py-8">
        <h2 className="font-display text-xl md:text-2xl text-text mb-1">{profileA.flag} {profileA.name} vs {profileB.flag} {profileB.name}</h2>
        <p className="text-text-muted font-body text-sm mb-2">Hover to highlight on the timeline.</p>
        <GenderToggle genderView={genderView} setGenderView={setGenderView} />
        {(genderView ? milestones.filter(m => GENDER_MILESTONES.has(m.key) && GENDER_DATA[profileA.country]?.[m.key] && GENDER_DATA[profileB.country]?.[m.key]) : milestones).map((m, i) => (
          <MilestoneCard key={m.key} milestone={m} profileA={profileA} profileB={profileB} index={milestones.indexOf(m)} onHover={setHoveredIndex} genderView={genderView} />
        ))}
        <div className="mt-8 py-8 text-center">
          <p className="font-body text-sm text-text-secondary mb-2">{profileA.name}: {socialMs.length} milestones across {spanA} years.</p>
          <p className="font-body text-sm text-text-secondary mb-6">{profileB.name}: {socialMs.length} milestones across {spanB} years.</p>
          <motion.button onClick={onComplete} className="px-8 py-3 rounded-full border border-text/20 font-body text-sm text-text cursor-pointer hover:bg-white hover:shadow-md transition-all"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Does timing matter? →</motion.button>
        </div>
      </div>
    </div>
  )
}
