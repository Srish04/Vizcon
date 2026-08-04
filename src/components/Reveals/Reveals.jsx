import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import globalMetrics from '../../data/global_metrics.json'
import surpriseMetrics from '../../data/surprise_metrics.json'

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
const JOURNEY_CODES = ['SWE','ITA','JPN','KOR','AUS','FRA','DNK','DEU','USA','BRA','MEX','IND']

// ===== CHAPTER 1: Sequence =====
function Chapter1A() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <div className="max-w-[700px] text-center">
        <motion.p className="font-body text-lg md:text-xl text-text-secondary mb-8"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          Most people picture life like this:
        </motion.p>

        {/* Expected timeline */}
        <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
          {[
            { icon: '📚', label: 'Edu', age: 22, color: '#2D6A4F' },
            { icon: '🚪', label: 'Home', age: 24, color: '#2A9D8F' },
            { icon: '💑', label: 'Partner', age: 26, color: '#00897B' },
            { icon: '💍', label: 'Marry', age: 28, color: '#E76F51' },
            { icon: '👶', label: 'Baby', age: 30, color: '#E9C46A' },
          ].map((m, i) => (
            <motion.div key={i} className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.4 }}>
              <span className="text-2xl mb-1">{m.icon}</span>
              <span className="text-[9px] font-data" style={{ color: m.color }}>{m.label}</span>
              <span className="text-[8px] font-data text-text-faint">{m.age}</span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.5, duration: 0.6 }}>
          <p className="font-body text-base text-text-secondary mb-1">Education. Independence. Partnership. Marriage. Children.</p>
          <p className="font-body text-base text-text-secondary mb-6">In that order. At those ages.</p>
          <p className="font-display text-xl md:text-2xl text-text">But this isn't what the data shows.</p>
        </motion.div>
      </div>
    </section>
  )
}

function Chapter1B() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2, once: true })
  const socialKeys = new Set(['education','leave_home','leaving_home','cohabitation','first_home','marriage','first_baby'])
  const sequences = surpriseMetrics.milestone_sequences || []
  const sorted = [...sequences].sort((a, b) => {
    const vA = (a.violations||[]).length, vB = (b.violations||[]).length
    if (vB !== vA) return vB - vA
    return ((b.ordered_milestones||[]).findIndex(m=>m.name==='marriage')) - ((a.ordered_milestones||[]).findIndex(m=>m.name==='marriage'))
  })
  const babyCount = sequences.filter(s=>(s.violations||[]).includes('baby_before_marriage')).length

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-bg">
      <div className="w-full max-w-[900px]">
        <motion.h2 className="font-display text-2xl md:text-[32px] text-center mb-2 text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          What we actually found
        </motion.h2>
        <motion.p className="text-center text-text-muted font-body text-sm mb-8"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.2, duration: 0.4 }}>
          Social milestones by actual age (18-38). Each country's sequence.
        </motion.p>

        {/* Age axis header */}
        <div className="flex items-center mb-2 ml-20 md:ml-24">
          <div className="flex-1 flex justify-between text-[8px] font-data text-text-faint">
            {[18,20,22,24,26,28,30,32,34,36,38].map(a => <span key={a}>{a}</span>)}
          </div>
        </div>

        {/* Country swim lanes */}
        <div className="space-y-1.5">
          {sorted.map((country, i) => {
            const ms = (country.ordered_milestones||[]).filter(m => socialKeys.has(m.name) && m.age >= 18 && m.age <= 38)
            const hasBaby = (country.violations||[]).includes('baby_before_marriage')
            return (
              <motion.div key={country.country} className="flex items-center"
                initial={{ opacity: 0, x: -15 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}>
                <span className="w-20 md:w-24 text-right pr-2 text-[10px] md:text-xs font-body text-text-secondary flex-shrink-0">{country.name}</span>
                <div className="flex-1 relative h-6 bg-[#1a3340]/3 rounded">
                  {ms.map((m, j) => {
                    const left = ((m.age - 18) / (38 - 18)) * 100
                    const color = MILESTONE_COLORS[m.name] || '#666'
                    return (
                      <div key={j} className="absolute top-0.5 h-5 flex items-center justify-center rounded text-[7px] font-data text-white font-medium"
                        style={{ left: `${left}%`, width: '28px', backgroundColor: color, transform: 'translateX(-50%)' }}>
                        {MILESTONE_ABBREV[m.name] || ''}
                      </div>
                    )
                  })}
                  {hasBaby && <span className="absolute -top-1 right-1 text-[8px] text-[#E76F51]">↺</span>}
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div className="mt-6 text-center space-y-1"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.5, duration: 0.5 }}>
          <p className="text-text font-body text-sm">In <span className="font-medium">{babyCount} of {sequences.length}</span> countries, the first child arrives before marriage.</p>
          <p className="text-text-muted font-body text-xs">The pattern most people picture exists in fewer than half the countries we studied.</p>
          <p className="text-text-faint font-body text-[10px]">↺ = baby before marriage</p>
        </motion.div>
      </div>
    </section>
  )
}

// ===== CHAPTER 2: One Number =====
function Chapter2A() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  const spokes = [
    { label: 'GDP', r2: 0.75, x: 60, y: 30 }, { label: 'Equality', r2: 0.76, x: 240, y: 30 },
    { label: 'Happiness', r2: 0.55, x: 50, y: 160 }, { label: 'Teen Preg.', r2: 0.54, x: 250, y: 160 },
    { label: 'Life Exp.', r2: 0.52, x: 30, y: 95 }, { label: 'HALE', r2: 0.54, x: 270, y: 95 },
    { label: 'Divorce', r2: 0.45, x: 100, y: 175 }, { label: 'Fertility', r2: 0.51, x: 200, y: 175 },
  ]
  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a2e3b' }}>
      <div className="max-w-[650px] text-center">
        <svg viewBox="0 0 300 200" className="w-full max-w-[380px] h-[200px] mx-auto mb-6">
          <circle cx="150" cy="100" r="28" fill="none" stroke="#E76F51" strokeWidth="2.5" />
          <text x="150" y="96" textAnchor="middle" fill="#E76F51" fontSize="8" fontFamily="serif">Marriage</text>
          <text x="150" y="108" textAnchor="middle" fill="#E76F51" fontSize="7" fontFamily="serif">Age</text>
          {spokes.map((s, i) => {
            const thickness = s.r2 > 0.7 ? 2 : s.r2 > 0.5 ? 1.5 : 1
            const dash = s.r2 > 0.7 ? '' : s.r2 > 0.5 ? '4 3' : '2 3'
            return (
              <g key={i}>
                <motion.line x1="150" y1="100" x2={s.x} y2={s.y}
                  stroke="rgba(255,255,255,0.4)" strokeWidth={thickness} strokeDasharray={dash}
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }} />
                <circle cx={s.x} cy={s.y} r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <text x={s.x} y={s.y - 3} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6">{s.label}</text>
                <text x={s.x} y={s.y + 7} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5.5">{s.r2}</text>
              </g>
            )
          })}
        </svg>
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.5, duration: 0.6 }}>
          <p className="font-body text-base text-white/65 leading-relaxed mb-3">
            If you knew just one thing about a country — when women marry — you could estimate its wealth, equality, happiness, and health outcomes.
          </p>
          <p className="font-body text-sm text-white/45 leading-relaxed mb-4">
            Not because marriage causes these things. Because marriage timing reflects the deeper forces that shape a society: education access, economic opportunity, gender norms, and healthcare.
          </p>
          <p className="text-[10px] font-data text-white/30 italic">Correlation, not causation. These patterns reflect shared underlying drivers.</p>
        </motion.div>
      </div>
    </section>
  )
}

function Chapter2B() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15, once: true })
  const data = globalMetrics.filter(c => c.marriage_age_female != null)
  const charts = [
    { yKey: 'gdp_per_capita', label: 'GDP per Capita', r2: 0.75 },
    { yKey: 'gii', label: 'Gender Inequality', r2: 0.76 },
    { yKey: 'happiness_score', label: 'Happiness', r2: 0.55 },
    { yKey: 'adolescent_fertility', label: 'Teen Pregnancies', r2: 0.54 },
  ]
  const plotW = 240, plotH = 160, xMin = 17, xMax = 36
  const xScale = v => ((v - xMin) / (xMax - xMin)) * plotW
  const yScale = (vals, v) => { const mn = Math.min(...vals.filter(x=>x!=null)), mx = Math.max(...vals.filter(x=>x!=null)); return plotH - ((v-mn)/(mx-mn))*plotH }

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#1a2e3b' }}>
      <div className="w-full max-w-[900px]">
        <motion.h2 className="font-display text-2xl md:text-[32px] text-center mb-2 text-white"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          The evidence: 44 countries
        </motion.h2>
        <p className="text-center text-white/40 font-body text-sm mb-8">Female marriage age vs outcomes. Each dot is a country.</p>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3, duration: 0.6 }}>
          {charts.map(chart => {
            const pts = data.filter(c => c[chart.yKey] != null)
            const yVals = pts.map(c => c[chart.yKey])
            return (
              <div key={chart.yKey} className="bg-white/5 rounded-xl p-4 border border-white/8">
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] font-body text-white/50">{chart.label}</span>
                  <span className="text-sm font-data text-[#E76F51] font-bold">R²={chart.r2}</span>
                </div>
                <svg viewBox={`-5 -5 ${plotW+15} ${plotH+30}`} className="w-full h-36 md:h-40">
                  {[0.25,0.5,0.75].map(p => <line key={p} x1="0" y1={plotH*(1-p)} x2={plotW} y2={plotH*(1-p)} stroke="rgba(255,255,255,0.05)" />)}
                  <line x1="0" y1={plotH} x2={plotW} y2={plotH} stroke="rgba(255,255,255,0.15)" />
                  <line x1="0" y1="0" x2="0" y2={plotH} stroke="rgba(255,255,255,0.15)" />
                  {[20,25,30,35].map(v => <text key={v} x={xScale(v)} y={plotH+12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">{v}</text>)}
                  <text x={plotW/2} y={plotH+24} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">Marriage age (years)</text>
                  {pts.map(c => {
                    const cx = xScale(c.marriage_age_female), cy = yScale(yVals, c[chart.yKey])
                    const isJ = JOURNEY_CODES.includes(c.country_code)
                    return <circle key={c.country_code} cx={cx} cy={cy} r={isJ?4:2.5} fill="#E76F51" opacity={isJ?1:0.5}
                      style={isJ?{filter:'drop-shadow(0 0 3px rgba(231,111,81,0.5))'}:{}}><title>{c.country_code}</title></circle>
                  })}
                </svg>
              </div>
            )
          })}
        </motion.div>
        <motion.p className="text-white/50 font-body text-sm text-center mt-6 max-w-[600px] mx-auto"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1, duration: 0.5 }}>
          Marriage age is the strongest single correlate. But education completion age also correlates with workforce participation at R²=0.80.
        </motion.p>
      </div>
    </section>
  )
}

// ===== CHAPTER 3: Longevity Tax =====
function Chapter3A() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <motion.div className="max-w-[500px] text-center"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
        <svg viewBox="0 0 200 140" className="w-full max-w-[220px] h-[140px] mx-auto mb-8">
          <circle cx="65" cy="28" r="12" fill="#2D6A4F" />
          <rect x="54" y="44" width="22" height="60" rx="6" fill="#2D6A4F" />
          <text x="65" y="120" textAnchor="middle" fill="#4a6e7f" fontSize="8">♂</text>
          <circle cx="135" cy="18" r="12" fill="#E07A5F" />
          <rect x="124" y="34" width="22" height="45" rx="6" fill="#2D6A4F" />
          <rect x="124" y="34" width="22" height="18" rx="6" fill="#E07A5F" />
          <text x="135" y="120" textAnchor="middle" fill="#4a6e7f" fontSize="8">♀</text>
          <line x1="152" y1="40" x2="170" y2="32" stroke="#E07A5F" strokeWidth="0.8" />
          <text x="172" y="35" fill="#E07A5F" fontSize="6" fontStyle="italic">Extra years</text>
          <text x="172" y="44" fill="#E07A5F" fontSize="5.5">But how healthy?</text>
        </svg>
        <p className="font-body text-base md:text-lg text-text-secondary leading-relaxed mb-2">In every country, women outlive men.</p>
        <p className="font-body text-base md:text-lg text-text-secondary leading-relaxed mb-6">This is celebrated as progress.</p>
        <motion.p className="font-display text-xl md:text-2xl text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.8, duration: 0.5 }}>
          But when we separated those extra years into healthy and unhealthy, the picture changed.
        </motion.p>
      </motion.div>
    </section>
  )
}

function Chapter3B() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15, once: true })
  // Extreme cases
  const extremes = [
    { code: 'SWE', label: 'Sweden', extra: 3.0, unhealthy: 2.8, pct: 93, quote: "They're not living longer. They're dying slower." },
    { code: 'ISR', label: 'Israel', extra: 4.3, unhealthy: 6.3, pct: 147, quote: "Living longer, but with less health than the men who died sooner." },
    { code: 'MEX', label: 'Mexico', extra: 5.6, unhealthy: 1.6, pct: 29, quote: "One of few countries where women's extra years are genuinely good ones." },
  ]
  const longevityData = globalMetrics
    .filter(c => c.extra_years_female > 0 && c.longevity_tax_pct != null)
    .map(c => ({ code: c.country_code, extra: c.extra_years_female, healthy: c.extra_healthy_years||0, unhealthy: c.extra_unhealthy_years||0, pct: c.longevity_tax_pct, isJ: JOURNEY_CODES.includes(c.country_code) }))
    .sort((a,b) => b.pct - a.pct)
  const maxExtra = Math.max(...longevityData.map(d => d.extra))

  return (
    <section ref={ref} className="py-16 px-4 bg-bg">
      <div className="max-w-[800px] mx-auto">
        {/* ACT 1: Extreme cases */}
        <motion.h2 className="font-display text-2xl md:text-[32px] text-center mb-8 text-text"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
          The Longevity Tax
        </motion.h2>

        <div className="space-y-8 mb-12">
          {extremes.map((e, i) => (
            <motion.div key={e.code} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}>
              <p className="text-sm font-data text-text-muted mb-2">{e.label}: women live {e.extra} extra years. {e.pct}% unhealthy.</p>
              <div className="h-10 rounded overflow-hidden flex bg-[#1a3340]/5">
                <motion.div className="h-full bg-[#2D6A4F]"
                  initial={{ width: 0 }} animate={inView ? { width: `${((e.extra - e.unhealthy) / 8) * 100}%` } : {}}
                  transition={{ delay: 0.8 + i * 0.3, duration: 0.8 }} />
                <motion.div className="h-full bg-[#E07A5F]"
                  initial={{ width: 0 }} animate={inView ? { width: `${(e.unhealthy / 8) * 100}%` } : {}}
                  transition={{ delay: 1 + i * 0.3, duration: 0.8 }} />
              </div>
              <p className="font-display text-sm italic text-text-secondary mt-2">"{e.quote}"</p>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-5 mb-4 text-[10px] font-data">
          <span className="flex items-center gap-1 text-text-muted"><span className="w-3 h-3 rounded-sm bg-[#2D6A4F] inline-block" /> Healthy extra years</span>
          <span className="flex items-center gap-1 text-text-muted"><span className="w-3 h-3 rounded-sm bg-[#E07A5F] inline-block" /> Unhealthy extra years</span>
        </div>

        {/* ACT 2: Full chart */}
        <p className="text-center text-text-muted font-body text-sm mb-4">All 44 countries, sorted by % unhealthy</p>
        <div className="space-y-0.5">
          {longevityData.map((d, i) => (
            <motion.div key={d.code}
              className={`flex items-center gap-2 py-0.5 ${d.pct > 100 ? 'bg-[#E07A5F]/5 rounded' : ''} ${d.isJ ? 'bg-[#1a3340]/4 rounded px-1 -mx-1' : ''}`}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.5 + i * 0.02, duration: 0.2 }}>
              <span className={`w-10 text-right text-[9px] font-data ${d.isJ ? 'font-bold text-text' : 'text-text-muted'}`}>{d.code}</span>
              <div className="flex-1 flex h-5 rounded overflow-hidden bg-[#1a3340]/5">
                <div className="h-full bg-[#2D6A4F]" style={{ width: `${(d.healthy/maxExtra)*100}%`, opacity: 0.85 }} />
                <div className="h-full bg-[#E07A5F]" style={{ width: `${(d.unhealthy/maxExtra)*100}%`, opacity: 0.85 }} />
              </div>
              <span className={`w-10 text-[9px] font-data ${d.pct > 100 ? 'text-[#E07A5F] font-bold' : 'text-text-muted'}`}>{d.pct.toFixed(0)}%</span>
            </motion.div>
          ))}
        </div>

        {/* ACT 3: Closing */}
        <motion.div className="mt-10 text-center max-w-[550px] mx-auto"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="font-body text-sm text-text-secondary mb-1">The conversation about gender longevity usually stops at "women live longer."</p>
          <p className="font-body text-sm text-text-secondary mb-1">The data says that's only half the story.</p>
          <p className="font-display text-base text-text">The other half is what those years look like.</p>
          <p className="text-[9px] font-data text-text-faint mt-3">Life expectancy from 2024, HALE from 2021. Year mismatch inflates values above 100%.</p>
        </motion.div>
      </div>
    </section>
  )
}

// ===== Main Reveals =====
export default function Reveals({ onComplete, onPickPair, selectedPair }) {
  const introTitle = selectedPair ? 'You explored two countries.' : 'Three patterns hidden in the data.'
  const introSub = selectedPair ? "Here's what all of them reveal." : '44 countries. Every continent.'

  return (
    <div className="scroll-smooth">
      {/* Intro */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
        <motion.div className="text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="font-display text-2xl md:text-4xl text-text mb-3">{introTitle}</h2>
          <p className="font-display text-xl md:text-2xl text-text-secondary mb-8">{introSub}</p>
          <motion.div className="text-text-faint" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Chapter 1 */}
      <Chapter1A />
      <Chapter1B />

      {/* Chapter 2 */}
      <Chapter2A />
      <Chapter2B />

      {/* Chapter 3 */}
      <Chapter3A />
      <Chapter3B />

      {/* Outro */}
      <section className="min-h-[50vh] flex flex-col items-center justify-center px-4 bg-bg">
        <motion.div className="text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
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
