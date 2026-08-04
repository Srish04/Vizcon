import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import globalMetrics from '../../data/global_metrics.json'
import surpriseMetrics from '../../data/surprise_metrics.json'

console.log('[Reveals] Data loaded:', globalMetrics.length, 'countries')

const MILESTONE_COLORS = {
  education: '#2D6A4F', leave_home: '#2A9D8F', leaving_home: '#2A9D8F',
  cohabitation: '#00897B', first_home: '#48BFE3', marriage: '#E76F51',
  first_baby: '#E9C46A', retirement: '#457B9D',
}
const MILESTONE_ABBREV = {
  education: 'Edu', leave_home: 'Home', leaving_home: 'Home',
  cohabitation: 'Coh', first_home: '1stH', marriage: 'Mar',
  first_baby: 'Baby', retirement: 'Ret',
}
const JOURNEY_CODES = ['SWE', 'ITA', 'JPN', 'KOR', 'AUS', 'FRA', 'DNK', 'DEU', 'USA', 'BRA', 'MEX', 'IND']

// ====== REVEAL 1: Sequence ======
function Reveal1Intro() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4, once: true })
  const expected = [
    { color: '#2D6A4F', label: 'Edu' }, { color: '#2A9D8F', label: 'Home' },
    { color: '#00897B', label: 'Partner' }, { color: '#E76F51', label: 'Marry' }, { color: '#E9C46A', label: 'Baby' },
  ]
  const reality = [
    { color: '#2D6A4F', label: 'Edu' }, { color: '#00897B', label: 'Partner' },
    { color: '#E9C46A', label: 'Baby' }, { color: '#E76F51', label: 'Marry' },
  ]
  return (
    <section ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4 bg-bg">
      <motion.div className="text-center max-w-[600px]"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
        {/* Expected sequence */}
        <p className="text-[10px] font-data text-text-muted uppercase tracking-wider mb-3">Expected order</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {expected.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-[8px] font-data mt-1" style={{ color: m.color }}>{m.label}</span>
              </div>
              {i < expected.length - 1 && <span className="text-text-faint text-lg">→</span>}
            </div>
          ))}
        </div>
        {/* Reality */}
        <p className="text-[10px] font-data text-text-muted uppercase tracking-wider mb-3">Reality (6 of 12 countries)</p>
        <div className="flex items-center justify-center gap-2 mb-10">
          {reality.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-[8px] font-data mt-1" style={{ color: m.color }}>{m.label}</span>
              </div>
              {i < reality.length - 1 && <span className="text-text-faint text-lg">→</span>}
            </div>
          ))}
        </div>
        <p className="font-body text-base md:text-lg text-text-secondary leading-relaxed mb-3">
          We grow up believing life follows a script. Finish school, find a partner, get married, have children.
        </p>
        <motion.p className="font-display text-xl md:text-2xl text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }}>
          In most countries, the script is wrong.
        </motion.p>
      </motion.div>
    </section>
  )
}

function Reveal1Viz() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2, once: true })
  const socialKeys = new Set(['education', 'leave_home', 'leaving_home', 'cohabitation', 'first_home', 'marriage', 'first_baby'])
  const sequences = surpriseMetrics.milestone_sequences || []
  const sorted = [...sequences].sort((a, b) => {
    const vA = (a.violations || []).length, vB = (b.violations || []).length
    if (vB !== vA) return vB - vA
    return ((b.ordered_milestones || []).findIndex(m => m.name === 'marriage')) - ((a.ordered_milestones || []).findIndex(m => m.name === 'marriage'))
  })
  const babyBeforeCount = sequences.filter(s => (s.violations || []).includes('baby_before_marriage')).length

  return (
    <section ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4 py-12 bg-bg">
      <div className="w-full max-w-[800px]">
        <motion.h2 className="font-display text-2xl md:text-[36px] text-center mb-8 text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          There is no universal life sequence
        </motion.h2>
        <div className="space-y-2 md:space-y-3 mb-8">
          {sorted.map((country, i) => {
            const milestones = (country.ordered_milestones || []).filter(m => socialKeys.has(m.name))
            const hasBaby = (country.violations || []).includes('baby_before_marriage')
            return (
              <motion.div key={country.country} className="flex items-center gap-2 md:gap-3"
                initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}>
                <span className="w-16 md:w-20 text-right text-xs md:text-sm font-body text-text-secondary flex-shrink-0">{country.name}</span>
                <div className="flex items-center gap-1.5 md:gap-2">
                  {milestones.map((m, j) => {
                    const color = MILESTONE_COLORS[m.name] || '#666'
                    const isMarriage = m.name === 'marriage'
                    return (
                      <div key={j} className="flex flex-col items-center">
                        <div className={`rounded-full ${isMarriage ? 'w-4 h-4 ring-2 ring-offset-1' : 'w-3 h-3'}`}
                          style={{ backgroundColor: color, ringColor: isMarriage ? color : 'transparent' }} />
                        <span className={`text-[7px] md:text-[8px] font-data mt-0.5 ${isMarriage ? 'font-bold' : ''}`} style={{ color }}>
                          {MILESTONE_ABBREV[m.name] || m.name}
                        </span>
                      </div>
                    )
                  })}
                  {hasBaby && <span className="text-[8px] font-data text-[#E76F51] ml-1">*</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="text-center space-y-1">
          <p className="text-text font-body text-sm"><span className="font-medium">{babyBeforeCount} of {sequences.length}</span> countries have baby before marriage.</p>
          <p className="text-text-muted font-body text-xs">* = baby before marriage</p>
        </div>
      </div>
    </section>
  )
}

// ====== REVEAL 2: One Number ======
function Reveal2Intro() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4, once: true })
  return (
    <section ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a2e3b' }}>
      <motion.div className="text-center max-w-[600px]"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
        {/* Hub and spoke infographic */}
        <svg viewBox="0 0 300 200" className="w-full max-w-[350px] h-[200px] mx-auto mb-8">
          {/* Center circle */}
          <circle cx="150" cy="100" r="30" fill="none" stroke="#E76F51" strokeWidth="2" />
          <text x="150" y="96" textAnchor="middle" fill="#E76F51" className="text-[9px]" fontFamily="serif">Marriage</text>
          <text x="150" y="108" textAnchor="middle" fill="#E76F51" className="text-[8px]" fontFamily="serif">Age</text>
          {/* Spokes */}
          {[
            { x: 60, y: 40, label: 'GDP', color: '#48BFE3' },
            { x: 240, y: 40, label: 'Equality', color: '#2D6A4F' },
            { x: 60, y: 160, label: 'Happiness', color: '#E9C46A' },
            { x: 240, y: 160, label: 'Teen Preg.', color: '#AB47BC' },
          ].map((spoke, i) => (
            <g key={i}>
              <motion.line x1="150" y1="100" x2={spoke.x} y2={spoke.y}
                stroke={spoke.color} strokeWidth="1.5" opacity="0.5"
                initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }} />
              <circle cx={spoke.x} cy={spoke.y} r="18" fill="none" stroke={spoke.color} strokeWidth="1.5" opacity="0.7" />
              <text x={spoke.x} y={spoke.y + 4} textAnchor="middle" fill={spoke.color} className="text-[8px]" fontFamily="sans-serif">{spoke.label}</text>
            </g>
          ))}
        </svg>
        <p className="font-body text-base md:text-lg text-white/65 leading-relaxed mb-4">
          If you could know just one thing about a country, one single number, how much could you predict about everything else?
        </p>
        <motion.p className="font-display text-xl md:text-2xl text-white"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }}>
          The answer: almost everything.
        </motion.p>
      </motion.div>
    </section>
  )
}

function Reveal2Viz() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2, once: true })
  const data = globalMetrics.filter(c => c.marriage_age_female != null)
  const charts = [
    { yKey: 'gdp_per_capita', label: 'GDP per Capita', r2: 0.75 },
    { yKey: 'gii', label: 'Gender Inequality', r2: 0.76 },
    { yKey: 'happiness_score', label: 'Happiness', r2: 0.55 },
    { yKey: 'adolescent_fertility', label: 'Teen Pregnancies', r2: 0.54 },
  ]
  const plotW = 260, plotH = 180, xMin = 17, xMax = 36
  const xScale = v => ((v - xMin) / (xMax - xMin)) * plotW
  const yScale = (values, v) => {
    const mn = Math.min(...values.filter(x => x != null)), mx = Math.max(...values.filter(x => x != null))
    return plotH - ((v - mn) / (mx - mn)) * plotH
  }

  return (
    <section ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#1a2e3b' }}>
      <div className="w-full max-w-[900px]">
        <motion.h2 className="font-display text-2xl md:text-[36px] text-center mb-2 text-white"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          One number predicts it all
        </motion.h2>
        <p className="text-center text-white/40 font-body text-sm mb-8">Female marriage age vs outcomes (44 countries)</p>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3, duration: 0.6 }}>
          {charts.map(chart => {
            const points = data.filter(c => c[chart.yKey] != null)
            const yVals = points.map(c => c[chart.yKey])
            return (
              <div key={chart.yKey} className="bg-white/5 rounded-xl p-4 border border-white/8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-body text-white/50">{chart.label}</span>
                  <span className="text-base font-data text-[#E76F51] font-bold">R² = {chart.r2}</span>
                </div>
                <svg viewBox={`-10 -5 ${plotW + 20} ${plotH + 35}`} className="w-full h-44">
                  {[0.25, 0.5, 0.75].map(p => (
                    <line key={p} x1="0" y1={plotH * (1-p)} x2={plotW} y2={plotH * (1-p)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  <line x1="0" y1={plotH} x2={plotW} y2={plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2={plotH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  {[20, 25, 30, 35].map(v => (
                    <text key={v} x={xScale(v)} y={plotH + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9">{v}</text>
                  ))}
                  <text x={plotW/2} y={plotH + 28} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">Marriage age</text>
                  {points.map(c => {
                    const cx = xScale(c.marriage_age_female), cy = yScale(yVals, c[chart.yKey])
                    const isJ = JOURNEY_CODES.includes(c.country_code)
                    return <circle key={c.country_code} cx={cx} cy={cy} r={isJ ? 4.5 : 2.5}
                      fill="#E76F51" opacity={isJ ? 1 : 0.5}
                      style={isJ ? { filter: 'drop-shadow(0 0 3px rgba(231,111,81,0.6))' } : {}} />
                  })}
                </svg>
              </div>
            )
          })}
        </motion.div>
        <p className="text-white/60 font-body text-sm text-center max-w-[600px] mx-auto">
          Marriage age alone predicts 75% of a country's wealth and 76% of its gender equality across 44 countries.
        </p>
      </div>
    </section>
  )
}

// ====== REVEAL 3: Longevity Tax ======
function Reveal3Intro() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4, once: true })
  return (
    <section ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4 bg-bg">
      <motion.div className="text-center max-w-[500px]"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
        {/* Silhouette infographic */}
        <svg viewBox="0 0 200 160" className="w-full max-w-[250px] h-[160px] mx-auto mb-8">
          {/* Male (shorter, fully green) */}
          <circle cx="65" cy="30" r="14" fill="#2D6A4F" />
          <rect x="52" y="48" width="26" height="70" rx="8" fill="#2D6A4F" />
          <text x="65" y="140" textAnchor="middle" fill="#4a6e7f" fontSize="9">♂ Male</text>
          {/* Female (taller, green + coral top) */}
          <circle cx="135" cy="20" r="14" fill="#E07A5F" />
          <rect x="122" y="38" width="26" height="50" rx="8" fill="#2D6A4F" />
          <rect x="122" y="38" width="26" height="22" rx="8" fill="#E07A5F" />
          <text x="135" y="140" textAnchor="middle" fill="#4a6e7f" fontSize="9">♀ Female</text>
          {/* Annotation */}
          <line x1="155" y1="42" x2="175" y2="35" stroke="#E07A5F" strokeWidth="1" />
          <text x="177" y="38" fill="#E07A5F" fontSize="7" fontStyle="italic">Extra years</text>
          <text x="177" y="48" fill="#E07A5F" fontSize="6">But how healthy?</text>
        </svg>
        <p className="font-body text-base md:text-lg text-text-secondary leading-relaxed mb-2">
          Women live longer than men in every country on Earth.
        </p>
        <p className="font-body text-base md:text-lg text-text-secondary leading-relaxed mb-4">
          We celebrate this as progress.
        </p>
        <motion.p className="font-display text-xl md:text-2xl text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }}>
          But the data tells a different story about what those extra years look like.
        </motion.p>
      </motion.div>
    </section>
  )
}

function Reveal3Viz() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15, once: true })
  const longevityData = globalMetrics
    .filter(c => c.extra_years_female > 0 && c.longevity_tax_pct != null)
    .map(c => ({ code: c.country_code, extraYears: c.extra_years_female, extraHealthy: c.extra_healthy_years || 0, extraUnhealthy: c.extra_unhealthy_years || 0, taxPct: c.longevity_tax_pct, isJ: JOURNEY_CODES.includes(c.country_code) }))
    .sort((a, b) => b.taxPct - a.taxPct)
  const maxExtra = Math.max(...longevityData.map(d => d.extraYears))

  return (
    <section ref={ref} className="min-h-screen snap-start flex flex-col items-center px-4 py-12 bg-bg">
      <div className="w-full max-w-[800px]">
        <motion.h2 className="font-display text-2xl md:text-[36px] text-center mb-2 text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          The Longevity Tax
        </motion.h2>
        <p className="text-center text-text-muted font-body text-sm mb-2">Women's extra years: what portion is healthy?</p>
        <div className="flex justify-center gap-5 mb-6 text-[10px] font-data">
          <span className="flex items-center gap-1 text-text-muted"><span className="w-3 h-3 rounded-sm bg-[#2D6A4F] inline-block" /> Healthy extra years</span>
          <span className="flex items-center gap-1 text-text-muted"><span className="w-3 h-3 rounded-sm bg-[#E07A5F] inline-block" /> Unhealthy extra years</span>
        </div>

        <motion.div className="space-y-1" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3, duration: 0.5 }}>
          {longevityData.map((d, i) => (
            <motion.div key={d.code}
              className={`flex items-center gap-2 py-0.5 ${d.taxPct > 100 ? 'bg-[#E07A5F]/5 rounded' : ''} ${d.isJ ? 'bg-[#1a3340]/4 rounded px-1 -mx-1' : ''}`}
              initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.02, duration: 0.2 }}>
              <span className={`w-10 md:w-12 text-right text-[9px] md:text-[11px] font-data flex-shrink-0 ${d.isJ ? 'font-bold text-text' : 'text-text-muted'}`}>{d.code}</span>
              <div className="flex-1 flex h-6 rounded overflow-hidden bg-[#1a3340]/5">
                <div className="h-full bg-[#2D6A4F]" style={{ width: `${(d.extraHealthy / maxExtra) * 100}%`, opacity: 0.85 }} />
                <div className="h-full bg-[#E07A5F]" style={{ width: `${(d.extraUnhealthy / maxExtra) * 100}%`, opacity: 0.85 }} />
              </div>
              <span className={`w-10 md:w-12 text-[9px] md:text-[11px] font-data ${d.taxPct > 100 ? 'text-[#E07A5F] font-bold' : 'text-text-muted'}`}>{d.taxPct.toFixed(0)}%</span>
            </motion.div>
          ))}
        </motion.div>
        <p className="text-text-faint font-body text-[10px] text-center mt-4 max-w-[500px] mx-auto">
          Life expectancy from 2024, HALE from 2021. Year mismatch inflates values above 100%.
        </p>
      </div>
    </section>
  )
}

// ====== Main Reveals ======
export default function Reveals({ onComplete, onPickPair, selectedPair }) {
  const introTitle = selectedPair ? 'You explored two countries.' : 'Three patterns hidden in the data.'
  const introSub = selectedPair ? "Here's what all of them reveal." : '44 countries. Every continent.'

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {/* Intro */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4 bg-bg">
        <motion.div className="text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="font-display text-2xl md:text-4xl text-text mb-3">{introTitle}</h2>
          <p className="font-display text-xl md:text-3xl text-text-secondary mb-8">{introSub}</p>
          <motion.div className="text-text-faint" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <Reveal1Intro />
      <Reveal1Viz />
      <Reveal2Intro />
      <Reveal2Viz />
      <Reveal3Intro />
      <Reveal3Viz />

      {/* Outro */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4 bg-bg">
        <motion.div className="text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ amount: 0.5, once: true }} transition={{ duration: 0.8 }}>
          <h2 className="font-display text-2xl md:text-3xl text-text mb-6">Now explore for yourself.</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button onClick={() => onComplete('explore')} className="px-8 py-3 rounded-full bg-marriage text-white font-body text-sm cursor-pointer hover:bg-marriage/90 transition-all" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Explore correlations →
            </motion.button>
            <motion.button onClick={() => onComplete('quiz')} className="px-8 py-3 rounded-full border border-[#1a3340]/20 font-body text-sm text-text cursor-pointer hover:bg-white hover:shadow-md transition-all" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Test your intuition →
            </motion.button>
            <motion.button onClick={onPickPair} className="px-8 py-3 rounded-full border border-[#1a3340]/10 font-body text-sm text-text-muted cursor-pointer hover:bg-white/60 transition-all" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              ← Pick another pair
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
