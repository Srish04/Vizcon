import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'
import globalMetrics from '../../data/global_metrics.json'
import surpriseMetrics from '../../data/surprise_metrics.json'

console.log('[Reveals] Global metrics loaded:', globalMetrics.length, 'countries')
console.log('[Reveals] Surprise metrics loaded:', Object.keys(surpriseMetrics).length, 'sections')
console.log('[Reveals] Country profiles loaded:', countryProfiles.length, 'countries')

const MILESTONE_COLORS = {
  education: '#2D6A4F',
  leave_home: '#2A9D8F',
  leaving_home: '#2A9D8F',
  cohabitation: '#00897B',
  first_home: '#48BFE3',
  marriage: '#E76F51',
  first_baby: '#E9C46A',
  retirement: '#457B9D',
}

const MILESTONE_ABBREV = {
  education: 'Edu',
  leave_home: 'Home',
  leaving_home: 'Home',
  cohabitation: 'Coh',
  first_home: '1stH',
  marriage: 'Mar',
  first_baby: 'Baby',
  retirement: 'Ret',
}

const JOURNEY_CODES = ['SWE', 'ITA', 'JPN', 'KOR', 'AUS', 'FRA', 'DNK', 'DEU', 'USA', 'BRA', 'MEX', 'IND']

// --- REVEAL 1: The Sequence Is Broken ---
function RevealSequence() {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.2, once: true })

  const socialKeys = new Set(['education', 'leave_home', 'leaving_home', 'cohabitation', 'first_home', 'marriage', 'first_baby'])
  const sequences = surpriseMetrics.milestone_sequences || []

  const sorted = [...sequences].sort((a, b) => {
    const vA = (a.violations || []).length
    const vB = (b.violations || []).length
    if (vB !== vA) return vB - vA
    const marPosA = (a.ordered_milestones || []).findIndex(m => m.name === 'marriage')
    const marPosB = (b.ordered_milestones || []).findIndex(m => m.name === 'marriage')
    return marPosB - marPosA
  })

  const babyBeforeMarriageCount = sequences.filter(s =>
    (s.violations || []).includes('baby_before_marriage')
  ).length

  return (
    <section id="reveal-sequence" ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4 md:px-8 py-12">
      <div className="w-full max-w-[900px]">
        {/* Intro buildup */}
        <motion.p
          className="text-text-secondary font-body text-sm md:text-base text-center leading-relaxed max-w-[600px] mx-auto mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          We grow up believing life follows a script: finish school, find a partner, get married, have children. But when you line up the data across twelve countries, the script falls apart.
        </motion.p>

        <motion.h2
          className="font-display text-2xl md:text-4xl text-center mb-8 text-text"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          There is no universal life sequence
        </motion.h2>

        {/* Sequence rows */}
        <div className="space-y-2 md:space-y-3 mb-8">
          {sorted.map((country, i) => {
            const milestones = (country.ordered_milestones || []).filter(m => socialKeys.has(m.name))
            const hasBabyBeforeMarriage = (country.violations || []).includes('baby_before_marriage')

            return (
              <motion.div
                key={country.country}
                className="flex items-center gap-2 md:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
              >
                <span className="w-16 md:w-20 text-right text-xs md:text-sm font-body text-text-secondary flex-shrink-0">
                  {country.name}
                </span>
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  {milestones.map((m, j) => {
                    const color = MILESTONE_COLORS[m.name] || '#666'
                    const abbr = MILESTONE_ABBREV[m.name] || m.name
                    const isMarriage = m.name === 'marriage'
                    return (
                      <div key={j} className="flex flex-col items-center">
                        <div
                          className={`rounded-full ${isMarriage ? 'w-4 h-4 ring-2 ring-offset-1' : 'w-3 h-3'}`}
                          style={{
                            backgroundColor: color,
                            ringColor: isMarriage ? color : 'transparent',
                          }}
                        />
                        <span
                          className={`text-[8px] md:text-[9px] font-data mt-0.5 ${isMarriage ? 'font-bold' : ''}`}
                          style={{ color }}
                        >
                          {abbr}
                        </span>
                      </div>
                    )
                  })}
                  {hasBabyBeforeMarriage && (
                    <span className="text-[9px] font-data text-marriage ml-1">*</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Annotations */}
        <motion.div
          className="text-center space-y-1.5"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.0, duration: 0.5 }}
        >
          <p className="text-text font-body text-sm md:text-base">
            <span className="font-medium">{babyBeforeMarriageCount} of {sequences.length} countries</span> have baby before marriage.
          </p>
          <p className="text-text-muted font-body text-xs md:text-sm">
            In Sweden, marriage is literally the last social milestone. The sequence you assume is normal is the minority.
          </p>
          <p className="text-text-faint font-body text-xs mt-2">* = baby before marriage</p>
        </motion.div>
      </div>
    </section>
  )
}

// --- REVEAL 2: One Number Predicts It All ---
function RevealScatter() {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.2, once: true })

  const data = globalMetrics.filter(c => c.marriage_age_female != null)

  const charts = [
    { yKey: 'gdp_per_capita', label: 'GDP per Capita ($)', r2: 0.75 },
    { yKey: 'gii', label: 'Gender Inequality Index', r2: 0.76 },
    { yKey: 'happiness_score', label: 'Happiness Score', r2: 0.55 },
    { yKey: 'adolescent_fertility', label: 'Teen Pregnancies (per 1000)', r2: 0.54 },
  ]

  const plotW = 260, plotH = 180
  const xMin = 17, xMax = 36

  function xScale(v) { return ((v - xMin) / (xMax - xMin)) * plotW }
  function yScale(values, v) {
    const min = Math.min(...values.filter(x => x != null))
    const max = Math.max(...values.filter(x => x != null))
    return plotH - ((v - min) / (max - min)) * plotH
  }

  return (
    <section id="reveal-onenumber" ref={ref} className="min-h-screen snap-start flex flex-col items-center justify-center px-4 md:px-8 py-12 bg-[#264653]">
      <div className="w-full max-w-[900px]">
        <motion.p
          className="text-white/60 font-body text-sm md:text-base text-center leading-relaxed max-w-[600px] mx-auto mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          You've seen how differently these countries time their milestones. But here's the question no one asks: if you could know just one thing about a country, one single number, how much could you predict about everything else?
        </motion.p>

        <motion.h2
          className="font-display text-2xl md:text-[40px] text-center mb-2 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          One number predicts it all
        </motion.h2>
        <motion.p
          className="text-center text-white/50 font-body text-sm md:text-base mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          The age women marry. Across 44 countries, every continent, every income level
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {charts.map((chart) => {
            const points = data.filter(c => c[chart.yKey] != null)
            const yValues = points.map(c => c[chart.yKey])
            return (
              <div key={chart.yKey} className="bg-white/8 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-body text-white/60">{chart.label}</span>
                  <span className="text-sm md:text-lg font-data text-[#E76F51] font-medium">R² = {chart.r2}</span>
                </div>
                <svg viewBox={`-30 -10 ${plotW + 40} ${plotH + 30}`} className="w-full h-40 md:h-44">
                  {/* Gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                    <line key={pct} x1="0" y1={plotH * (1 - pct)} x2={plotW} y2={plotH * (1 - pct)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}
                  <line x1="0" y1={plotH} x2={plotW} y2={plotH} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <line x1="0" y1="0" x2="0" y2={plotH} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  {[20, 25, 30, 35].map(v => (
                    <text key={v} x={xScale(v)} y={plotH + 14} textAnchor="middle" className="text-[9px]" fill="rgba(255,255,255,0.5)">{v}</text>
                  ))}
                  <text x={plotW / 2} y={plotH + 26} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.35)">Female marriage age</text>
                  {points.map((c) => {
                    const cx = xScale(c.marriage_age_female)
                    const cy = yScale(yValues, c[chart.yKey])
                    const isJourney = JOURNEY_CODES.includes(c.country_code)
                    return (
                      <circle
                        key={c.country_code}
                        cx={cx} cy={cy}
                        r={isJourney ? 5 : 3}
                        fill="#E76F51"
                        opacity={isJourney ? 1 : 0.6}
                        style={isJourney ? { filter: 'drop-shadow(0 0 3px rgba(231,111,81,0.5))' } : {}}
                      >
                        <title>{c.country_code}: marriage={c.marriage_age_female}, {chart.yKey}={c[chart.yKey]}</title>
                      </circle>
                    )
                  })}
                </svg>
              </div>
            )
          })}
        </motion.div>

        <motion.p
          className="text-white/70 font-body text-sm md:text-base leading-relaxed text-center max-w-[650px] mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          Marriage age alone predicts 75% of a country's wealth and 76% of its gender equality.
          This isn't coincidence. It's the single strongest predictor of how a society treats its people.
        </motion.p>
      </div>
    </section>
  )
}

// --- REVEAL 3: The Longevity Tax ---
function RevealLongevity() {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.15, once: true })

  const longevityData = globalMetrics
    .filter(c => c.extra_years_female != null && c.extra_years_female > 0 && c.longevity_tax_pct != null)
    .map(c => ({
      code: c.country_code,
      extraYears: c.extra_years_female,
      extraHealthy: c.extra_healthy_years || 0,
      extraUnhealthy: c.extra_unhealthy_years || (c.extra_years_female - (c.extra_healthy_years || 0)),
      taxPct: c.longevity_tax_pct,
      isJourney: JOURNEY_CODES.includes(c.country_code),
    }))
    .sort((a, b) => b.taxPct - a.taxPct)

  const maxExtra = Math.max(...longevityData.map(d => d.extraYears))

  return (
    <section id="reveal-longevity" ref={ref} className="min-h-screen snap-start flex flex-col items-center px-4 md:px-8 py-12 overflow-y-auto">
      <div className="w-full max-w-[900px]">
        {/* Intro buildup */}
        <motion.p
          className="text-text-secondary font-body text-sm md:text-base text-center leading-relaxed max-w-[600px] mx-auto mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Women live longer than men in every country on Earth. We celebrate this as a victory. But the data tells a different story.
        </motion.p>

        <motion.h2
          className="font-display text-2xl md:text-4xl text-center mb-2 text-text"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          The Longevity Tax
        </motion.h2>
        <motion.p
          className="text-center text-text-muted font-body text-sm md:text-base mb-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Women live longer everywhere. But not all extra years are equal.
        </motion.p>

        {/* Legend (above chart) */}
        <motion.div
          className="flex items-center justify-center gap-5 mb-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <span className="flex items-center gap-1.5 text-xs font-data text-text-secondary">
            <span className="w-4 h-3 rounded-sm inline-block" style={{ backgroundColor: '#2D6A4F' }} />
            Extra healthy years
          </span>
          <span className="flex items-center gap-1.5 text-xs font-data text-text-secondary">
            <span className="w-4 h-3 rounded-sm inline-block" style={{ backgroundColor: '#E07A5F' }} />
            Extra unhealthy years
          </span>
        </motion.div>

        {/* Stacked bars */}
        <motion.div
          className="space-y-1 mb-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          {longevityData.map((d, i) => {
            const healthyPct = (d.extraHealthy / maxExtra) * 100
            const unhealthyPct = (d.extraUnhealthy / maxExtra) * 100
            return (
              <motion.div
                key={d.code}
                className={`flex items-center gap-2 py-0.5 ${d.isJourney ? 'bg-[#E76F51]/5 rounded px-1 -mx-1' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.0 + i * 0.03, duration: 0.3 }}
              >
                <span className={`w-10 md:w-12 text-right text-[9px] md:text-[11px] font-data flex-shrink-0 ${d.isJourney ? 'font-bold text-text' : 'text-text-muted'}`}>
                  {d.code}
                </span>
                <div className="flex-1 flex h-6 rounded overflow-hidden bg-[#1a3340]/5">
                  <div className="h-full rounded-l" style={{ width: `${Math.max(healthyPct, 0)}%`, backgroundColor: '#2D6A4F', opacity: 0.85 }} />
                  <div className="h-full" style={{ width: `${Math.max(unhealthyPct, 0)}%`, backgroundColor: '#E07A5F', opacity: 0.85 }} />
                </div>
                <span className={`w-10 md:w-12 text-[9px] md:text-[11px] font-data ${d.taxPct > 100 ? 'text-female font-bold' : 'text-text-muted'}`}>
                  {d.taxPct.toFixed(0)}%
                </span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Callouts */}
        <motion.div
          className="space-y-2 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <p className="text-text-secondary font-body text-xs md:text-sm">
            <span className="font-medium">Sweden:</span> women live 3 extra years. 93% of that time is in poor health.
          </p>
          <p className="text-text-secondary font-body text-xs md:text-sm">
            <span className="font-medium">Mexico:</span> women live 5.6 extra years. Only 29% unhealthy. They gain real life.
          </p>
          <p className="text-text-secondary font-body text-xs md:text-sm">
            <span className="font-medium">Israel:</span> 146%. Women live longer but have <em>fewer</em> healthy years than men.
          </p>
        </motion.div>

        {/* Caveat */}
        <p className="text-text-faint font-body text-[10px] text-center max-w-[500px] mx-auto">
          Life expectancy from 2024, HALE from 2021. Year mismatch inflates values above 100%, though the underlying pattern is real.
        </p>
      </div>
    </section>
  )
}

// --- Main Reveals Component ---
export default function Reveals({ onComplete, onPickPair, selectedPair }) {
  // Conditional intro text based on whether user explored a pair
  const introTitle = selectedPair
    ? 'You explored two countries.'
    : 'Three patterns hidden in the data.'
  const introSub = selectedPair
    ? "Here's what all of them reveal."
    : '44 countries. Every continent.'

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {/* Intro */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl md:text-4xl text-text mb-3">
            {introTitle}
          </h2>
          <p className="font-display text-xl md:text-3xl text-text-secondary mb-6">
            {introSub}
          </p>
          <p className="text-text-muted font-body text-sm md:text-base mb-8">
            Three patterns. 44 countries. Every continent.
          </p>
          <motion.div
            className="text-text-faint"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <RevealSequence />
      <RevealScatter />
      <RevealLongevity />

      {/* Outro */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ amount: 0.5, once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl md:text-3xl text-text mb-6">
            Now explore for yourself.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={() => onComplete('explore')}
              className="px-6 py-3 rounded-xl bg-marriage text-white font-body text-sm hover:bg-marriage/90 transition-all cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore correlations →
            </motion.button>
            <motion.button
              onClick={() => onComplete('quiz')}
              className="px-6 py-3 rounded-xl border border-[#1a3340]/20 font-body text-sm text-text hover:bg-white hover:shadow-md transition-all cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Test your intuition →
            </motion.button>
            <motion.button
              onClick={onPickPair}
              className="px-6 py-3 rounded-xl border border-[#1a3340]/10 font-body text-sm text-text-muted hover:bg-white/60 transition-all cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ← Pick another pair
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
