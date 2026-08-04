import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import globalMetrics from '../../data/global_metrics.json'

const COUNTRIES = [
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪', menarche: 13.1, education: 25.0, marriage: 34.8, retirement: 65.1, lifeExp: 84.1 },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹', menarche: 12.5, education: 22.7, marriage: 33.6, retirement: 64.0, lifeExp: 84.0 },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵', menarche: 12.5, education: 21.5, marriage: 29.4, retirement: 66.9, lifeExp: 84.0 },
  { code: 'KOR', name: 'S. Korea', flag: '🇰🇷', menarche: 13.9, education: 22.6, marriage: 30.8, retirement: 67.4, lifeExp: 83.6 },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', menarche: 13.0, education: 26.6, marriage: 29.2, retirement: 64.9, lifeExp: 83.1 },
  { code: 'FRA', name: 'France', flag: '🇫🇷', menarche: 13.1, education: 22.1, marriage: 33.1, retirement: 61.9, lifeExp: 83.0 },
  { code: 'DNK', name: 'Denmark', flag: '🇩🇰', menarche: 13.0, education: 24.7, marriage: 33.0, retirement: 66.3, lifeExp: 82.3 },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪', menarche: 12.8, education: 23.3, marriage: 31.2, retirement: 64.2, lifeExp: 80.8 },
  { code: 'USA', name: 'USA', flag: '🇺🇸', menarche: 12.8, education: 21.9, marriage: 28.6, retirement: 67.3, lifeExp: 78.9 },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', menarche: 12.4, education: 21.8, marriage: 23.9, retirement: 63.4, lifeExp: 76.0 },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', menarche: 12.4, education: 20.5, marriage: 27.5, retirement: 67.8, lifeExp: 75.3 },
  { code: 'IND', name: 'India', flag: '🇮🇳', menarche: 14.3, education: 18.9, marriage: 21.4, retirement: null, lifeExp: 72.2 },
]

const SUGGESTED_PAIRS = [
  { codes: ['SWE', 'IND'], tagline: 'Marriage age worlds apart', color: '#E76F51' },
  { codes: ['FRA', 'MEX'], tagline: 'Same lifespan, different retirement', color: '#457B9D' },
  { codes: ['JPN', 'IND'], tagline: 'Healthy years divide', color: '#7B2D8E' },
  { codes: ['ITA', 'BRA'], tagline: 'Living together, worlds apart', color: '#00897B' },
  { codes: ['KOR', 'FRA'], tagline: 'The squeeze vs the spread', color: '#E9C46A' },
  { codes: ['USA', 'JPN'], tagline: "Money can't buy health", color: '#264653' },
]

const MILESTONE_COLORS = ['#C2185B', '#2D6A4F', '#2A9D8F', '#00897B', '#48BFE3', '#E76F51', '#E9C46A', '#AB47BC', '#457B9D', '#7B2D8E', '#264653']

const STEPS = [
  { key: 'menarche', label: 'Puberty', color: '#C2185B', field: 'menarche' },
  { key: 'education', label: 'Education ends', color: '#2D6A4F', field: 'education' },
  { key: 'marriage', label: 'Marriage', color: '#E76F51', field: 'marriage' },
  { key: 'retirement', label: 'Retirement', color: '#457B9D', field: 'retirement' },
  { key: 'lifeExp', label: 'End of life', color: '#264653', field: 'lifeExp' },
]

const AGE_MIN = 12, AGE_MAX = 85
const AGE_TICKS = [12, 20, 30, 40, 50, 60, 70, 80, 85]
function ageToPercent(age) { return age === null ? null : ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100 }

// --- Animated gradient line (sits above navbar) ---
function GradientLine() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] overflow-hidden">
      <motion.div
        className="h-full w-[200%]"
        style={{ background: `linear-gradient(90deg, ${MILESTONE_COLORS.join(', ')}, ${MILESTONE_COLORS[0]})` }}
        animate={{ x: [0, '-50%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// --- Race Animation (dark bg, scroll-triggered) ---
function RaceAnimation() {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.4, once: true })
  const [currentStep, setCurrentStep] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (isInView && !started) {
      setStarted(true)
      ;[1500, 3500, 5500, 7500, 9000].forEach((t, i) => setTimeout(() => setCurrentStep(i + 1), t))
    }
  }, [isInView, started])

  const isFinalStep = currentStep >= 5
  const getDotPosition = (c) => {
    if (currentStep === 0) return ageToPercent(c.menarche)
    const s = STEPS[Math.min(currentStep - 1, 4)]
    return c[s.field] === null ? null : ageToPercent(c[s.field])
  }
  const getDotColor = () => currentStep === 0 ? STEPS[0].color : STEPS[Math.min(currentStep - 1, 4)].color
  const getLabel = () => currentStep === 0 ? STEPS[0].label : STEPS[Math.min(currentStep - 1, 4)].label

  return (
    <div ref={ref} className="w-full max-w-[1000px] mx-auto">
      <div className="h-10 flex items-center justify-center mb-3">
        <AnimatePresence mode="wait">
          {started && (
            <motion.h3 key={getLabel()} className="font-display text-lg md:text-2xl font-semibold text-white/90"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {getLabel()}
            </motion.h3>
          )}
        </AnimatePresence>
      </div>
      <div className="space-y-1 mb-3">
        {COUNTRIES.map((country) => {
          const pos = getDotPosition(country)
          const hidden = pos === null && currentStep > 0
          const startPct = ageToPercent(country.menarche)
          const endPct = ageToPercent(country.lifeExp)
          return (
            <div key={country.code} className="flex items-center h-5 md:h-6">
              <div className="w-14 md:w-20 flex-shrink-0 text-right pr-2">
                <span className="text-[9px] md:text-[10px] font-body text-white/60">{country.code}</span>
              </div>
              <div className="flex-1 relative h-full">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/8" />
                {isFinalStep && (
                  <motion.div className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
                    style={{ left: `${startPct}%`, backgroundColor: '#FAFAF8', opacity: 0.12 }}
                    initial={{ width: 0 }} animate={{ width: `${endPct - startPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }} />
                )}
                {!hidden && started && (
                  <motion.div className="absolute top-1/2 -translate-y-1/2"
                    initial={{ left: `${startPct}%` }} animate={{ left: `${pos ?? startPct}%` }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}>
                    <motion.div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      animate={{ backgroundColor: getDotColor(), scale: [1, 1.3, 1] }}
                      transition={{ backgroundColor: { duration: 0.3 }, scale: { duration: 0.5 } }}
                      key={`${country.code}-${currentStep}`} />
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="ml-14 md:ml-20 relative h-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/15" />
        {AGE_TICKS.map(age => (
          <div key={age} className="absolute top-0 flex flex-col items-center" style={{ left: `${ageToPercent(age)}%`, transform: 'translateX(-50%)' }}>
            <div className="w-px h-1.5 bg-white/15" />
            <span className="text-[8px] font-data text-white/40 mt-0.5">{age}</span>
          </div>
        ))}
      </div>
      {isFinalStep && (
        <motion.p className="text-center font-display text-base md:text-xl text-white/85 mt-8"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          Every life begins the same way. Culture, policy, and economics decide the rest.
        </motion.p>
      )}
      {isFinalStep && (
        <motion.button
          className="mt-4 text-xs font-body text-white/30 hover:text-white/60 cursor-pointer transition-colors self-end"
          onClick={() => { setCurrentStep(0); setStarted(false) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          ↻ Replay
        </motion.button>
      )}
    </div>
  )
}

// --- Discovery Card Components (proper hook usage) ---
function SequenceCard({ onNavigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  const babyFirst = ['SWE', 'ITA', 'FRA', 'DNK', 'DEU', 'USA']
  const marriageFirst = ['IND', 'MEX', 'BRA', 'JPN', 'KOR', 'AUS']
  return (
    <motion.div ref={ref} className="flex flex-col md:flex-row items-start gap-6 md:gap-10 py-10 border-t-2" style={{ borderColor: '#C2185B40' }}
      initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="md:w-[30%] flex-shrink-0">
        <p className="font-display text-6xl md:text-[80px] font-bold leading-none text-[#C2185B]">6 of 12</p>
      </div>
      <div className="md:w-[70%]">
        <div className="mb-4">
          <p className="text-[10px] font-data text-text-muted mb-2 uppercase tracking-wider">Baby before marriage</p>
          <div className="space-y-1">
            {babyFirst.map((code, i) => (
              <motion.div key={code} className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}>
                <span className="text-[9px] font-data text-text-muted w-8">{code}</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#E9C46A]" />
                  <div className="w-6 h-px bg-text-faint" />
                  <div className="w-3 h-3 rounded-full bg-[#E76F51]" />
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-[10px] font-data text-text-muted mb-2 mt-4 uppercase tracking-wider">Marriage before baby</p>
          <div className="space-y-1">
            {marriageFirst.map((code, i) => (
              <motion.div key={code} className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.3 }}>
                <span className="text-[9px] font-data text-text-muted w-8">{code}</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#E76F51]" />
                  <div className="w-6 h-px bg-text-faint" />
                  <div className="w-3 h-3 rounded-full bg-[#E9C46A]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="font-body text-sm md:text-base text-text-secondary leading-relaxed mb-2">
          Across cultures and continents, the "normal" life sequence is the minority.
        </p>
        <button onClick={() => onNavigate('reveals')} className="text-sm font-body cursor-pointer transition-colors hover:underline text-[#C2185B]">
          Explore the full pattern →
        </button>
      </div>
    </motion.div>
  )
}

function ScatterCard({ onNavigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  const scatterData = globalMetrics.filter(c => c.marriage_age_female != null && c.gdp_per_capita != null)
  return (
    <motion.div ref={ref} className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-10 py-10 border-t-2" style={{ borderColor: '#E76F5140' }}
      initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="md:w-[30%] flex-shrink-0 text-right">
        <p className="font-display text-6xl md:text-[80px] font-bold leading-none text-[#E76F51]">75%</p>
      </div>
      <div className="md:w-[70%]">
        <div className="mb-4">
          <svg viewBox="0 0 200 120" className="w-full max-w-[300px] h-[120px]">
            {scatterData.map((c, i) => {
              const x = ((c.marriage_age_female - 17) / (35 - 17)) * 180 + 10
              const maxGdp = Math.max(...scatterData.map(d => d.gdp_per_capita))
              const y = 110 - (c.gdp_per_capita / maxGdp) * 100
              return (
                <motion.circle key={c.country_code} r="2.5" fill="#E76F51"
                  initial={{ cx: 100, cy: 60, opacity: 0 }}
                  animate={inView ? { cx: x, cy: y, opacity: 0.6 } : {}}
                  transition={{ delay: 0.5 + i * 0.02, duration: 1.2, ease: 'easeOut' }} />
              )
            })}
          </svg>
        </div>
        <p className="font-body text-sm md:text-base text-text-secondary leading-relaxed mb-2">
          of a country's wealth can be predicted from one number: when women marry. Validated across 44 countries.
        </p>
        <button onClick={() => onNavigate('reveals')} className="text-sm font-body cursor-pointer transition-colors hover:underline text-[#E76F51]">
          See all four predictions →
        </button>
      </div>
    </motion.div>
  )
}

function LongevityCard({ onNavigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  const longevityCount = globalMetrics.filter(c => c.longevity_tax_pct != null && c.longevity_tax_pct > 50).length
  const exampleBars = [
    { code: 'SWE', pct: 93 }, { code: 'IND', pct: 91 }, { code: 'FRA', pct: 67 }, { code: 'MEX', pct: 29 }, { code: 'KOR', pct: 41 },
  ]
  return (
    <motion.div ref={ref} className="flex flex-col md:flex-row items-start gap-6 md:gap-10 py-10 border-t-2" style={{ borderColor: '#7B2D8E40' }}
      initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="md:w-[30%] flex-shrink-0">
        <p className="font-display text-6xl md:text-[80px] font-bold leading-none text-[#7B2D8E]">{longevityCount} of 43</p>
      </div>
      <div className="md:w-[70%]">
        <div className="space-y-1.5 mb-4 max-w-[280px]">
          {exampleBars.map((bar, i) => (
            <motion.div key={bar.code} className="flex items-center gap-2"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.4 }}>
              <span className="text-[9px] font-data text-text-muted w-8">{bar.code}</span>
              <div className="flex-1 h-4 rounded-sm overflow-hidden bg-[#1a3340]/5 flex">
                <motion.div className="h-full bg-[#2D6A4F]"
                  initial={{ width: '100%' }}
                  animate={inView ? { width: `${100 - bar.pct}%` } : {}}
                  transition={{ delay: 0.8 + i * 0.15, duration: 1, ease: 'easeOut' }} />
                <motion.div className="h-full bg-[#E07A5F]"
                  initial={{ width: '0%' }}
                  animate={inView ? { width: `${bar.pct}%` } : {}}
                  transition={{ delay: 0.8 + i * 0.15, duration: 1, ease: 'easeOut' }} />
              </div>
              <span className="text-[9px] font-data text-text-muted w-8">{bar.pct}%</span>
            </motion.div>
          ))}
        </div>
        <p className="font-body text-sm md:text-base text-text-secondary leading-relaxed mb-2">
          countries where more than half of women's extra years of life are spent in poor health.
        </p>
        <button onClick={() => onNavigate('reveals')} className="text-sm font-body cursor-pointer transition-colors hover:underline text-[#7B2D8E]">
          See all 44 countries →
        </button>
      </div>
    </motion.div>
  )
}

function GenderCard({ onNavigate }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  return (
    <motion.div ref={ref} className="flex flex-col md:flex-row-reverse items-start gap-6 md:gap-10 py-10 border-t-2" style={{ borderColor: '#E07A5F40' }}
      initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
      <div className="md:w-[30%] flex-shrink-0 text-right">
        <p className="font-display text-6xl md:text-[80px] font-bold leading-none text-[#E07A5F]">3.8</p>
      </div>
      <div className="md:w-[70%]">
        {/* Mini stacked bars: France M vs F */}
        <div className="space-y-2 mb-4 max-w-[250px]">
          <div>
            <p className="text-[9px] font-data text-text-muted mb-0.5">France ♀ (14.9 yrs poor health)</p>
            <div className="flex h-4 rounded-sm overflow-hidden">
              <div className="bg-[#2D6A4F] h-full" style={{ width: '83%' }} />
              <div className="bg-[#E07A5F] h-full" style={{ width: '17%' }} />
            </div>
          </div>
          <div>
            <p className="text-[9px] font-data text-text-muted mb-0.5">France ♂ (11.1 yrs poor health)</p>
            <div className="flex h-4 rounded-sm overflow-hidden">
              <div className="bg-[#2D6A4F] h-full" style={{ width: '86%' }} />
              <div className="bg-[#78909C] h-full" style={{ width: '14%' }} />
            </div>
          </div>
        </div>
        <p className="font-body text-sm md:text-base text-text-secondary leading-relaxed mb-2">
          extra years French women spend in poor health compared to French men. The largest gender gap in our data. Women live longer everywhere, but the quality of those years varies dramatically.
        </p>
        <button onClick={() => onNavigate('reveals')} className="text-sm font-body cursor-pointer transition-colors hover:underline text-[#E07A5F]">
          Explore the gender dimension →
        </button>
      </div>
    </motion.div>
  )
}

// --- Animated World Map Background ---
function WorldMapBg() {
  // Simplified world map dots at approximate city locations
  const dots = [
    { x: 20, y: 35 }, { x: 25, y: 45 }, { x: 30, y: 60 }, // Americas
    { x: 15, y: 30 }, { x: 22, y: 28 }, { x: 35, y: 55 },
    { x: 48, y: 30 }, { x: 50, y: 35 }, { x: 52, y: 28 }, // Europe
    { x: 47, y: 25 }, { x: 55, y: 30 }, { x: 53, y: 33 },
    { x: 58, y: 40 }, { x: 62, y: 35 }, { x: 65, y: 45 }, // Middle East/Asia
    { x: 70, y: 35 }, { x: 75, y: 30 }, { x: 78, y: 38 },
    { x: 80, y: 28 }, { x: 85, y: 35 }, { x: 82, y: 42 }, // East Asia
    { x: 50, y: 55 }, { x: 55, y: 60 }, { x: 48, y: 50 }, // Africa
    { x: 85, y: 60 }, { x: 88, y: 55 }, // Australia
  ]
  const connections = [
    [0, 8], [3, 10], [8, 16], [12, 19],
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-[80%] h-[80%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 80">
        {/* Animated connecting lines */}
        {connections.map(([a, b], i) => (
          <motion.path
            key={i}
            d={`M ${dots[a].x} ${dots[a].y} Q ${(dots[a].x + dots[b].x) / 2} ${Math.min(dots[a].y, dots[b].y) - 8} ${dots[b].x} ${dots[b].y}`}
            stroke={MILESTONE_COLORS[i % MILESTONE_COLORS.length]}
            strokeWidth="0.3"
            fill="none"
            strokeDasharray="4 4"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: i * 1.5, ease: 'easeInOut' }}
          />
        ))}
        {/* Pulsing city dots */}
        {dots.map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.x} cy={dot.y} r="0.6"
            fill={MILESTONE_COLORS[i % MILESTONE_COLORS.length]}
            animate={{ opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </svg>
    </div>
  )
}

// --- Main HomePage ---
export default function HomePage({ onPairSelected, onNavigate }) {
  const [customSelected, setCustomSelected] = useState([])

  function handleCustomSelect(code) {
    if (customSelected.includes(code)) {
      setCustomSelected(customSelected.filter(c => c !== code))
    } else if (customSelected.length < 2) {
      const newSelected = [...customSelected, code]
      if (newSelected.length === 2) setTimeout(() => onPairSelected(newSelected), 300)
      setCustomSelected(newSelected)
    }
  }

  return (
    <div className="scroll-smooth">
      <GradientLine />

      {/* SECTION 1: Hero (DARK) */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#1a2e3b' }}>
        <WorldMapBg />
        <motion.div className="text-center max-w-[750px] relative z-10"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-display text-[40px] md:text-[56px] leading-tight mb-8">
            <span className="font-bold text-white">Same milestones.</span>
            <br />
            <span className="font-normal text-[#E07A5F]">Different lives.</span>
          </h1>
          <p className="font-body text-lg md:text-[22px] text-white/70 mb-2 leading-relaxed">
            From first period to last breath, every human life follows
          </p>
          <p className="font-body text-lg md:text-[22px] text-white/70 mb-8 leading-relaxed">
            the same milestones. But when they happen changes everything.
          </p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>
            {/* Animated counter row */}
            <div className="flex items-center justify-center gap-8 md:gap-16 mb-6">
              {[{ val: 11, label: 'milestones' }, { val: 12, label: 'countries' }, { val: 44, label: 'for validation' }].map((item, i) => (
                <motion.div key={item.label} className="text-center"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.3, duration: 0.6 }}>
                  <motion.span className="font-data text-4xl md:text-5xl text-white font-medium block"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 + i * 0.3, duration: 0.8 }}>
                    {item.val}
                  </motion.span>
                  <span className="font-body text-xs md:text-sm text-white/40">{item.label}</span>
                </motion.div>
              ))}
            </div>
            {/* Pulsing dots */}
            <div className="flex items-center gap-2 justify-center">
              {MILESTONE_COLORS.map((color, i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
        <motion.div className="absolute bottom-8 text-white/30" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* SECTION 2: Race Animation (DARK, continuous) */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#1a2e3b' }}>
        <RaceAnimation />
      </section>

      {/* SECTION 3: Discovery Teasers with INFOGRAPHICS (CREAM) */}
      <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-16 bg-bg">
        <div className="max-w-[900px] w-full mx-auto">
          <motion.h2 className="font-display text-2xl md:text-[36px] text-text mb-12 text-left"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            Three things we didn't expect to find
          </motion.h2>

          <SequenceCard onNavigate={onNavigate} />
          <ScatterCard onNavigate={onNavigate} />
          <LongevityCard onNavigate={onNavigate} />
          <GenderCard onNavigate={onNavigate} />
        </div>
      </section>

      {/* SECTION 4: Pick Your Pair (WHITE) */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
        <div className="max-w-[1000px] w-full">
          <h2 className="font-display text-3xl md:text-[40px] text-center mb-3 text-text">Two countries. One life.</h2>
          <p className="text-center text-text-secondary font-body text-base md:text-lg mb-10 max-w-[600px] mx-auto">
            Choose two countries. We'll walk you through their lives, milestone by milestone, and show you what the timing means.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {SUGGESTED_PAIRS.map(pair => {
              const a = COUNTRIES.find(c => c.code === pair.codes[0])
              const b = COUNTRIES.find(c => c.code === pair.codes[1])
              return (
                <motion.button key={pair.codes.join('-')} onClick={() => onPairSelected(pair.codes)}
                  className="p-5 rounded-xl border border-[#1a3340]/6 bg-[#FAFAF8] hover:bg-white hover:shadow-lg transition-all text-left cursor-pointer border-l-4"
                  style={{ borderLeftColor: pair.color }}
                  whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{a.flag}</span>
                    <span className="font-body font-bold text-sm text-text">{a.name}</span>
                    <span className="text-text-faint">&</span>
                    <span className="text-lg">{b.flag}</span>
                    <span className="font-body font-bold text-sm text-text">{b.name}</span>
                  </div>
                  <p className="font-body text-sm md:text-base text-text-muted italic">{pair.tagline}</p>
                </motion.button>
              )
            })}
          </div>
          <div className="text-center">
            <p className="text-text-muted font-body text-sm mb-4">
              Or choose your own:{customSelected.length === 1 && <span className="ml-2 text-marriage font-medium">Pick one more</span>}
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-[700px] mx-auto">
              {COUNTRIES.map(country => {
                const isSelected = customSelected.includes(country.code)
                return (
                  <motion.button key={country.code} onClick={() => handleCustomSelect(country.code)}
                    className={`px-3 py-2 rounded-full border font-body text-sm cursor-pointer transition-all shadow-sm
                      ${isSelected ? 'border-marriage bg-marriage/10 text-marriage ring-2 ring-marriage/30 font-medium'
                        : 'border-[#1a3340]/8 bg-[#FAFAF8] hover:bg-white hover:shadow text-text'}`}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <span className="mr-1">{country.flag}</span>{country.name}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Quiz Teaser (WARM) — side by side layout */}
      <section className="py-20 px-4 md:px-8" style={{ backgroundColor: '#F0E6D3' }}>
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="font-display text-2xl md:text-[32px] text-text mb-2">How well do you know the world you live in?</h2>
            <p className="text-text-secondary font-body text-base mb-6">8 questions. Most people get half wrong.</p>
            <motion.button onClick={() => onNavigate('quiz')}
              className="px-8 py-3 rounded-full bg-marriage text-white font-body text-sm cursor-pointer hover:bg-marriage/90 transition-all shadow-md"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Test your intuition →
            </motion.button>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white/80 rounded-xl p-5 opacity-75 border border-[#1a3340]/5 shadow-sm">
              <p className="text-[10px] font-data text-text-faint mb-2">Question 5 of 8</p>
              <p className="font-display text-sm text-text mb-4">In Sweden, women live 3 years longer than men. What % of those extra years are in poor health?</p>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-data text-text-muted">0%</span>
                <div className="flex-1 h-2 bg-[#1a3340]/10 rounded-full relative">
                  <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-3 h-3 bg-marriage rounded-full shadow" />
                  <div className="absolute left-[93%] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2D6A4F] rounded-full" />
                </div>
                <span className="text-[10px] font-data text-text-muted">100%</span>
              </div>
              <p className="text-[9px] font-data text-text-faint text-center mt-1">Your guess: 50% | Answer: 93%</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Explore Teaser (CREAM) */}
      <section className="py-20 flex flex-col items-center px-4 bg-bg">
        <div className="max-w-[500px] text-center">
          <h2 className="font-display text-2xl md:text-[32px] text-text mb-2">Dig deeper</h2>
          <p className="text-text-secondary font-body text-base mb-6">24 metrics. 12 countries. Every combination tells a story.</p>
          <motion.button onClick={() => onNavigate('explore')}
            className="px-8 py-3 rounded-full border border-[#1a3340]/20 font-body text-sm text-text cursor-pointer hover:bg-white hover:shadow-md transition-all"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Open the explorer →
          </motion.button>
        </div>
      </section>

      {/* SECTION 7: Footer (DARK) */}
      <footer className="py-14 text-center px-4" style={{ backgroundColor: '#1a2e3b' }}>
        <p className="font-display text-lg text-white/90 mb-2">Life Milestones: How the World Grows Up</p>
        <p className="font-body text-sm text-white/60 mb-1">
          Exploring when life happens across cultures, and what it means for happiness, health, wealth, and equality.
        </p>
        <p className="font-body text-sm text-white/50 mb-4">Built for VizCon 2026: How the world lives, thrives, and connects.</p>
        <p className="font-body text-xs text-white/30 mb-4">
          Data from OECD, World Bank, WHO, OWID, UNESCO, and 4 other sources.<br />23 datasets. 28 processed files. 44 countries.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={() => onNavigate('about')} className="text-xs text-white/40 hover:text-white/80 hover:underline cursor-pointer font-body">Data Sources</button>
          <button onClick={() => onNavigate('about')} className="text-xs text-white/40 hover:text-white/80 hover:underline cursor-pointer font-body">Methodology</button>
        </div>
      </footer>
    </div>
  )
}
