import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import countryProfiles from '../data/country_profiles.json'
import correlations from '../data/correlations.json'
import surpriseMetrics from '../data/surprise_metrics.json'
import ExpandableChart from './ExpandableChart'

// === DISCOVERY 1 CONFIG ===
const SEQUENCE_MILESTONES = [
  { key: 'education', label: 'Education', color: '#2D6A4F' },
  { key: 'leaving_home', label: 'Leave Home', color: '#2A9D8F' },
  { key: 'cohabitation', label: 'Cohabitation', color: '#00897B' },
  { key: 'marriage', label: 'Marriage', color: '#E76F51' },
  { key: 'first_baby', label: 'First Child', color: '#E9C46A' },
  { key: 'first_home', label: 'First Home', color: '#48BFE3' },
  { key: 'retirement_age', label: 'Retirement', color: '#457B9D' },
]

// Most common actual order (based on majority of countries)
const CORRECT_ORDER = ['education', 'leaving_home', 'cohabitation', 'first_baby', 'first_home', 'marriage', 'retirement_age']

const COUNTRY_ORDER = ['SWE','ITA','FRA','DNK','DEU','KOR','JPN','AUS','USA','MEX','BRA','IND']
const BABY_BEFORE_MARRIAGE = ['SWE','ITA','FRA','DNK','DEU','USA']

function getCountrySequence(code) {
  const profile = countryProfiles.find(c => c.country === code)
  if (!profile) return []
  const ms = profile.milestones
  const result = []
  for (const m of SEQUENCE_MILESTONES) {
    const val = ms[m.key]?.value
    if (val != null) result.push({ key: m.key, label: m.label, color: m.color, age: val })
  }
  return result.sort((a, b) => a.age - b.age)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// === DISCOVERY 1: THE SEQUENCE IS BROKEN ===
function SequenceDiscovery() {
  const [sourcePills, setSourcePills] = useState(() => shuffle(SEQUENCE_MILESTONES))
  const [slots, setSlots] = useState(Array(7).fill(null))
  const [revealed, setRevealed] = useState(false)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  const allFilled = slots.every(s => s !== null)
  const score = revealed ? slots.filter((s, i) => s?.key === CORRECT_ORDER[i]).length : 0

  function handleDrop(slotIdx, e) {
    e.preventDefault()
    const key = e.dataTransfer.getData('text/plain')
    const milestone = SEQUENCE_MILESTONES.find(m => m.key === key)
    if (!milestone) return
    // Remove from any existing slot
    const newSlots = slots.map(s => s?.key === key ? null : s)
    newSlots[slotIdx] = milestone
    setSlots(newSlots)
    setDragOverSlot(null)
  }

  function removeFromSlot(slotIdx) {
    const newSlots = [...slots]
    newSlots[slotIdx] = null
    setSlots(newSlots)
  }

  function handleReveal() {
    if (allFilled) setRevealed(true)
  }

  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <h3 className="font-display text-[36px] md:text-[44px] text-[#264653]">The Sequence Is Broken</h3>
          <p className="font-body text-[20px] text-[#475569] mt-2">Most people assume life follows a set order.</p>
          {!revealed && (
            <p className="font-body text-[18px] font-bold text-[#E76F51] mt-4">Drag the milestones into the order you think is correct.</p>
          )}
        </div>

        {!revealed && (
          <>
            {/* Source pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {sourcePills.map(m => {
                const inSlot = slots.some(s => s?.key === m.key)
                return (
                  <div key={m.key} draggable={!inSlot}
                    onDragStart={e => e.dataTransfer.setData('text/plain', m.key)}
                    className={`h-11 px-5 rounded-lg flex items-center text-[15px] font-body font-bold text-white cursor-grab transition-opacity
                      ${inSlot ? 'opacity-30 cursor-default' : 'opacity-100'}`}
                    style={{ backgroundColor: m.color }}>
                    {m.label}
                  </div>
                )
              })}
            </div>

            {/* Drop slots */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {slots.map((slot, i) => (
                <div key={i}
                  onDragOver={e => { e.preventDefault(); setDragOverSlot(i) }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={e => handleDrop(i, e)}
                  className={`w-[130px] h-[52px] rounded-lg flex items-center justify-center relative transition-all
                    ${slot ? '' : dragOverSlot === i ? 'border-2 border-solid border-[#264653] bg-[#264653]/5' : 'border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc]'}`}
                  style={slot ? { backgroundColor: slot.color } : {}}>
                  {slot ? (
                    <>
                      <span className="text-[14px] font-body font-bold text-white">{slot.label}</span>
                      <button onClick={() => removeFromSlot(i)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-600 text-white text-[10px] flex items-center justify-center cursor-pointer">x</button>
                    </>
                  ) : (
                    <span className="text-[20px] font-body font-bold text-[#cbd5e1]">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Reveal button */}
            <div className="text-center">
              <button onClick={handleReveal}
                className={`px-8 py-3 rounded-lg text-[16px] font-body font-semibold transition-all
                  ${allFilled ? 'bg-[#264653] text-white cursor-pointer hover:opacity-90' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
                Reveal reality
              </button>
            </div>
          </>
        )}

        {/* Results after reveal */}
        {revealed && (
          <div>
            {/* User's sequence */}
            <p className="text-[14px] font-body font-bold text-[#475569] mb-2">Your sequence:</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {slots.map((s, i) => s && (
                <span key={i} className="px-3 py-1.5 rounded-md text-[13px] font-body font-semibold text-white" style={{ backgroundColor: s.color }}>
                  {s.label}
                </span>
              ))}
            </div>

            {/* Score */}
            <p className="text-[20px] font-body font-bold text-[#264653] mb-8">{score} of 7 in the right position</p>

            {/* 12 country rows */}
            <div className="space-y-3">
              {COUNTRY_ORDER.map((code, idx) => {
                const profile = countryProfiles.find(c => c.country === code)
                const seq = getCountrySequence(code)
                const babyFirst = BABY_BEFORE_MARRIAGE.includes(code)
                return (
                  <motion.div key={code}
                    className={`p-4 rounded-lg border border-gray-200 bg-white ${babyFirst ? 'border-l-4 border-l-[#E76F51]' : ''}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[16px] font-body font-bold text-[#264653]">{profile?.name || code}</span>
                      {babyFirst && <span className="text-[14px] font-body italic text-[#E76F51]">-- baby before marriage</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {seq.map((m, mi) => (
                        <span key={m.key} className="flex items-center gap-1">
                          <span className="px-3 py-1.5 rounded-md text-[13px] font-body font-semibold text-white" style={{ backgroundColor: m.color }}>
                            {m.label} ({Math.round(m.age)})
                          </span>
                          {mi < seq.length - 1 && <span className="text-[13px] text-[#94a3b8] mx-0.5">&gt;</span>}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="text-center mt-10">
              <p className="text-[24px] font-body font-bold text-[#264653]">6 of 12 countries have baby before marriage.</p>
              <p className="text-[20px] font-body font-semibold text-[#E76F51] mt-2">There is no universal life sequence.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// === DISCOVERY 2: ONE NUMBER PREDICTS IT ALL (placeholder for Phase 2) ===
function MarriageDiscovery() {
  const [activePanel, setActivePanel] = useState(0)

  const panels = [
    { label: 'vs GDP', yKey: 'gdp_per_capita', yLabel: 'GDP per Capita (PPP $)', rSq: 0.75, format: v => `$${(v/1000).toFixed(0)}k` },
    { label: 'vs Gender Equality', yKey: 'gender_inequality_index', yLabel: 'Gender Inequality Index', rSq: 0.76, format: v => v.toFixed(3) },
    { label: 'vs Happiness', yKey: 'happiness', yLabel: 'Happiness Score', rSq: 0.55, format: v => v.toFixed(2) },
    { label: 'vs Teen Fertility', yKey: 'adolescent_fertility', yLabel: 'Adolescent Fertility (per 1000)', rSq: 0.54, format: v => v.toFixed(1) },
  ]

  const panel = panels[activePanel]

  const REGION_COLORS = {
    SWE:'#2D6A4F',DNK:'#2D6A4F',ITA:'#457B9D',FRA:'#457B9D',DEU:'#457B9D',AUS:'#457B9D',
    JPN:'#E76F51',KOR:'#E76F51',USA:'#C2185B',BRA:'#C2185B',MEX:'#C2185B',IND:'#7B2D8E'
  }

  const points = useMemo(() => {
    return correlations
      .filter(c => c.marriage_age != null && c[panel.yKey] != null)
      .map(c => ({ code: c.country, name: c.name, x: c.marriage_age, y: c[panel.yKey], color: REGION_COLORS[c.country] || '#999' }))
  }, [panel])

  const W=700, H=450, M={t:40,r:40,b:60,l:80}
  const pw=W-M.l-M.r, ph=H-M.t-M.b

  const { xRange, yRange } = useMemo(() => {
    if (points.length === 0) return { xRange:[20,36], yRange:[0,1] }
    const xs = points.map(p=>p.x), ys = points.map(p=>p.y)
    const xPad = (Math.max(...xs)-Math.min(...xs))*0.1||1
    const yPad = (Math.max(...ys)-Math.min(...ys))*0.1||1
    return { xRange:[Math.min(...xs)-xPad, Math.max(...xs)+xPad], yRange:[Math.min(...ys)-yPad, Math.max(...ys)+yPad] }
  }, [points])

  const sx = v => M.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * pw
  const sy = v => M.t + ph - ((v - yRange[0]) / (yRange[1] - yRange[0])) * ph

  return (
    <div className="bg-[#264653] py-24 px-6 relative overflow-hidden">
      {/* Background - abstract network */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover" loading="lazy"/>
        <div className="absolute inset-0" style={{ backgroundColor: '#264653', opacity: 0.85 }}/>
      </div>
      <div className="max-w-[1100px] mx-auto text-center relative z-10">
        <p className="font-display text-[100px] md:text-[140px] font-bold text-white" style={{ letterSpacing: '-2px' }}>75%</p>
        <p className="font-body text-[20px] md:text-[24px] text-white/80 max-w-[600px] mx-auto mt-6">
          of a country's GDP variation can be predicted by a single number.
        </p>
        <p className="font-display text-[28px] md:text-[32px] text-[#E76F51] mt-8">The age women marry.</p>
        <p className="font-body text-[14px] text-white/50 max-w-[600px] mx-auto mt-4">
          We use female marriage age because it reflects women's access to education and independence, and correlates more strongly with national outcomes than male or average marriage age.
        </p>

        {/* Scatter plot */}
        <div className="mt-16 mx-auto" style={{ maxWidth: '700px' }}>
          <ExpandableChart title="Marriage Age vs Outcomes">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 p-6 shadow-lg shadow-black/20">
            <div className="absolute top-4 right-6">
              <span className="font-data text-[18px] font-bold text-white">R-squared = {panel.rSq.toFixed(2)}</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {/* X axis */}
              <line x1={M.l} y1={H-M.b} x2={W-M.r} y2={H-M.b} stroke="white" strokeWidth="0.5" opacity="0.2"/>
              <line x1={M.l} y1={M.t} x2={M.l} y2={H-M.b} stroke="white" strokeWidth="0.5" opacity="0.2"/>
              {/* X ticks */}
              {[20,24,28,32,36].map(v => (
                <text key={v} x={sx(v)} y={H-M.b+18} textAnchor="middle" fill="white" fontSize="13" opacity="0.6" fontFamily="Inter">{v}</text>
              ))}
              {/* Y ticks */}
              {Array.from({length:5}).map((_,i) => {
                const v = yRange[0]+(yRange[1]-yRange[0])*(i/4)
                return <text key={i} x={M.l-10} y={sy(v)+4} textAnchor="end" fill="white" fontSize="13" opacity="0.6" fontFamily="Inter">{panel.format(v)}</text>
              })}
              {/* Axis labels */}
              <text x={M.l+pw/2} y={H-10} textAnchor="middle" fill="white" fontSize="14" opacity="0.7" fontFamily="Inter">Marriage Age - Female (years)</text>
              <text x={16} y={M.t+ph/2} textAnchor="middle" fill="white" fontSize="14" opacity="0.7" fontFamily="Inter" transform={`rotate(-90,16,${M.t+ph/2})`}>{panel.yLabel}</text>
              {/* Dots */}
              {points.map(p => (
                <g key={p.code}>
                  <circle cx={sx(p.x)} cy={sy(p.y)} r="10" fill={p.color} opacity="0.9" className="transition-all duration-500"/>
                  <text x={sx(p.x)+14} y={sy(p.y)+4} fill="white" fontSize="12" fontFamily="Inter" fontWeight="700">{p.code}</text>
                </g>
              ))}
            </svg>
          </div>
          </ExpandableChart>

          {/* Panel buttons */}
          <div className="flex justify-center gap-3 mt-6">
            {panels.map((p, i) => (
              <button key={i} onClick={() => setActivePanel(i)}
                className={`px-5 py-3 rounded-lg text-[14px] font-body font-semibold cursor-pointer transition-all
                  ${activePanel === i ? 'bg-white text-[#264653] border border-white' : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Bottom text */}
          <div className="mt-12">
            <p className="font-body text-[20px] text-white text-center max-w-[700px] mx-auto">
              The same number correlates with wealth, equality, happiness, and teenage pregnancy.
            </p>
            <p className="font-body text-[16px] text-white/60 text-center mt-3">Across 44 countries, every continent, every income level.</p>
            <p className="font-body text-[14px] text-white/60 text-center mt-4">
              Correlation, not causation. Marriage timing reflects deeper forces: education access, economic opportunity, gender norms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// === DISCOVERY 3: THE LONGEVITY TAX ===
function LongevityDiscovery() {
  const [sortBy, setSortBy] = useState('pct')
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const data = useMemo(() => {
    let d = [...surpriseMetrics.gender_longevity_tax]
    if (sortBy === 'pct') d.sort((a, b) => b.pct_extra_unhealthy - a.pct_extra_unhealthy)
    else if (sortBy === 'total') d.sort((a, b) => b.extra_life_years - a.extra_life_years)
    else d.sort((a, b) => a.name.localeCompare(b.name))
    return d
  }, [sortBy])

  const maxYears = Math.max(...data.map(d => d.extra_life_years))

  // "Did you know?" reveal
  if (!revealed) {
    return (
      <div className="bg-[#f8fafc] py-24 px-6">
        <div className="max-w-[650px] mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl p-14 text-center border-2 border-[#264653]/10">
            <p className="font-display text-[32px] text-[#264653]">The Longevity Paradox</p>
            <p className="font-body text-[20px] text-[#475569] mt-6">Swedish women live 3 extra years beyond men. But 93% of that time is spent in poor health.</p>
            <p className="font-body text-[20px] text-[#264653] font-semibold mt-4">Mexican women live 5.6 extra years. 71% of that time is healthy.</p>
            <p className="font-body text-[16px] text-[#475569] mt-4">Living longer does not mean living better. The gap between countries is enormous.</p>
            <button onClick={() => setRevealed(true)}
              className="mt-10 px-10 py-4 rounded-xl bg-[#264653] text-white font-body text-[18px] font-semibold cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
              See the full picture
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="bg-white py-20 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="max-w-[1100px] mx-auto">
        {/* SVG illustration */}
        <div className="flex justify-center items-end gap-10 mb-8">
          <div className="text-center">
            <svg width="40" height="80" viewBox="0 0 40 80">
              <circle cx="20" cy="10" r="8" fill="#2D6A4F"/>
              <rect x="8" y="20" width="24" height="56" rx="6" fill="#2D6A4F"/>
            </svg>
            <span className="block text-[13px] font-body font-bold text-[#475569] mt-1">M</span>
          </div>
          <div className="text-center relative">
            <svg width="40" height="96" viewBox="0 0 40 96">
              <circle cx="20" cy="10" r="8" fill="#2D6A4F"/>
              <rect x="8" y="20" width="24" height="50" rx="6" fill="#2D6A4F"/>
              <rect x="8" y="70" width="24" height="22" rx="6" fill="#E76F51"/>
            </svg>
            <span className="block text-[13px] font-body font-bold text-[#475569] mt-1">F</span>
            {/* Bracket */}
            <div className="absolute -right-20 top-[70px] h-[22px] flex items-center">
              <svg width="16" height="22" viewBox="0 0 16 22">
                <path d="M2 0 L8 0 L8 22 L2 22" fill="none" stroke="#E76F51" strokeWidth="1.5"/>
              </svg>
              <span className="text-[13px] font-body text-[#E76F51] ml-1">Extra years</span>
            </div>
          </div>
        </div>

        <h3 className="font-display text-[28px] md:text-[32px] text-[#264653] text-center">Women live longer than men everywhere on Earth.</h3>
        <p className="font-body text-[20px] text-[#475569] text-center mt-4">But how much of that extra time is healthy?</p>

        {/* Stacked bar chart */}
        <div className="flex items-center gap-3 mt-12 mb-6 ml-[120px]">
          <span className="text-[14px] font-body font-semibold text-[#475569]">Sort by:</span>
          {[
            { id: 'pct', label: '% Unhealthy' },
            { id: 'total', label: 'Total extra years' },
            { id: 'name', label: 'Country name' },
          ].map(s => (
            <button key={s.id} onClick={() => setSortBy(s.id)}
              className={`px-4 py-2 rounded-lg text-[14px] font-body cursor-pointer transition-all
                ${sortBy === s.id ? 'bg-[#264653] text-white' : 'bg-gray-100 text-[#475569] hover:bg-gray-200'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Two-column: chart left, info right */}
        <div className="flex gap-8 mt-4">
          {/* Left: bar chart */}
          <div className="flex-1 min-w-0">
            <ExpandableChart title="Gender Longevity Tax">
            <div className="relative">
              {data.map((d, i) => {
                const totalPct = (d.extra_life_years / maxYears) * 100
                const healthyPct = d.extra_life_years > 0 ? (d.extra_healthy_years / d.extra_life_years) * 100 : 0
                const isHovered = hoveredCountry === d.country

                return (
                  <motion.div key={d.country}
                    className="flex items-center gap-3 mb-2 relative"
                    onMouseEnter={() => setHoveredCountry(d.country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}>
                    <span className="w-[100px] text-right text-[14px] font-body font-bold text-[#264653] shrink-0">{d.name}</span>
                    <div className="flex-1 h-8 flex rounded" style={{ width: `${totalPct}%` }}>
                      <div className="h-full rounded-l" style={{ width: `${healthyPct}%`, backgroundColor: '#2D6A4F' }}/>
                      <div className="h-full rounded-r" style={{ width: `${100 - healthyPct}%`, backgroundColor: '#E76F51' }}/>
                    </div>
                    <span className="w-[140px] shrink-0 text-[13px] font-data font-bold text-[#264653]">
                      +{d.extra_life_years.toFixed(1)}y ({d.pct_extra_unhealthy}%)
                    </span>

                    {isHovered && (
                      <div className="absolute left-[110px] top-[36px] z-50 bg-white shadow-xl rounded-xl p-5 border border-gray-200 min-w-[280px]">
                        <p className="text-[16px] font-body font-bold text-[#264653]">{d.name}</p>
                        <p className="text-[15px] font-body text-[#475569] mt-1">Women live {d.extra_life_years.toFixed(1)} years longer than men</p>
                        <p className="text-[15px] font-body font-bold text-[#2D6A4F] mt-1">Healthy extra years: {d.extra_healthy_years.toFixed(1)}</p>
                        <p className="text-[15px] font-body font-bold text-[#E76F51]">Unhealthy extra years: {d.extra_unhealthy_years.toFixed(1)}</p>
                        <p className="text-[14px] font-body text-[#475569] mt-1">{d.pct_extra_unhealthy}% of extra years spent in poor health</p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
            </ExpandableChart>
          </div>

          {/* Right: callouts + legend + explanation */}
          <div className="w-[300px] shrink-0 space-y-4">
            {sortBy === 'pct' && (
              <>
                <div className="bg-[#FEF2F2] rounded-lg p-4 border border-[#E76F51]/30">
                  <p className="text-[15px] font-body font-bold text-[#E76F51]">93% unhealthy: the highest rate.</p>
                  <p className="text-[14px] font-body text-[#475569] mt-1">Swedish women gain only 0.2 healthy extra years compared to men.</p>
                </div>
                <div className="bg-[#F0FDF4] rounded-lg p-4 border border-[#2D6A4F]/30">
                  <p className="text-[15px] font-body font-bold text-[#2D6A4F]">29% unhealthy: the lowest rate.</p>
                  <p className="text-[14px] font-body text-[#475569] mt-1">Mexican women gain 4.0 healthy extra years compared to men.</p>
                </div>
              </>
            )}

            {/* Legend */}
            <div className="space-y-2 pt-2">
              <span className="flex items-center gap-2 text-[14px] font-body text-[#475569]">
                <span className="w-4 h-4 rounded bg-[#2D6A4F]"/> Healthy extra years
              </span>
              <span className="flex items-center gap-2 text-[14px] font-body text-[#475569]">
                <span className="w-4 h-4 rounded bg-[#E76F51]"/> Unhealthy extra years
              </span>
            </div>

            {/* What this shows */}
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
              <p className="text-[14px] font-body font-bold text-[#264653] mb-2">What this shows</p>
              <p className="text-[13px] font-body text-[#334155] leading-relaxed">
                Each bar shows extra years women live vs men. Green = healthy. Coral = poor health. Sweden: 93% unhealthy. Mexico: only 29%.
              </p>
              <p className="text-[12px] font-body italic text-[#64748b] mt-2">Data: Life expectancy (World Bank 2024), HALE (WHO 2021).</p>
            </div>
          </div>
        </div>

        {/* Data caveat */}
        <p className="text-[14px] font-body italic text-[#64748b] text-center mt-8 max-w-[800px] mx-auto">
          Life expectancy data from 2024, HALE from 2021. The year mismatch inflates some values above 100%. The underlying pattern is real; exact magnitudes are approximate.
        </p>
      </div>
    </motion.div>
  )
}

// === MORE FINDINGS KPI CARDS ===
const FINDINGS = [
  {
    id: 'usa-health',
    stat: '$75,698 GDP',
    highlight: '78.9 life expectancy',
    title: 'The richest country is the sickest',
    desc: 'The United States has the highest GDP per capita among our 12 countries, yet the lowest life expectancy (78.9 years), the most years spent in poor health (15), and maternal mortality 4 times higher than Sweden. Among wealthy nations, money has not bought health.',
    detail: { type: 'compare', metrics: ['gdp_per_capita', 'life_expectancy', 'years_poor_health', 'maternal_mortality'], highlight: 'USA' },
  },
  {
    id: 'korea-fertility',
    stat: '0.72',
    highlight: 'children per woman',
    title: 'The steepest fertility collapse ever recorded',
    desc: 'South Korea went from 5.99 children per woman in 1960 to 0.72 today. That is an 88% drop in one generation. Marriage happens at 31, first home at 35. An entire generation has been priced out of family formation by housing costs and work culture.',
    detail: { type: 'single', country: 'KOR', metrics: ['fertility_rate', 'marriage_age', 'first_home_age'] },
  },
  {
    id: 'italy-home',
    stat: '30.2 vs 23.1',
    highlight: 'age of leaving home',
    title: 'Same wealth, 7 years apart on independence',
    desc: 'Italians leave their parents home at 30.2. Swedes leave at 23.1. Both countries are wealthy EU members with similar GDP. The 7-year gap is driven entirely by culture: Italian family proximity norms versus Nordic independence expectations.',
    detail: { type: 'compare', metrics: ['leaving_home_age', 'gdp_per_capita', 'happiness'], highlight: 'ITA,SWE' },
  },
  {
    id: 'france-retire',
    stat: '22.5 years',
    highlight: 'of retirement',
    title: 'France chose leisure. America chose labor.',
    desc: 'French workers effectively retire at 61.9 and get 22.5 years of post-work life. Americans retire at 67.3 and get 17.0 years. Both have similar lifespans. France deliberately structured its society around life after work. The US did not.',
    detail: { type: 'compare', metrics: ['retirement_age', 'years_after_exit', 'happiness'], highlight: 'FRA,USA' },
  },
  {
    id: 'japan-health',
    stat: '73.4 HALE',
    highlight: 'but 6.06 happiness',
    title: 'Healthiest but not happiest',
    desc: 'Japan has the highest healthy life expectancy in our dataset (73.4 years) but one of the lowest happiness scores (6.06) among wealthy nations. Physical health alone does not create wellbeing. Work culture, social isolation, and pressure matter.',
    detail: { type: 'single', country: 'JPN', metrics: ['hale', 'happiness', 'retirement_age'] },
  },
  {
    id: 'sweden-marriage',
    stat: 'Age 35',
    highlight: 'marriage comes last',
    title: 'In Sweden, every milestone happens before marriage',
    desc: 'Swedish women leave home at 23, finish education at 25, move in with a partner at 26, have their first baby at 30, buy a home at 30.5, and finally marry at 34.8. Marriage is not a gateway to adulthood. It is a celebration after everything else is done.',
    detail: { type: 'single', country: 'SWE', metrics: ['leaving_home_age', 'education_completion_age', 'cohabitation_age', 'first_birth_age', 'first_home_age', 'marriage_age'] },
  },
]

function FindingsCards() {
  const [expanded, setExpanded] = useState(null)
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  function scroll(dir) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 340, behavior: 'smooth' })
    setTimeout(checkScroll, 400)
  }

  const CARD_COLORS = [
    { bg: 'bg-gradient-to-br from-[#fef2f2] to-[#fff1f2]', border: 'border-[#E76F51]/40', accent: '#E76F51' },
    { bg: 'bg-gradient-to-br from-[#fef3c7] to-[#fff7ed]', border: 'border-[#E9C46A]/40', accent: '#E9C46A' },
    { bg: 'bg-gradient-to-br from-[#ecfdf5] to-[#f0fdf4]', border: 'border-[#2D6A4F]/40', accent: '#2D6A4F' },
    { bg: 'bg-gradient-to-br from-[#eff6ff] to-[#f0f9ff]', border: 'border-[#457B9D]/40', accent: '#457B9D' },
    { bg: 'bg-gradient-to-br from-[#faf5ff] to-[#f5f3ff]', border: 'border-[#7B2D8E]/40', accent: '#7B2D8E' },
    { bg: 'bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff]', border: 'border-[#00897B]/40', accent: '#00897B' },
  ]

  return (
    <div className="bg-[#f8fafc] py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h3 className="font-display text-[28px] md:text-[32px] text-[#264653] mb-2">More Findings</h3>
        <p className="font-body text-[16px] text-[#475569] mb-8">Counterintuitive patterns hiding in the data. Click any card to see the evidence.</p>

        {/* Scroll container with arrows */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-[#264653] hover:text-white transition-all text-[#264653]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 3L5 8l5 5"/></svg>
            </button>
          )}
          {/* Right arrow */}
          {canScrollRight && (
            <button onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-[#264653] hover:text-white transition-all text-[#264653]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3l5 5-5 5"/></svg>
            </button>
          )}

          <div ref={scrollRef} onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {FINDINGS.map((f, i) => {
              const colors = CARD_COLORS[i % CARD_COLORS.length]
              const isActive = expanded === f.id
              return (
                <motion.div key={f.id}
                  onClick={() => setExpanded(isActive ? null : f.id)}
                  className={`snap-start shrink-0 w-[320px] rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 ${colors.bg} ${colors.border} ${isActive ? 'ring-2 ring-[#264653] scale-[1.02]' : 'hover:shadow-xl hover:scale-[1.01]'}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}>
                  {/* Top accent bar */}
                  <div className="w-12 h-1 rounded-full mb-4" style={{ backgroundColor: colors.accent }}/>
                  {/* Stat */}
                  <div className="mb-3">
                    <span className="text-[28px] font-data font-bold text-[#264653]">{f.stat}</span>
                    <span className="text-[14px] font-body text-[#475569] ml-2">{f.highlight}</span>
                  </div>
                  {/* Title */}
                  <p className="text-[16px] font-body font-bold text-[#264653] mb-2 leading-tight">{f.title}</p>
                  {/* Description */}
                  <p className="text-[13px] font-body text-[#475569] leading-relaxed line-clamp-3">{f.desc}</p>
                  {/* CTA */}
                  <div className="flex items-center gap-1 mt-4" style={{ color: colors.accent }}>
                    <span className="text-[13px] font-body font-semibold">{isActive ? 'Showing data' : 'Tap to reveal'}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {isActive ? <path d="M3 8l4-4 4 4"/> : <path d="M3 6l4 4 4-4"/>}
                    </svg>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Expanded detail view */}
        <AnimatePresence>
          {expanded && (() => {
            const f = FINDINGS.find(x => x.id === expanded)
            if (!f) return null
            const countries = f.detail.highlight?.split(',') || []
            const colors = CARD_COLORS[FINDINGS.indexOf(f) % CARD_COLORS.length]

            return (
              <motion.div key={expanded}
                className="mt-6 bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-8 rounded-full" style={{ backgroundColor: colors.accent }}/>
                      <p className="font-body text-[20px] font-bold text-[#264653]">{f.title}</p>
                    </div>
                    <p className="font-body text-[15px] text-[#475569] max-w-[700px] leading-relaxed">{f.desc}</p>
                  </div>
                  <button onClick={() => setExpanded(null)}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-[#475569] cursor-pointer hover:bg-[#264653] hover:text-white transition-colors shrink-0">
                    <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M2 2l8 8M10 2l-8 8"/></svg>
                  </button>
                </div>

                {/* Data table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-[13px] font-body font-bold text-[#475569]">Country</th>
                        {f.detail.metrics.map(m => (
                          <th key={m} className="py-3 px-4 text-[13px] font-body font-bold text-[#475569]">
                            {m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(countries.length > 0 ? correlations.filter(c => countries.includes(c.country)) : correlations).map((c, idx) => (
                        <tr key={c.country} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${countries.includes(c.country) ? 'bg-[#264653]/5 font-semibold' : ''}`}>
                          <td className="py-3 px-4 text-[14px] font-body text-[#264653]">{c.name}</td>
                          {f.detail.metrics.map(m => (
                            <td key={m} className="py-3 px-4 text-[15px] font-data text-[#264653]">
                              {c[m] != null ? (c[m] >= 1000 ? `$${(c[m]/1000).toFixed(0)}k` : typeof c[m] === 'number' ? c[m].toFixed(1) : c[m]) : '--'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[12px] font-body italic text-[#64748b] mt-3">Highlighted rows are the countries referenced in this finding.</p>
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>
    </div>
  )
}

// === MAIN EXPORT ===
export default function Discoveries() {
  return (
    <section id="discoveries">
      <LongevityDiscovery />
      <MarriageDiscovery />
      <SequenceDiscovery />
      <FindingsCards />
    </section>
  )
}
