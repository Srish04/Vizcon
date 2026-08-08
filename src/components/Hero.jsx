import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import countryProfiles from '../data/country_profiles.json'

// === DATA ===
const MARKERS_GLOBAL = [
  { key: 'menarche', label: 'Puberty', age: 13, color: '#C2185B', pct: 5 },
  { key: 'education', label: 'Education', age: 22, color: '#2D6A4F', pct: 20 },
  { key: 'leaving_home', label: 'Leave Home', age: 24, color: '#2A9D8F', pct: 32 },
  { key: 'cohabitation', label: 'Cohabitation', age: 26, color: '#00897B', pct: 42 },
  { key: 'marriage', label: 'Marriage', age: 29, color: '#E76F51', pct: 54 },
  { key: 'first_baby', label: 'First Child', age: 30, color: '#E9C46A', pct: 62 },
  { key: 'first_home', label: 'First Home', age: 33, color: '#48BFE3', pct: 72 },
  { key: 'menopause', label: 'Menopause', age: 51, color: '#AB47BC', pct: 85 },
  { key: 'retirement_age', label: 'Retirement', age: 65, color: '#457B9D', pct: 95 },
]

// Labels alternate: below, above, below, above...
const LABEL_ABOVE = [false, true, false, true, false, true, false, true]

const COUNTRY_COLORS = {
  SWE: '#2D6A4F', DNK: '#2D6A4F',
  ITA: '#457B9D', FRA: '#457B9D', DEU: '#457B9D', AUS: '#457B9D',
  JPN: '#E76F51', KOR: '#E76F51',
  USA: '#C2185B', BRA: '#C2185B', MEX: '#C2185B',
  IND: '#7B2D8E',
}

const COUNTRY_ORDER = ['SWE', 'ITA', 'FRA', 'DNK', 'DEU', 'KOR', 'JPN', 'AUS', 'USA', 'MEX', 'BRA', 'IND']

const MARKER_KEYS = ['menarche', 'education', 'leaving_home', 'cohabitation', 'first_home', 'marriage', 'first_baby', 'menopause', 'retirement_age']

const MARKER_LEGEND = [
  { color: '#C2185B', label: 'Puberty' },
  { color: '#2D6A4F', label: 'Education' },
  { color: '#2A9D8F', label: 'Leave Home' },
  { color: '#00897B', label: 'Cohabitation' },
  { color: '#48BFE3', label: 'First Home' },
  { color: '#E76F51', label: 'Marriage' },
  { color: '#E9C46A', label: 'First Child' },
  { color: '#AB47BC', label: 'Menopause' },
  { color: '#457B9D', label: 'Retirement' },
]

// Click-based sequence game config
const SEQUENCE_ITEMS = [
  { key: 'education', label: 'Education', color: '#2D6A4F' },
  { key: 'leaving_home', label: 'Leave Home', color: '#2A9D8F' },
  { key: 'cohabitation', label: 'Cohabitation', color: '#00897B' },
  { key: 'marriage', label: 'Marriage', color: '#E76F51' },
  { key: 'first_baby', label: 'First Child', color: '#E9C46A' },
  { key: 'first_home', label: 'First Home', color: '#48BFE3' },
  { key: 'retirement_age', label: 'Retirement', color: '#457B9D' },
]
const CORRECT_SEQUENCE = ['education', 'leaving_home', 'cohabitation', 'first_baby', 'first_home', 'marriage', 'retirement_age']

function getCountryMarkers(code) {
  const profile = countryProfiles.find(c => c.country === code)
  if (!profile) return []
  const ms = profile.milestones
  const result = []
  for (const k of MARKER_KEYS) {
    const val = ms[k]?.value
    if (val != null) {
      const globalM = MARKERS_GLOBAL.find(m => m.key === k)
      result.push({ key: k, age: val, color: globalM?.color || '#999', label: globalM?.label || k })
    }
  }
  return result.sort((a, b) => a.age - b.age)
}

function getLifeExpectancy(code) {
  const profile = countryProfiles.find(c => c.country === code)
  return profile?.outcomes?.life_expectancy?.value || 75
}

function hasBabyBeforeMarriage(code) {
  const ms = getCountryMarkers(code)
  const baby = ms.find(m => m.key === 'first_baby')
  const marriage = ms.find(m => m.key === 'marriage')
  return baby && marriage && baby.age < marriage.age
}

function ageToRacePct(age) {
  return ((age - 12) / (85 - 12)) * 100
}

const FACTS = [
  "In Sweden, people leave home, finish school, move in together, buy a house, and have a baby, all before getting married at 35.",
  "Korea's fertility rate fell from 5.99 to 0.72, the steepest collapse ever recorded.",
  "One number correlates at r=0.78 with a country's wealth: the age women marry.",
  "American women spend 15 years in poor health, worst among wealthy nations.",
  "93% of Swedish women's extra years of life are spent in poor health.",
]

// === MAIN COMPONENT ===
export default function Hero() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [factIdx, setFactIdx] = useState(0)
  const [showMetrics, setShowMetrics] = useState(false)
  // Phase 3: click-based sequencing game
  const [selectedOrder, setSelectedOrder] = useState([])
  const [sequenceRevealed, setSequenceRevealed] = useState(false)

  useEffect(() => {
    function onScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionH = sectionRef.current.offsetHeight - window.innerHeight
      const p = Math.max(0, Math.min(1, -rect.top / sectionH))
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setFactIdx(i => (i + 1) % FACTS.length), 10000)
    return () => clearInterval(t)
  }, [])

  // Phase boundaries (tuned for 700vh, 6 phases now)
  const phase = progress < 0.10 ? 1 : progress < 0.30 ? 2 : progress < 0.42 ? 3 : progress < 0.55 ? 4 : progress < 0.80 ? 5 : 6
  const phaseProgress = phase === 1 ? progress / 0.10
    : phase === 2 ? (progress - 0.10) / 0.20
    : phase === 3 ? (progress - 0.30) / 0.12
    : phase === 4 ? (progress - 0.42) / 0.13
    : phase === 5 ? (progress - 0.55) / 0.25
    : (progress - 0.80) / 0.20

  // Background color
  const bgColor = phase === 1 ? '#264653' : phase === 5 ? '#1a2332' : '#FAFAF8'

  // Phase 2: markers visible
  const markersVisible = phase >= 2 ? Math.min(MARKERS_GLOBAL.length, Math.floor(phaseProgress * (MARKERS_GLOBAL.length + 1))) : 0
  const showPhase2Text = phase === 2 && phaseProgress > 0.9

  // Phase 4: countries visible (ensure all 12 show quickly)
  const countriesVisible = phase >= 4 ? Math.min(12, Math.floor(phaseProgress * 24)) : 0

  // Phase 5: race progress
  const raceProgress = phase >= 5 ? Math.min(1, phaseProgress) : 0

  return (
    <section id="hero" ref={sectionRef} style={{ height: '800vh' }}>
      <div className="sticky top-12 h-[calc(100vh-48px)] overflow-hidden flex items-center justify-center transition-colors duration-700"
        style={{ backgroundColor: bgColor }}>

        {/* === PHASE 1: TITLE SCREEN === */}
        {phase === 1 && (
          <div className="relative w-full h-full flex items-center justify-center px-6 md:px-12">
            {/* Background image - world at night */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80&auto=format"
                alt=""
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0" style={{ backgroundColor: '#264653', opacity: 0.88 }}/>
            </div>

            {/* Two-column layout */}
            <div className="relative z-10 max-w-[1200px] w-full flex flex-col md:flex-row items-center gap-8 md:gap-16">
              {/* Left: text content - no box */}
              <div className="flex-1">
                <h1 className="font-display text-[56px] md:text-[80px] font-bold text-white mb-3 text-left">Life Markers</h1>
                <p className="font-display text-[30px] md:text-[48px] font-light text-white/80 mb-6 text-left">How the World Grows Up</p>
                <motion.p className="font-body text-[18px] md:text-[20px] text-white/70 mb-4 max-w-[540px] leading-relaxed text-left"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}>
                  Have you ever wondered how culture shapes when people leave home, marry, or have children, and how those timing differences correlate with a country's wealth, health, and happiness?
                </motion.p>
                <motion.p className="font-body text-[14px] text-white/50 mb-8 max-w-[540px] text-left"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.6 }}>
                  11 life markers. 9 outcome metrics. 12 countries from Nordic to South Asian. The patterns will surprise you.
                </motion.p>
                <motion.button
                  onClick={() => setShowMetrics(true)}
                  className="px-6 py-3 rounded-lg bg-white/15 border border-white/30 text-white font-body text-[16px] font-semibold cursor-pointer hover:bg-white/25 transition-all text-left"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.6 }}>
                  See what we track
                </motion.button>
              </div>

              {/* Right: ISOTYPE figures - larger */}
              <motion.div className="flex flex-wrap items-end justify-center gap-6 md:gap-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
                {[
                  { label: 'Student', age: 22, color: '#2D6A4F' },
                  { label: 'Couple', age: 27, color: '#00897B' },
                  { label: 'Married', age: 29, color: '#E76F51' },
                  { label: 'Parent', age: 30, color: '#E9C46A' },
                  { label: 'Homeowner', age: 33, color: '#48BFE3' },
                  { label: 'Retiree', age: 65, color: '#457B9D' },
                ].map((fig, i) => (
                  <motion.div key={fig.label} className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2 + i * 0.25, duration: 0.5 }}>
                    <svg width="64" height="96" viewBox="0 0 48 72" fill="none">
                      {fig.label === 'Student' && (
                        <>
                          <circle cx="24" cy="12" r="10" fill={fig.color}/>
                          <rect x="14" y="24" width="20" height="28" rx="5" fill={fig.color}/>
                          <rect x="15" y="54" width="8" height="18" rx="4" fill={fig.color}/>
                          <rect x="25" y="54" width="8" height="18" rx="4" fill={fig.color}/>
                          <rect x="12" y="4" width="24" height="5" rx="2.5" fill="white" opacity="0.8"/>
                          <rect x="20" y="0" width="8" height="5" rx="2" fill="white" opacity="0.8"/>
                        </>
                      )}
                      {fig.label === 'Couple' && (
                        <>
                          <circle cx="17" cy="12" r="9" fill={fig.color}/>
                          <rect x="9" y="23" width="16" height="26" rx="5" fill={fig.color}/>
                          <rect x="10" y="51" width="7" height="16" rx="3.5" fill={fig.color}/>
                          <rect x="18" y="51" width="7" height="16" rx="3.5" fill={fig.color}/>
                          <circle cx="35" cy="14" r="8" fill={fig.color} opacity="0.65"/>
                          <rect x="28" y="24" width="14" height="24" rx="4" fill={fig.color} opacity="0.65"/>
                          <rect x="29" y="50" width="6" height="14" rx="3" fill={fig.color} opacity="0.55"/>
                          <rect x="35" y="50" width="6" height="14" rx="3" fill={fig.color} opacity="0.55"/>
                        </>
                      )}
                      {fig.label === 'Married' && (
                        <>
                          <circle cx="17" cy="12" r="9" fill={fig.color}/>
                          <rect x="9" y="23" width="16" height="26" rx="5" fill={fig.color}/>
                          <rect x="10" y="51" width="7" height="16" rx="3.5" fill={fig.color}/>
                          <rect x="18" y="51" width="7" height="16" rx="3.5" fill={fig.color}/>
                          <circle cx="35" cy="14" r="8" fill={fig.color} opacity="0.7"/>
                          <rect x="28" y="24" width="14" height="24" rx="4" fill={fig.color} opacity="0.7"/>
                          <rect x="29" y="50" width="6" height="14" rx="3" fill={fig.color} opacity="0.6"/>
                          <rect x="35" y="50" width="6" height="14" rx="3" fill={fig.color} opacity="0.6"/>
                          <circle cx="26" cy="5" r="5" fill="none" stroke="white" strokeWidth="2"/>
                          <circle cx="26" cy="1" r="2" fill="white"/>
                        </>
                      )}
                      {fig.label === 'Parent' && (
                        <>
                          <circle cx="17" cy="12" r="9" fill={fig.color}/>
                          <rect x="9" y="23" width="16" height="26" rx="5" fill={fig.color}/>
                          <rect x="10" y="51" width="7" height="16" rx="3.5" fill={fig.color}/>
                          <rect x="18" y="51" width="7" height="16" rx="3.5" fill={fig.color}/>
                          <circle cx="35" cy="14" r="8" fill={fig.color} opacity="0.7"/>
                          <rect x="28" y="24" width="14" height="24" rx="4" fill={fig.color} opacity="0.7"/>
                          <rect x="29" y="50" width="6" height="14" rx="3" fill={fig.color} opacity="0.6"/>
                          <rect x="35" y="50" width="6" height="14" rx="3" fill={fig.color} opacity="0.6"/>
                          <circle cx="26" cy="42" r="6" fill="white" opacity="0.85"/>
                          <circle cx="26" cy="36" r="4" fill="white" opacity="0.85"/>
                        </>
                      )}
                      {fig.label === 'Homeowner' && (
                        <>
                          <circle cx="28" cy="12" r="10" fill={fig.color}/>
                          <rect x="18" y="24" width="20" height="28" rx="5" fill={fig.color}/>
                          <rect x="19" y="54" width="8" height="18" rx="4" fill={fig.color}/>
                          <rect x="29" y="54" width="8" height="18" rx="4" fill={fig.color}/>
                          <polygon points="2,50 12,38 22,50" fill="white" opacity="0.7"/>
                          <rect x="4" y="50" width="16" height="14" rx="2" fill="white" opacity="0.6"/>
                          <rect x="9" y="54" width="6" height="8" rx="1" fill={fig.color} opacity="0.4"/>
                        </>
                      )}
                      {fig.label === 'Retiree' && (
                        <>
                          <circle cx="22" cy="12" r="10" fill={fig.color}/>
                          <rect x="14" y="24" width="18" height="26" rx="5" fill={fig.color}/>
                          <rect x="14" y="52" width="8" height="18" rx="4" fill={fig.color}/>
                          <rect x="24" y="52" width="8" height="18" rx="4" fill={fig.color}/>
                          <rect x="36" y="22" width="4" height="48" rx="2" fill="white" opacity="0.6"/>
                          <circle cx="38" cy="20" r="4" fill="white" opacity="0.5"/>
                        </>
                      )}
                    </svg>
                    <span className="text-[12px] font-body text-white/70 mt-2">{fig.label}</span>
                    <span className="text-[15px] font-data font-bold" style={{ color: fig.color }}>{fig.age}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Scroll arrow */}
            <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 z-10"
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </motion.div>

            {/* Metrics modal */}
            <AnimatePresence>
              {showMetrics && (
                <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMetrics(false)}/>
                  <motion.div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-10 max-w-[700px] max-h-[80vh] overflow-auto mx-4"
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-[24px] text-[#264653]">What We Track</h3>
                      <button onClick={() => setShowMetrics(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[#475569] cursor-pointer hover:bg-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2L2 12"/></svg>
                      </button>
                    </div>

                    <p className="text-[13px] font-body font-bold uppercase text-[#475569] tracking-wider border-b border-[#e5e7eb] pb-2 mb-4">Input Metrics (Life Markers)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {[
                        { name: 'Puberty (Menarche)', color: '#C2185B', desc: 'Age of first menstruation' },
                        { name: 'Education Completion', color: '#2D6A4F', desc: 'Age formal education ends' },
                        { name: 'Leaving Home', color: '#2A9D8F', desc: 'Age of leaving parental home' },
                        { name: 'Cohabitation', color: '#00897B', desc: 'First time living with a partner' },
                        { name: 'First Home Purchase', color: '#48BFE3', desc: 'Age of buying first property' },
                        { name: 'Marriage (Female)', color: '#E76F51', desc: 'Average age women first marry' },
                        { name: 'First Child', color: '#E9C46A', desc: 'Average age at first birth' },
                        { name: 'Menopause', color: '#AB47BC', desc: 'Average age of menopause onset' },
                        { name: 'Retirement', color: '#457B9D', desc: 'Effective retirement age' },
                        { name: 'Fertility Rate', color: '#264653', desc: 'Children per woman (TFR)' },
                        { name: 'HALE (Healthy Years)', color: '#7B2D8E', desc: 'Years lived in good health' },
                      ].map(m => (
                        <div key={m.name} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: m.color }}/>
                          <div>
                            <p className="text-[14px] font-body font-semibold text-[#264653]">{m.name}</p>
                            <p className="text-[13px] font-body text-[#475569]">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[13px] font-body font-bold uppercase text-[#475569] tracking-wider border-b border-[#e5e7eb] pb-2 mb-4">Output Metrics (Life Outcomes)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {[
                        { name: 'GDP per Capita', color: '#457B9D', desc: 'Economic output per person (PPP)' },
                        { name: 'Life Expectancy', color: '#457B9D', desc: 'Average lifespan at birth' },
                        { name: 'Happiness Score', color: '#457B9D', desc: 'Gallup life satisfaction (0-10)' },
                        { name: 'Female LFPR', color: '#457B9D', desc: 'Women in the workforce (%)' },
                        { name: 'Gender Inequality', color: '#457B9D', desc: 'UNDP GII (0 = equal)' },
                        { name: 'Adolescent Fertility', color: '#457B9D', desc: 'Teen births per 1000 women' },
                        { name: 'Maternal Mortality', color: '#457B9D', desc: 'Deaths per 100k live births' },
                      ].map(m => (
                        <div key={m.name} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: m.color }}/>
                          <div>
                            <p className="text-[14px] font-body font-semibold text-[#264653]">{m.name}</p>
                            <p className="text-[13px] font-body text-[#475569]">{m.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[13px] font-body font-bold uppercase text-[#475569] tracking-wider border-b border-[#e5e7eb] pb-2 mb-4">12 Countries Included</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['Sweden','Italy','France','Denmark','Germany','S. Korea','Japan','Australia','USA','Brazil','Mexico','India'].map(c => (
                        <span key={c} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[14px] font-body text-[#264653]">{c}</span>
                      ))}
                    </div>

                    <p className="text-[13px] font-body text-[#64748b] text-center">Data from OECD, World Bank, WHO, Our World in Data, Eurostat</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* === PHASE 2: LIFE STAGES TIMELINE === */}
        {phase === 2 && (
          <div className="w-full max-w-[1000px] px-4 mx-auto">
            <p className="font-display text-[24px] md:text-[28px] text-[#264653] text-center mb-2">
              The life most people imagine:
            </p>
            <p className="font-body text-[15px] text-[#475569] text-center mb-10">
              Each number is the age at which this marker typically happens
            </p>
            <div className="relative overflow-x-auto">
              <svg viewBox="0 0 800 300" className="w-full max-w-[800px] mx-auto" style={{ minWidth: '600px', height: '300px' }}>
                {/* Base track at vertical center (y=150) */}
                <rect x="20" y="147" width="760" height="6" rx="3" fill="#e5e7eb"/>

                {MARKERS_GLOBAL.map((m, i) => {
                  if (i >= markersVisible) return null
                  const xPos = 20 + (m.pct / 100) * 760
                  const prevX = i > 0 ? 20 + (MARKERS_GLOBAL[i-1].pct / 100) * 760 : 20
                  const isAbove = LABEL_ABOVE[i]

                  return (
                    <g key={m.key}>
                      {/* Track fill from previous to this */}
                      <rect x={prevX} y="147" width={xPos - prevX} height="6" rx="3" fill={m.color} opacity="0.6"/>
                      {/* Glow circle (60px = r30) */}
                      <circle cx={xPos} cy="150" r="30" fill={m.color} opacity="0.15"/>
                      {/* Main dot (40px = r20) */}
                      <circle cx={xPos} cy="150" r="20" fill={m.color}/>
                      {/* Vertical connector line + label */}
                      {isAbove ? (
                        <>
                          <line x1={xPos} y1="130" x2={xPos} y2="80" stroke={m.color} strokeWidth="2" opacity="0.6"/>
                          <text x={xPos} y="68" textAnchor="middle" fill="#264653" fontSize="14" fontFamily="Inter" fontWeight="600">{m.label}</text>
                          <text x={xPos} y="50" textAnchor="middle" fill={m.key === 'first_baby' ? '#B8960F' : m.color} fontSize="20" fontFamily="Inter" fontWeight="700">{m.age}</text>
                        </>
                      ) : (
                        <>
                          <line x1={xPos} y1="170" x2={xPos} y2="220" stroke={m.color} strokeWidth="2" opacity="0.6"/>
                          <text x={xPos} y="238" textAnchor="middle" fill="#264653" fontSize="14" fontFamily="Inter" fontWeight="600">{m.label}</text>
                          <text x={xPos} y="258" textAnchor="middle" fill={m.key === 'first_baby' ? '#B8960F' : m.color} fontSize="20" fontFamily="Inter" fontWeight="700">{m.age}</text>
                        </>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Explanation line */}
            {markersVisible >= MARKERS_GLOBAL.length && (
              <p className="text-center text-[14px] font-body text-[#94a3b8] mt-4">
                Average ages across 12 countries. From puberty at 13 to retirement at 65.
              </p>
            )}

            {showPhase2Text && (
              <motion.div className="text-center mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <p className="font-body text-[18px] md:text-[20px] text-[#264653]/80 mb-2">
                  Education, job, home, marriage, children, retirement.
                </p>
                <p className="font-body text-[18px] md:text-[20px] text-[#264653] font-bold">
                  This sequence feels universal. But it's not.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* === PHASE 3: CLICK SEQUENCE GAME === */}
        {phase === 3 && (
          <div className="w-full max-w-[800px] px-4 mx-auto text-center">
            <p className="font-display text-[28px] md:text-[36px] text-[#264653] mb-2">The Sequence Is Broken</p>
            <p className="font-body text-[16px] text-[#475569] mb-2">Most people assume life follows a set order.</p>
            {!sequenceRevealed && (
              <p className="font-body text-[15px] font-semibold text-[#E76F51] mb-8">Click markers in the order you think is correct.</p>
            )}

            {!sequenceRevealed && (
              <>
                {/* Available pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {SEQUENCE_ITEMS.map(m => {
                    const used = selectedOrder.includes(m.key)
                    return (
                      <button key={m.key}
                        onClick={() => !used && setSelectedOrder(prev => [...prev, m.key])}
                        className={`h-10 px-5 rounded-lg text-[14px] font-body font-bold text-white transition-all cursor-pointer
                          ${used ? 'opacity-25 cursor-default' : 'hover:scale-105'}`}
                        style={{ backgroundColor: m.color }}>
                        {m.label}
                      </button>
                    )
                  })}
                </div>

                {/* Selected sequence */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[48px]">
                  {selectedOrder.map((key, i) => {
                    const m = SEQUENCE_ITEMS.find(s => s.key === key)
                    return (
                      <div key={key} className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-full bg-[#264653] text-white text-[11px] font-data flex items-center justify-center">{i+1}</span>
                        <span className="px-3 py-1.5 rounded-md text-[13px] font-body font-semibold text-white" style={{ backgroundColor: m.color }}>{m.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Undo + Reveal buttons */}
                <div className="flex justify-center gap-3">
                  {selectedOrder.length > 0 && (
                    <button onClick={() => setSelectedOrder(prev => prev.slice(0, -1))}
                      className="px-4 py-2 rounded-lg text-[14px] font-body border border-[#cbd5e1] text-[#475569] cursor-pointer hover:bg-gray-100 transition-all">
                      Undo
                    </button>
                  )}
                  {selectedOrder.length === 7 && (
                    <button onClick={() => setSequenceRevealed(true)}
                      className="px-6 py-2 rounded-lg text-[14px] font-body font-semibold bg-[#264653] text-white cursor-pointer hover:opacity-90 transition-all">
                      Reveal reality
                    </button>
                  )}
                </div>
              </>
            )}

            {sequenceRevealed && (
              <div>
                <p className="text-[18px] font-body font-bold text-[#264653] mb-6">
                  {selectedOrder.filter((k, i) => k === CORRECT_SEQUENCE[i]).length} of 7 in the correct position
                </p>

                {/* Side-by-side comparison table */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-y-3 gap-x-2 items-center mb-8 max-w-[750px] mx-auto">
                  {/* Header row */}
                  <span className="text-[11px] font-body text-[#94a3b8]"></span>
                  {[1,2,3,4,5,6,7].map(n => (
                    <span key={n} className="text-[13px] font-data font-bold text-[#264653] text-center">{n}</span>
                  ))}

                  {/* Your row */}
                  <span className="text-[11px] font-body font-semibold text-[#475569] text-right pr-2">Yours</span>
                  {selectedOrder.map((key, i) => {
                    const m = SEQUENCE_ITEMS.find(s => s.key === key)
                    const correct = key === CORRECT_SEQUENCE[i]
                    return (
                      <div key={`yours-${i}`} className={`px-2 py-1.5 rounded-md text-[11px] font-body font-bold text-white text-center border-2 ${correct ? 'border-green-500' : 'border-red-400'}`}
                        style={{ backgroundColor: m.color }}>
                        {m.label}
                      </div>
                    )
                  })}

                  {/* Actual row */}
                  <span className="text-[11px] font-body font-semibold text-[#475569] text-right pr-2">Actual</span>
                  {CORRECT_SEQUENCE.map((key, i) => {
                    const m = SEQUENCE_ITEMS.find(s => s.key === key)
                    return (
                      <div key={`actual-${i}`} className="px-2 py-1.5 rounded-md text-[11px] font-body font-bold text-white text-center"
                        style={{ backgroundColor: m.color }}>
                        {m.label}
                      </div>
                    )
                  })}

                  {/* Match indicators */}
                  <span className="text-[11px] font-body text-[#94a3b8] text-right pr-2"></span>
                  {selectedOrder.map((key, i) => (
                    <div key={`match-${i}`} className="text-center text-[14px]">
                      {key === CORRECT_SEQUENCE[i] ? '✓' : '✗'}
                    </div>
                  ))}
                </div>

                <p className="text-[16px] font-body font-bold text-[#E76F51]">In 6 of 12 countries, baby comes before marriage.</p>
                <p className="text-[14px] font-body text-[#475569] mt-1">Keep scrolling to see every country's actual sequence ↓</p>
              </div>
            )}
          </div>
        )}

        {/* === PHASE 4: SEQUENCE BREAKS (DOT CHART) === */}
        {phase === 4 && (
          <div className="w-full max-w-[1050px] px-4 mx-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
            <p className="font-display text-[22px] md:text-[26px] text-[#264653] text-center mb-2">When each milestone actually happens</p>
            <p className="font-body text-[14px] text-[#475569] text-center mb-6">Each icon is a milestone, positioned by the age it occurs in that country</p>

            {/* Two-column: chart left, legend right */}
            <div className="flex gap-6">
              {/* Left: the chart */}
              <div className="flex-1 min-w-0">
                <div>
                  {COUNTRY_ORDER.map((code, idx) => {
                    if (idx >= countriesVisible) return null
                    const milestones = getCountryMarkers(code)
                    const profile = countryProfiles.find(c => c.country === code)
                    const countryName = profile?.name || code

                    return (
                      <motion.div key={code}
                        className="flex items-center gap-4 border-b border-[#e5e7eb]"
                        style={{ height: '56px' }}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}>
                        <div className="w-[90px] shrink-0 text-right pr-2">
                          <span className="text-[15px] font-body font-bold text-[#1a2a32]">{countryName}</span>
                        </div>
                        <svg viewBox="0 0 600 40" className="flex-1 h-10" style={{ minWidth: '280px' }}>
                          <rect x="0" y="19" width="600" height="2" rx="1" fill="#d1d5db"/>
                          {milestones.map(m => {
                            const xPos = ((m.age - 12) / (70 - 12)) * 600
                            return <circle key={m.key} cx={xPos} cy="20" r="9" fill={m.color}/>
                          })}
                        </svg>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Age axis */}
                <div className="flex justify-between mt-3 ml-[100px] text-[13px] font-body font-medium text-[#1e293b]">
                  {[12, 20, 25, 30, 35, 40, 50, 60, 70].map(a => <span key={a}>{a}</span>)}
                </div>
              </div>

              {/* Right: Legend panel */}
              <div className="w-[190px] shrink-0 bg-white rounded-xl border border-gray-200 p-5 self-start sticky top-[80px]">
                <p className="text-[13px] font-body font-bold uppercase text-[#1e293b] tracking-wider mb-4">Legend</p>
                <div className="space-y-3.5">
                  {[
                    { color: '#C2185B', label: 'Puberty' },
                    { color: '#2D6A4F', label: 'Education' },
                    { color: '#2A9D8F', label: 'Leave Home' },
                    { color: '#00897B', label: 'Cohabitation' },
                    { color: '#48BFE3', label: 'First Home' },
                    { color: '#E76F51', label: 'Marriage' },
                    { color: '#E9C46A', label: 'First Child' },
                    { color: '#AB47BC', label: 'Menopause' },
                    { color: '#457B9D', label: 'Retirement' },
                  ].map(i => (
                    <div key={i.label} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: i.color }}/>
                      <span className="text-[14px] font-body font-bold text-[#1a2a32]">{i.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-3 border-t border-gray-200">
                  <p className="text-[13px] font-body text-[#1e293b]">X-axis: age (12 to 70)</p>
                  <p className="text-[13px] font-body text-[#1e293b] mt-1">Each row: one country</p>
                </div>
              </div>
            </div>

            {/* Annotation */}
            {countriesVisible >= 12 && (
              <motion.div className="text-center mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="font-body text-[20px] font-bold text-[#264653]">
                  In half the countries studied, the assumed life sequence does not hold.
                </p>
                <p className="font-body text-[18px] text-[#475569] mt-1">
                  No two countries follow the same path.
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* === PHASE 5: THE RACE === */}
        {phase === 5 && (() => {
          // Determine current milestone being passed (for left label)
          const avgAge = 12 + (80 - 12) * raceProgress
          const currentMilestoneLabel = avgAge < 15 ? 'Puberty' : avgAge < 23 ? 'Education' : avgAge < 26 ? 'Leave Home' : avgAge < 28 ? 'Cohabitation' : avgAge < 31 ? 'Marriage' : avgAge < 34 ? 'First Home' : avgAge < 52 ? 'Menopause' : avgAge < 66 ? 'Retirement' : 'Life Expectancy'
          const currentMilestoneColor = avgAge < 15 ? '#C2185B' : avgAge < 23 ? '#2D6A4F' : avgAge < 26 ? '#2A9D8F' : avgAge < 28 ? '#00897B' : avgAge < 31 ? '#E76F51' : avgAge < 34 ? '#48BFE3' : avgAge < 52 ? '#AB47BC' : avgAge < 66 ? '#457B9D' : '#264653'

          return (
          <div className="w-full max-w-[1100px] px-4 mx-auto relative">
            <p className="font-display text-[28px] md:text-[32px] text-white text-center mb-1">The divergence</p>
            <p className="font-body text-[15px] md:text-[16px] text-white/70 text-center mb-6">
              Same starting line. Watch 12 countries pull apart.
            </p>

            <div className="flex gap-4 justify-center">
              {/* Left: current milestone indicator */}
              <div className="w-[100px] shrink-0 flex flex-col items-center justify-center">
                {raceProgress < 0.95 && (
                  <motion.div className="text-center" key={currentMilestoneLabel}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="w-5 h-5 rounded-full mx-auto mb-2" style={{ backgroundColor: currentMilestoneColor }}/>
                    <p className="text-[14px] font-body font-bold text-white">{currentMilestoneLabel}</p>
                    <p className="text-[12px] font-body text-white/60">age ~{Math.round(avgAge)}</p>
                  </motion.div>
                )}
              </div>

              {/* Center: the race chart */}
              <div className="flex-1 min-w-0 relative">
                <div className="space-y-1 relative z-10">
                  {COUNTRY_ORDER.map((code, rowIdx) => {
                    const lifeExp = getLifeExpectancy(code)
                    const milestones = getCountryMarkers(code)
                    const dotColor = COUNTRY_COLORS[code]
                    const currentAge = 12 + (lifeExp - 12) * raceProgress
                    const dotPct = ageToRacePct(currentAge)
                    const displayAge = raceProgress > 0.95 ? Math.round(lifeExp) : Math.round(currentAge)
                    const shortNames = { SWE:'Sweden', ITA:'Italy', FRA:'France', DNK:'Denmark', DEU:'Germany', KOR:'S.Korea', JPN:'Japan', AUS:'Australia', USA:'USA', BRA:'Brazil', MEX:'Mexico', IND:'India' }

                    return (
                      <div key={code} className="flex items-center h-7">
                        <span className="w-[70px] text-right pr-2 text-[13px] font-body font-bold text-white shrink-0">{shortNames[code]}</span>
                        <div className="flex-1 relative h-full">
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20"/>
                          {milestones.map(m => {
                            const pipPct = ageToRacePct(m.age)
                            if (currentAge < m.age) return null
                            return (
                              <div key={m.key}
                                className="absolute top-1/2 -translate-y-1/2 rounded-full"
                                style={{ left: `${pipPct}%`, width: '7px', height: '7px', backgroundColor: m.color, opacity: 0.85 }}/>
                            )
                          })}
                          <div className="absolute top-1/2 -translate-y-1/2 rounded-full shadow-sm transition-all duration-150"
                            style={{ left: `${Math.min(96, dotPct)}%`, width: '14px', height: '14px', backgroundColor: dotColor }}/>
                          <span className="absolute top-1/2 -translate-y-1/2 text-[14px] font-data font-bold text-white"
                            style={{ left: `${Math.min(96, dotPct) + 2.5}%` }}>
                            {displayAge}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Age axis with milestone labels below - lines connect to labels */}
                <div className="ml-[70px] mt-3 relative">
                  <div className="flex justify-between text-[12px] font-body text-white/60">
                    {[12, 20, 30, 40, 50, 60, 70, 80, 85].map(a => <span key={a}>{a}</span>)}
                  </div>
                  {/* Milestone names with connecting lines from chart */}
                  <div className="relative h-10 mt-1">
                    {[
                      { age: 22, label: 'Education', color: '#2D6A4F' },
                      { age: 30, label: 'Marriage', color: '#E76F51' },
                      { age: 50, label: 'Menopause', color: '#AB47BC' },
                      { age: 65, label: 'Retirement', color: '#457B9D' },
                    ].map(m => (
                      <div key={m.age} className="absolute flex flex-col items-center -translate-x-1/2"
                        style={{ left: `${ageToRacePct(m.age)}%` }}>
                        <div className="w-0.5 h-4 rounded" style={{ backgroundColor: `${m.color}60` }}/>
                        <span className="text-[12px] font-body font-bold mt-0.5 whitespace-nowrap" style={{ color: m.color }}>
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestone reference lines (vertical dashed) through the chart */}
                <div className="ml-[70px] absolute top-0 left-0 right-0 pointer-events-none" style={{ height: `${12 * 28}px` }}>
                  {[
                    { age: 22, color: '#2D6A4F' },
                    { age: 30, color: '#E76F51' },
                    { age: 50, color: '#AB47BC' },
                    { age: 65, color: '#457B9D' },
                  ].map(m => (
                    <div key={m.age} className="absolute top-0 h-full" style={{ left: `${ageToRacePct(m.age)}%` }}>
                      <div className="w-px h-full border-l-2 border-dashed" style={{ borderColor: `${m.color}30` }}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: scroll indicator */}
              <div className="w-[60px] shrink-0 flex flex-col items-center justify-end pb-4">
                {raceProgress < 0.9 && (
                  <motion.div className="text-center text-white/50"
                    animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                    <p className="text-[11px] font-body">Scroll</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* "12 years apart" annotation */}
            {raceProgress > 0.95 && (
              <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-center items-center gap-3 mb-6">
                  <span className="text-[13px] font-body text-white/60">SWE 84</span>
                  <svg width="20" height="50" viewBox="0 0 20 50">
                    <line x1="10" y1="0" x2="10" y2="50" stroke="white" strokeWidth="2"/>
                    <line x1="4" y1="0" x2="16" y2="0" stroke="white" strokeWidth="2"/>
                    <line x1="4" y1="50" x2="16" y2="50" stroke="white" strokeWidth="2"/>
                  </svg>
                  <span className="text-[20px] font-body font-bold text-white">12 years apart</span>
                  <svg width="20" height="50" viewBox="0 0 20 50">
                    <line x1="10" y1="0" x2="10" y2="50" stroke="white" strokeWidth="2"/>
                    <line x1="4" y1="0" x2="16" y2="0" stroke="white" strokeWidth="2"/>
                    <line x1="4" y1="50" x2="16" y2="50" stroke="white" strokeWidth="2"/>
                  </svg>
                  <span className="text-[13px] font-body text-white/60">IND 72</span>
                </div>
                <p className="font-display text-[24px] text-white text-center">
                  Same starting line. Twelve years apart at the finish.
                </p>
                <p className="font-body text-[16px] text-white/70 text-center mt-2">
                  But the years between tell very different stories.
                </p>
                <p className="font-body text-[16px] text-[#94a3b8] text-center mt-3">
                  Validated across 44 countries worldwide.
                </p>
              </motion.div>
            )}
          </div>
          )
        })()}

        {/* === PHASE 6: ROTATING FACTS === */}
        {phase === 6 && (
          <>
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover"/>
              <div className="absolute inset-0" style={{ backgroundColor: '#FAFAF8', opacity: 0.9 }}/>
            </div>
            <div className="text-center max-w-[700px] px-4 mx-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.p key={factIdx}
                className="font-display text-[22px] md:text-[26px] text-[#264653] leading-relaxed min-h-[100px]"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
                {FACTS[factIdx]}
              </motion.p>
            </AnimatePresence>
            <motion.div className="mt-10 text-[#264653]/60"
              animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <p className="text-[16px] font-body mb-2">Scroll to explore the data</p>
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </motion.div>
          </div>
          </>
        )}

        {/* Persistent scroll progress dots + skip button */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-50">
          {[1,2,3,4,5,6].map(p => {
            const isDarkBg = phase === 1 || phase === 5
            const activeColor = isDarkBg ? 'bg-white' : 'bg-[#264653]'
            const inactiveColor = isDarkBg ? 'bg-white/30' : 'bg-[#264653]/25'
            return (
              <div key={p} className={`w-2 h-2 rounded-full transition-all duration-300 ${phase === p ? `${activeColor} scale-125` : inactiveColor}`}/>
            )
          })}
        </div>
        {phase < 6 && (
          <button
            onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
            className={`absolute bottom-6 right-6 z-50 px-4 py-2 rounded-lg text-[13px] font-body font-semibold cursor-pointer transition-all ${
              phase === 1 || phase === 5
                ? 'bg-white/15 border border-white/30 text-white/70 hover:bg-white/25 hover:text-white'
                : 'bg-[#264653]/10 border border-[#264653]/30 text-[#264653]/70 hover:bg-[#264653]/20 hover:text-[#264653]'
            }`}>
            Skip intro ↓
          </button>
        )}
      </div>
    </section>
  )
}


