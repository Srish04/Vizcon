import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import countryProfiles from '../data/country_profiles.json'
import correlationNarratives from '../data/correlation_narratives.json'
import pairStories from '../data/pair_story_analysis.json'

// === CONFIG ===
const MARKER_CONFIG = [
  { key: 'menarche', label: 'Puberty', color: '#C2185B', annotation: 'Biologically constrained. Nutrition and healthcare drive the small variation.' },
  { key: 'education', label: 'Education', color: '#2D6A4F', annotation: 'Reflects years of schooling available. Longer education delays every marker after it.' },
  { key: 'leaving_home', label: 'Leave Home', color: '#2A9D8F', annotation: 'Cultural and economic. Southern European and South Asian youth stay home longer.' },
  { key: 'cohabitation', label: 'Cohabitation', color: '#00897B', annotation: 'In Nordic countries, cohabitation replaces early marriage. In others, it barely exists.' },
  { key: 'first_home', label: 'First Home', color: '#48BFE3', annotation: 'Driven by housing costs and cultural norms around family property.' },
  { key: 'marriage', label: 'Marriage', color: '#E76F51', annotation: 'The single most variable social marker. Correlates with GDP, equality, and health outcomes.' },
  { key: 'first_baby', label: 'First Child', color: '#E9C46A', annotation: 'Later parenthood correlates with higher education and GDP, but also lower fertility rates.' },
  { key: 'menopause', label: 'Menopause', color: '#AB47BC', annotation: 'Biologically constrained but nutrition affects timing. Shorter in South Asia.' },
  { key: 'retirement_age', label: 'Retirement', color: '#457B9D', annotation: 'Policy-driven. France retires 6 years before Korea despite similar life expectancy.' },
]

const OUTCOME_CONFIG = [
  { key: 'happiness', label: 'Happiness', format: v => v?.toFixed(2), unit: '/10', note: null },
  { key: 'life_expectancy', label: 'Life Expectancy', format: v => v?.toFixed(1), unit: 'years', note: null },
  { key: 'hale', label: 'Healthy Years (HALE)', format: v => v?.toFixed(1), unit: 'years', note: null },
  { key: 'gdp_per_capita', label: 'GDP per Capita', format: v => v ? `$${(v/1000).toFixed(1)}k` : null, unit: 'PPP', note: null },
  { key: 'female_lfpr', label: 'Female LFPR', format: v => v ? `${v.toFixed(1)}%` : null, unit: '%', note: null },
  { key: 'fertility_rate', label: 'Fertility Rate', format: v => v != null ? v.toFixed(2) : '—', unit: 'children', note: null },
  { key: 'gender_inequality_index', label: 'Gender Inequality Index (GII)', format: v => v?.toFixed(3), unit: 'index', note: 'Lower is better. 0 = perfect gender equality.' },
]

const SUGGESTED_PAIRS = [
  { a: 'SWE', b: 'IND', label: 'Sweden vs India', tagline: 'Marriage age worlds apart' },
  { a: 'FRA', b: 'MEX', label: 'France vs Mexico', tagline: 'Same lifespan, different retirement' },
  { a: 'JPN', b: 'IND', label: 'Japan vs India', tagline: 'Healthy years divide' },
  { a: 'ITA', b: 'BRA', label: 'Italy vs Brazil', tagline: 'Living together, worlds apart' },
  { a: 'KOR', b: 'FRA', label: 'S. Korea vs France', tagline: 'The squeeze vs the spread' },
  { a: 'USA', b: 'JPN', label: 'USA vs Japan', tagline: "Money cannot buy health" },
]

const COUNTRY_COLORS = {
  SWE:'#2D6A4F',DNK:'#2D6A4F',ITA:'#457B9D',FRA:'#457B9D',DEU:'#457B9D',AUS:'#457B9D',
  JPN:'#E76F51',KOR:'#E76F51',USA:'#C2185B',BRA:'#C2185B',MEX:'#C2185B',IND:'#7B2D8E',
}

function getProfile(code) { return countryProfiles.find(c => c.country === code) }
function getMarkerVal(profile, key) { return profile?.milestones?.[key]?.value ?? null }
function getOVal(profile, key) { return profile?.outcomes?.[key]?.value ?? profile?.milestones?.[key]?.value ?? null }

// === PICKER ===
function Picker({ leftCode, rightCode, setLeftCode, setRightCode, onCompare }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="text-[13px] font-data text-[#475569] block mb-1">Country A</label>
          <select value={leftCode} onChange={e => setLeftCode(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-[16px] font-body bg-white">
            {countryProfiles.map(c => <option key={c.country} value={c.country}>{c.flag} {c.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-3"><span className="text-gray-300 font-display text-xl">vs</span></div>
        <div className="flex-1">
          <label className="text-[13px] font-data text-[#475569] block mb-1">Country B</label>
          <select value={rightCode} onChange={e => setRightCode(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-[16px] font-body bg-white">
            {countryProfiles.map(c => <option key={c.country} value={c.country}>{c.flag} {c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {SUGGESTED_PAIRS.map(p => (
          <button key={p.label} onClick={() => { setLeftCode(p.a); setRightCode(p.b); onCompare(p.a, p.b) }}
            className="px-4 py-2 rounded-full text-[14px] font-body border border-gray-200 bg-white text-[#475569] hover:border-[#264653] cursor-pointer transition-all">
            {p.label} <span className="text-[13px] text-[#64748b] ml-1">{p.tagline}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onCompare(leftCode, rightCode)}
        className="px-8 py-3 rounded-lg bg-[#264653] text-white font-body text-[16px] font-semibold cursor-pointer hover:opacity-90 transition-opacity">
        Compare
      </button>
    </div>
  )
}

// === MILESTONE TIMELINE ===
function MarkerTimeline({ left, right }) {
  const [hoveredRow, setHoveredRow] = useState(null)

  const rows = useMemo(() => {
    return MARKER_CONFIG.map(mc => {
      const lv = getMarkerVal(left, mc.key)
      const rv = getMarkerVal(right, mc.key)
      if (lv == null && rv == null) return null
      const gap = (lv != null && rv != null) ? lv - rv : null
      return { ...mc, leftVal: lv, rightVal: rv, gap }
    }).filter(Boolean)
  }, [left, right])

  return (
    <div className="bg-white rounded-xl shadow-sm p-10 mb-8 border border-gray-200">
      <h3 className="font-body text-[22px] font-bold text-[#264653] mb-1">Life Marker Timeline</h3>
      <p className="font-body text-[16px] text-[#475569] mb-8">Age 12 to 70. Every marker compared. Values on the right show ages.</p>

      <div className="space-y-0">
        {rows.map((m, i) => {
          const minAge = 12, maxAge = 70
          const leftPct = m.leftVal != null ? ((m.leftVal - minAge) / (maxAge - minAge)) * 100 : null
          const rightPct = m.rightVal != null ? ((m.rightVal - minAge) / (maxAge - minAge)) * 100 : null
          const isHovered = hoveredRow === m.key

          return (
            <motion.div key={m.key}
              className={`flex items-center gap-4 relative cursor-pointer transition-colors ${isHovered ? 'bg-[#f8fafc]' : ''}`}
              style={{ height: '60px', borderBottom: '1px solid #e5e7eb' }}
              onMouseEnter={() => setHoveredRow(m.key)}
              onMouseLeave={() => setHoveredRow(null)}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.12 }}>
              {/* Label */}
              <span className="w-[130px] text-right pr-4 text-[16px] font-body font-bold text-[#264653] shrink-0">{m.label}</span>
              {/* Track */}
              <div className="flex-1 relative h-full flex items-center">
                <div className="absolute left-0 right-0 h-[3px] bg-[#e5e7eb] rounded-full"/>
                {/* Connecting line */}
                {leftPct != null && rightPct != null && (
                  <div className="absolute h-[3px] rounded-full"
                    style={{
                      left: `${Math.min(leftPct, rightPct)}%`,
                      width: `${Math.abs(leftPct - rightPct)}%`,
                      backgroundColor: `${m.color}66`,
                      backgroundImage: `repeating-linear-gradient(90deg, ${m.color}66 0, ${m.color}66 6px, transparent 6px, transparent 10px)`,
                      height: '3px',
                    }}/>
                )}
                {/* Gap pill */}
                {m.gap != null && Math.abs(m.gap) > 0.3 && (
                  <div className="absolute -translate-x-1/2 -top-1 z-10"
                    style={{ left: `${(Math.min(leftPct, rightPct) + Math.max(leftPct, rightPct)) / 2}%` }}>
                    <span className="inline-block bg-white border-2 rounded-full px-3 py-0.5 text-[14px] font-body font-bold shadow-sm"
                      style={{ borderColor: m.color, color: m.color }}>
                      {m.gap > 0 ? '+' : ''}{m.gap.toFixed(1)}yr
                    </span>
                  </div>
                )}
                {/* Country A dot (circle) */}
                {leftPct != null && (
                  <div className="absolute -translate-x-1/2 rounded-full border-2 border-white"
                    style={{ left: `${leftPct}%`, width: '18px', height: '18px', backgroundColor: m.color }}/>
                )}
                {/* Country B dot (square) */}
                {rightPct != null && (
                  <div className="absolute -translate-x-1/2 rounded-sm border-2 border-white"
                    style={{ left: `${rightPct}%`, width: '18px', height: '18px', backgroundColor: m.color, opacity: 0.7 }}/>
                )}
              </div>
              {/* Values */}
              <div className="w-[70px] shrink-0 text-right">
                {m.leftVal != null && <span className="block text-[16px] font-data font-bold text-[#264653]">{m.leftVal.toFixed(1)}</span>}
                {m.rightVal != null && <span className="block text-[16px] font-data font-bold text-[#475569]">{m.rightVal.toFixed(1)}</span>}
              </div>
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute left-[130px] top-[58px] z-50 bg-white shadow-xl rounded-xl p-5 border border-gray-200 min-w-[320px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }}/>
                    <span className="text-[16px] font-body font-bold text-[#264653]">{m.label}</span>
                  </div>
                  {m.leftVal != null && <p className="text-[15px] font-body text-[#264653]">{left.name}: {m.leftVal.toFixed(1)} years</p>}
                  {m.rightVal != null && <p className="text-[15px] font-body text-[#475569]">{right.name}: {m.rightVal.toFixed(1)} years</p>}
                  {m.gap != null && <p className="text-[15px] font-body font-bold mt-1" style={{ color: m.color }}>Gap: {Math.abs(m.gap).toFixed(1)} years</p>}
                  <p className="text-[14px] font-body text-[#475569] mt-2 leading-relaxed">{m.annotation}</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Age axis */}
      <div className="flex justify-between ml-[146px] mr-[70px] mt-3 text-[13px] font-body text-[#6b7280]">
        {[12, 20, 30, 40, 50, 60, 70].map(a => <span key={a}>{a}</span>)}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 ml-[146px] text-[14px] font-body text-[#475569]">
        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-[#264653]"/> {left.name} (circle)</span>
        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-sm bg-[#264653] opacity-70"/> {right.name} (square)</span>
        <span className="text-[13px] italic text-[#94a3b8]">• Dot color = marker type</span>
      </div>
      <p className="ml-[146px] mt-2 text-[13px] font-body italic text-[#64748b]">Markers with no data for either country are not shown.</p>
    </div>
  )
}

// === OUTCOME METRICS (Flip Cards) ===
const OUTCOME_CONTEXT = {
  happiness: (left, right) => {
    const lMarriage = left.milestones?.marriage?.value
    const rMarriage = right.milestones?.marriage?.value
    const gap = Math.abs((left.outcomes?.happiness?.value || 0) - (right.outcomes?.happiness?.value || 0))
    return `Happiness correlates with later marriage and higher GDP. Countries where people marry later tend to report higher life satisfaction. The ${gap.toFixed(1)}-point gap here reflects differences in economic security and social freedom.`
  },
  life_expectancy: (left, right) => {
    return `Life expectancy tracks closely with healthcare access, GDP, and education levels. Countries completing more years of education tend to live longer. The gap here reflects differences in healthcare infrastructure and nutrition.`
  },
  hale: (left, right) => {
    return `HALE (Healthy Life Expectancy) measures years lived without major disease. It correlates strongly with GDP and education. A country can have high life expectancy but low HALE if many years are spent in poor health.`
  },
  gdp_per_capita: (left, right) => {
    const lMarriage = left.milestones?.marriage?.value
    const rMarriage = right.milestones?.marriage?.value
    return `GDP per capita (PPP) has an r=0.78 correlation with marriage age. Countries where women marry later tend to have higher economic output. Delayed marriage allows more education and workforce participation. ${lMarriage && rMarriage ? `Marriage age gap here: ${Math.abs(lMarriage - rMarriage).toFixed(1)} years.` : ''}`
  },
  female_lfpr: (left, right) => {
    return `Female labor force participation correlates strongly with marriage age and education. When women marry later and stay in school longer, they enter and remain in the workforce at higher rates. This metric measures what percentage of working-age women are economically active.`
  },
  fertility_rate: (left, right) => {
    return `Fertility rate tends to drop as marriage age rises and education lengthens. Countries where women marry young tend to have more children. Below 2.1 (replacement level), populations shrink without immigration. Nearly all 12 countries in this dataset are below replacement.`
  },
  gender_inequality_index: (left, right) => {
    return `The Gender Inequality Index (0 = perfect equality) correlates r=-0.90 with marriage age, the strongest correlation in the dataset. Countries where women marry later have dramatically lower gender inequality. This reflects women's access to education, healthcare, and economic participation.`
  },
}

function OutcomeMetrics({ left, right, leftCode, rightCode }) {
  const [flipped, setFlipped] = useState({})

  function toggleFlip(key) {
    setFlipped(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const outcomes = useMemo(() => {
    return OUTCOME_CONFIG.map(oc => {
      const lv = getOVal(left, oc.key)
      const rv = getOVal(right, oc.key)
      // Compute 12-country average
      const allVals = countryProfiles.map(c => c.outcomes?.[oc.key]?.value).filter(v => v != null)
      const avg = allVals.length > 0 ? allVals.reduce((s,v)=>s+v,0)/allVals.length : null
      return { ...oc, leftVal: lv, rightVal: rv, avg }
    })
  }, [left, right])

  return (
    <div className="mb-8">
      <h3 className="font-display text-[28px] text-[#264653] mb-1">Does timing matter?</h3>
      <p className="font-body text-[16px] text-[#475569] mb-6">How these two countries compare on life outcomes. Click a card to learn why it matters.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outcomes.map((o, i) => {
          const lf = o.format(o.leftVal)
          const rf = o.format(o.rightVal)
          const invertedMetric = o.key === 'gender_inequality_index'
          // Border color logic: both above avg = green, both below = coral, mixed = higher's region color
          let borderColor = '#264653'
          if (o.avg != null && o.leftVal != null && o.rightVal != null) {
            const lAbove = invertedMetric ? o.leftVal < o.avg : o.leftVal > o.avg
            const rAbove = invertedMetric ? o.rightVal < o.avg : o.rightVal > o.avg
            if (lAbove && rAbove) borderColor = '#2D6A4F'
            else if (!lAbove && !rAbove) borderColor = '#E76F51'
            else borderColor = (invertedMetric ? o.leftVal < o.rightVal : o.leftVal > o.rightVal) ? COUNTRY_COLORS[leftCode] || '#264653' : COUNTRY_COLORS[rightCode] || '#E76F51'
          }
          // Bar proportions
          const total = (o.leftVal || 0) + (o.rightVal || 0)
          const lPct = total > 0 && o.leftVal != null ? (o.leftVal / total) * 100 : 50

          const contextText = OUTCOME_CONTEXT[o.key] ? OUTCOME_CONTEXT[o.key](left, right) : 'No additional context available for this metric.'

          return (
            <div key={o.key} className="min-h-[220px] cursor-pointer" style={{ perspective: '1000px' }} onClick={() => toggleFlip(o.key)}>
              <motion.div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d', transform: flipped[o.key] ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.5s' }}>
                {/* Front */}
                <div className="min-h-[220px]" style={{ backfaceVisibility: 'hidden' }}>
                  <motion.div className="bg-white rounded-xl border border-gray-200 p-6 h-full relative"
                    style={{ borderLeft: `4px solid ${borderColor}` }}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}>
                    {/* Flip indicator */}
                    <div className="absolute top-2 right-2 text-[#94a3b8] text-[11px] flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 6a4 4 0 0 1 8 0M10 6a4 4 0 0 1-8 0"/><path d="M10 3v3h-3"/></svg>
                      flip
                    </div>
                    <p className="text-[13px] font-body font-bold uppercase text-[#64748b] tracking-wide mb-3">{o.label}</p>
                    <div className="mb-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[14px] font-body text-[#264653]">{left.name}</span>
                        <span className="text-[28px] font-data font-bold text-[#264653]">{lf || '--'}</span>
                      </div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[14px] font-body text-[#475569]">{right.name}</span>
                        <span className="text-[28px] font-data text-[#475569]">{rf || '--'}</span>
                      </div>
                      {o.avg != null && (
                        <div className="flex justify-between items-baseline mt-1">
                          <span className="text-[14px] font-body text-[#94a3b8]">12-country average</span>
                          <span className="text-[14px] font-data text-[#94a3b8]">{o.format(o.avg)}</span>
                        </div>
                      )}
                    </div>
                    {/* Comparison bar */}
                    <div className="flex h-2 rounded overflow-hidden">
                      <div className="h-full rounded-l" style={{ width: `${lPct}%`, backgroundColor: '#2D6A4F', opacity: 0.8 }}/>
                      <div className="h-full rounded-r" style={{ width: `${100-lPct}%`, backgroundColor: '#E76F51', opacity: 0.8 }}/>
                    </div>
                    {o.note && <p className="text-[12px] font-body italic text-[#94a3b8] mt-2">{o.note}</p>}
                  </motion.div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 min-h-[220px]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="bg-[#f8fafc] rounded-xl border border-gray-200 p-7 h-full flex flex-col justify-center shadow-inner" style={{ borderLeft: `4px solid ${borderColor}` }}>
                    <p className="text-[12px] font-body font-bold uppercase text-[#64748b] tracking-wide mb-3">{o.label}: Why it matters</p>
                    <p className="text-[14px] font-body text-[#1e293b] leading-relaxed">{contextText}</p>
                    <p className="text-[11px] font-body text-[#94a3b8] mt-4 italic flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2 6a4 4 0 0 1 8 0M10 6a4 4 0 0 1-8 0"/><path d="M10 3v3h-3"/></svg>
                      Click to flip back
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// === CORRELATION CONNECTIONS ===
function CorrelationConnections({ left, right }) {
  const connections = useMemo(() => {
    if (!correlationNarratives.correlations) return []
    return correlationNarratives.correlations
      .filter(cn => {
        const lm = getMarkerVal(left, cn.milestone) ?? getMarkerVal(left, cn.milestone + '_age')
        const rm = getMarkerVal(right, cn.milestone) ?? getMarkerVal(right, cn.milestone + '_age')
        const lo = getOVal(left, cn.outcome)
        const ro = getOVal(right, cn.outcome)
        return lm != null && rm != null && lo != null && ro != null
      })
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
      .slice(0, 3)
      .map(cn => {
        const mKey = getMarkerVal(left, cn.milestone) != null ? cn.milestone : cn.milestone + '_age'
        const lm = getMarkerVal(left, mKey)
        const rm = getMarkerVal(right, mKey)
        const lo = getOVal(left, cn.outcome)
        const ro = getOVal(right, cn.outcome)
        const mc = MARKER_CONFIG.find(m => m.key === mKey || m.key === cn.milestone)
        return { ...cn, lm, rm, lo, ro, mColor: mc?.color || '#264653', mLabel: mc?.label || cn.milestone }
      })
  }, [left, right])

  if (connections.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="font-display text-[24px] text-[#264653] mb-1">Connections between timing and outcomes</h3>
      <p className="font-body text-[16px] text-[#475569] mb-6">How marker differences relate to outcome differences for this pair</p>
      {connections.map((cn, i) => (
        <div key={i} className="bg-[#f8fafc] rounded-xl p-8 mb-4 border border-[#e2e8f0]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] gap-4 items-center mb-4">
            {/* Left: milestone */}
            <div>
              <p className="text-[16px] font-body font-bold" style={{ color: cn.mColor }}>{cn.mLabel}</p>
              <p className="text-[14px] font-body text-[#475569]">{left.name}</p>
              <p className="text-[28px] font-data font-bold text-[#264653]">{cn.lm?.toFixed(1)}</p>
              <p className="text-[14px] font-body text-[#475569]">{right.name}</p>
              <p className="text-[28px] font-data font-bold text-[#475569]">{cn.rm?.toFixed(1)}</p>
              <p className="text-[18px] font-body font-bold mt-1" style={{ color: cn.mColor }}>
                {cn.lm > cn.rm ? '+' : ''}{(cn.lm - cn.rm).toFixed(1)} years
              </p>
            </div>
            {/* Center: arrow + r value */}
            <div className="flex flex-col items-center gap-2">
              <svg width="60" height="24" viewBox="0 0 60 24">
                <line x1="0" y1="12" x2="48" y2="12" stroke="#26465366" strokeWidth="2"/>
                <polygon points="48,6 60,12 48,18" fill="#26465366"/>
              </svg>
              <span className="text-[14px] font-data font-bold text-[#264653]">r = {cn.r.toFixed(2)}</span>
              <span className={`text-[13px] font-body font-semibold px-3 py-1 rounded-full
                ${cn.group === 'causal' ? 'bg-blue-100 text-blue-800' : ''}
                ${cn.group === 'feedback' ? 'bg-green-100 text-green-800' : ''}
                ${cn.group === 'common_cause' ? 'bg-amber-100 text-amber-800' : ''}`}>
                {cn.group === 'causal' && 'Causal'}
                {cn.group === 'feedback' && 'Feedback loop'}
                {cn.group === 'common_cause' && 'Shared drivers'}
              </span>
            </div>
            {/* Right: outcome */}
            <div>
              <p className="text-[16px] font-body font-bold text-[#457B9D]">{cn.outcome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <p className="text-[14px] font-body text-[#475569]">{left.name}</p>
              <p className="text-[28px] font-data font-bold text-[#264653]">{cn.lo >= 1000 ? `$${(cn.lo/1000).toFixed(0)}k` : cn.lo?.toFixed(2)}</p>
              <p className="text-[14px] font-body text-[#475569]">{right.name}</p>
              <p className="text-[28px] font-data font-bold text-[#475569]">{cn.ro >= 1000 ? `$${(cn.ro/1000).toFixed(0)}k` : cn.ro?.toFixed(2)}</p>
            </div>
          </div>
          <p className="font-body text-[16px] text-[#334155] leading-relaxed">{cn.mechanism}</p>
          <p className="font-body text-[13px] italic text-[#64748b] mt-2">Correlation, not causation. N=12 countries.</p>
        </div>
      ))}
    </div>
  )
}

// === INSIGHT CHART COMPONENT ===
function InsightChart({ type, data }) {
  if (type === 'marriage-gdp') {
    const { lMarriage, rMarriage, lGDP, rGDP, leftName, rightName } = data
    const maxMarriage = Math.max(lMarriage, rMarriage)
    const maxGDP = Math.max(lGDP, rGDP)
    return (
      <div className="grid grid-cols-2 gap-8">
        {/* Marriage Age comparison */}
        <div>
          <p className="text-[13px] font-body font-bold text-[#E76F51] uppercase tracking-wide mb-3">Marriage Age (years)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#264653] mb-1">
                <span className="font-semibold">{leftName}</span>
                <span className="font-data font-bold">{lMarriage.toFixed(1)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(lMarriage / maxMarriage) * 100}%`, backgroundColor: '#E76F51' }}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#475569] mb-1">
                <span className="font-semibold">{rightName}</span>
                <span className="font-data font-bold">{rMarriage.toFixed(1)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(rMarriage / maxMarriage) * 100}%`, backgroundColor: '#E76F51', opacity: 0.6 }}/>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-body text-[#94a3b8] mt-2">Gap: {Math.abs(lMarriage - rMarriage).toFixed(1)} years</p>
        </div>
        {/* GDP comparison */}
        <div>
          <p className="text-[13px] font-body font-bold text-[#457B9D] uppercase tracking-wide mb-3">GDP per Capita (PPP)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#264653] mb-1">
                <span className="font-semibold">{leftName}</span>
                <span className="font-data font-bold">${(lGDP/1000).toFixed(0)}k</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(lGDP / maxGDP) * 100}%`, backgroundColor: '#457B9D' }}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#475569] mb-1">
                <span className="font-semibold">{rightName}</span>
                <span className="font-data font-bold">${(rGDP/1000).toFixed(0)}k</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(rGDP / maxGDP) * 100}%`, backgroundColor: '#457B9D', opacity: 0.6 }}/>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-body text-[#94a3b8] mt-2">Ratio: {(Math.max(lGDP, rGDP) / Math.min(lGDP, rGDP)).toFixed(1)}x</p>
        </div>
      </div>
    )
  }

  if (type === 'fertility-le') {
    const { lFert, rFert, lLE, rLE, leftName, rightName } = data
    const maxFert = Math.max(lFert, rFert)
    const maxLE = Math.max(lLE, rLE)
    return (
      <div className="grid grid-cols-2 gap-8">
        {/* Fertility Rate */}
        <div>
          <p className="text-[13px] font-body font-bold text-[#264653] uppercase tracking-wide mb-3">Fertility Rate (children/woman)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#264653] mb-1">
                <span className="font-semibold">{leftName}</span>
                <span className="font-data font-bold">{lFert.toFixed(2)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(lFert / maxFert) * 100}%`, backgroundColor: '#264653' }}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#475569] mb-1">
                <span className="font-semibold">{rightName}</span>
                <span className="font-data font-bold">{rFert.toFixed(2)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(rFert / maxFert) * 100}%`, backgroundColor: '#264653', opacity: 0.6 }}/>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-body text-[#94a3b8] mt-2">Replacement level: 2.1</p>
        </div>
        {/* Life Expectancy */}
        <div>
          <p className="text-[13px] font-body font-bold text-[#2D6A4F] uppercase tracking-wide mb-3">Life Expectancy (years)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#264653] mb-1">
                <span className="font-semibold">{leftName}</span>
                <span className="font-data font-bold">{lLE.toFixed(1)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(lLE / maxLE) * 100}%`, backgroundColor: '#2D6A4F' }}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#475569] mb-1">
                <span className="font-semibold">{rightName}</span>
                <span className="font-data font-bold">{rLE.toFixed(1)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(rLE / maxLE) * 100}%`, backgroundColor: '#2D6A4F', opacity: 0.6 }}/>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-body text-[#94a3b8] mt-2">Gap: {Math.abs(lLE - rLE).toFixed(1)} years</p>
        </div>
      </div>
    )
  }

  if (type === 'education-happiness') {
    const { lEdu, rEdu, lHappy, rHappy, leftName, rightName } = data
    const maxEdu = Math.max(lEdu, rEdu)
    const maxHappy = Math.max(lHappy, rHappy)
    return (
      <div className="grid grid-cols-2 gap-8">
        {/* Education */}
        <div>
          <p className="text-[13px] font-body font-bold text-[#2D6A4F] uppercase tracking-wide mb-3">Education Completion (age)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#264653] mb-1">
                <span className="font-semibold">{leftName}</span>
                <span className="font-data font-bold">{lEdu.toFixed(1)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(lEdu / maxEdu) * 100}%`, backgroundColor: '#2D6A4F' }}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#475569] mb-1">
                <span className="font-semibold">{rightName}</span>
                <span className="font-data font-bold">{rEdu.toFixed(1)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(rEdu / maxEdu) * 100}%`, backgroundColor: '#2D6A4F', opacity: 0.6 }}/>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-body text-[#94a3b8] mt-2">Gap: {Math.abs(lEdu - rEdu).toFixed(1)} years</p>
        </div>
        {/* Happiness */}
        <div>
          <p className="text-[13px] font-body font-bold text-[#E9C46A] uppercase tracking-wide mb-3">Happiness Score (/10)</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#264653] mb-1">
                <span className="font-semibold">{leftName}</span>
                <span className="font-data font-bold">{lHappy.toFixed(2)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(lHappy / maxHappy) * 100}%`, backgroundColor: '#E9C46A' }}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-body text-[#475569] mb-1">
                <span className="font-semibold">{rightName}</span>
                <span className="font-data font-bold">{rHappy.toFixed(2)}</span>
              </div>
              <div className="h-6 bg-[#e5e7eb] rounded-md overflow-hidden">
                <div className="h-full rounded-md" style={{ width: `${(rHappy / maxHappy) * 100}%`, backgroundColor: '#E9C46A', opacity: 0.6 }}/>
              </div>
            </div>
          </div>
          <p className="text-[11px] font-body text-[#94a3b8] mt-2">Gap: {Math.abs(lHappy - rHappy).toFixed(2)} points</p>
        </div>
      </div>
    )
  }

  return null
}

// === KEY INSIGHTS ===
function KeyInsights({ left, right }) {
  const insights = useMemo(() => {
    const results = []

    // Insight 1: Marriage-GDP paradox or correlation
    const lMarriage = getMarkerVal(left, 'marriage')
    const rMarriage = getMarkerVal(right, 'marriage')
    const lGDP = getOVal(left, 'gdp_per_capita')
    const rGDP = getOVal(right, 'gdp_per_capita')
    if (lMarriage && rMarriage && lGDP && rGDP) {
      const marriageGap = Math.abs(lMarriage - rMarriage)
      const gdpRatio = Math.max(lGDP, rGDP) / Math.min(lGDP, rGDP)
      const laterMarrier = lMarriage > rMarriage ? left : right
      const richerCountry = lGDP > rGDP ? left : right
      const insightData = { lMarriage, rMarriage, lGDP, rGDP, leftName: left.name, rightName: right.name }
      if (laterMarrier.country === richerCountry.country) {
        results.push({
          icon: '💰',
          color: '#E76F51',
          headline: `${marriageGap.toFixed(0)}-year marriage gap → ${gdpRatio.toFixed(1)}x GDP difference`,
          text: `${laterMarrier.name} marries ${marriageGap.toFixed(1)} years later and has ${gdpRatio.toFixed(1)}x the GDP. Later marriage correlates with more education, more workforce years, and higher economic output. Cultural norms around women's independence and education access drive this gap.`,
          type: 'marriage-gdp',
          data: insightData
        })
      } else {
        results.push({
          icon: '🔄',
          color: '#E76F51',
          headline: `Later marriage doesn't always mean more wealth`,
          text: `${laterMarrier.name} marries later at ${Math.max(lMarriage, rMarriage).toFixed(1)} but ${richerCountry.name} has ${gdpRatio.toFixed(1)}x higher GDP. Cultural and historical factors (natural resources, industrial base, colonial history) outweigh the timing effect here.`,
          type: 'marriage-gdp',
          data: insightData
        })
      }
    }

    // Insight 2: Fertility vs Life Expectancy tradeoff
    const lFert = getMarkerVal(left, 'fertility_rate')
    const rFert = getMarkerVal(right, 'fertility_rate')
    const lLE = getOVal(left, 'life_expectancy')
    const rLE = getOVal(right, 'life_expectancy')
    if (lFert && rFert && lLE && rLE) {
      const higherFert = lFert > rFert ? left : right
      const longerLived = lLE > rLE ? left : right
      const insightData = { lFert, rFert, lLE, rLE, leftName: left.name, rightName: right.name }
      if (higherFert.country !== longerLived.country) {
        results.push({
          icon: '⚖️',
          color: '#264653',
          headline: `More children, fewer years: the demographic tradeoff`,
          text: `${higherFert.name} has higher fertility (${Math.max(lFert, rFert).toFixed(2)}) but ${longerLived.name} lives ${Math.abs(lLE - rLE).toFixed(1)} years longer. Cultural attitudes toward family size, access to contraception, and healthcare infrastructure all play a role in this tradeoff.`,
          type: 'fertility-le',
          data: insightData
        })
      } else {
        results.push({
          icon: '✨',
          color: '#2D6A4F',
          headline: `${higherFert.name} breaks the pattern`,
          text: `${higherFert.name} has both higher fertility (${Math.max(lFert, rFert).toFixed(2)}) AND longer life expectancy (${Math.max(lLE, rLE).toFixed(1)}). A strong public healthcare system and cultural emphasis on preventive care can support both higher birth rates and longevity.`,
          type: 'fertility-le',
          data: insightData
        })
      }
    }

    // Insight 3: Education as the master lever
    const lEdu = getMarkerVal(left, 'education')
    const rEdu = getMarkerVal(right, 'education')
    const lHappy = getOVal(left, 'happiness')
    const rHappy = getOVal(right, 'happiness')
    if (lEdu && rEdu && lHappy && rHappy) {
      const moreEducated = lEdu > rEdu ? left : right
      const happier = lHappy > rHappy ? left : right
      const eduGap = Math.abs(lEdu - rEdu)
      const insightData = { lEdu, rEdu, lHappy, rHappy, leftName: left.name, rightName: right.name }
      if (moreEducated.country === happier.country && eduGap > 2) {
        results.push({
          icon: '📚',
          color: '#2D6A4F',
          headline: `${eduGap.toFixed(0)} extra years of education → happier citizens`,
          text: `${moreEducated.name} spends ${eduGap.toFixed(1)} more years in education and reports ${Math.abs(lHappy - rHappy).toFixed(1)} points higher happiness. Longer education builds social capital, career options, and a sense of agency, all foundations of life satisfaction across cultures.`,
          type: 'education-happiness',
          data: insightData
        })
      } else if (eduGap > 2) {
        results.push({
          icon: '📚',
          color: '#457B9D',
          headline: `More education doesn't guarantee happiness`,
          text: `${moreEducated.name} has ${eduGap.toFixed(1)} more years of education but ${happier.name} is happier (${Math.max(lHappy, rHappy).toFixed(2)} vs ${Math.min(lHappy, rHappy).toFixed(2)}). Cultural factors like community bonds, family proximity, work-life balance, and social trust can outweigh the benefits of formal education alone.`,
          type: 'education-happiness',
          data: insightData
        })
      }
    }

    return results.slice(0, 3)
  }, [left, right])

  const [expandedInsight, setExpandedInsight] = useState(null)

  if (insights.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="font-body text-[20px] font-bold text-[#264653] mb-4">Key insights for this pair</h3>
      <div className="space-y-4">
        {insights.map((ins, i) => (
          <div key={i}>
            <motion.div className="flex items-start gap-5 bg-white rounded-xl border border-gray-200 p-6"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}>
              <div className="w-[60px] shrink-0 text-center">
                <span className="text-[32px]">{ins.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-body text-[16px] font-bold mb-1" style={{ color: ins.color }}>{ins.headline}</p>
                <p className="font-body text-[15px] text-[#334155] leading-relaxed">{ins.text}</p>
              </div>
              <button
                onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
                className="w-9 h-9 shrink-0 rounded-full border-2 border-[#e5e7eb] flex items-center justify-center text-[#475569] cursor-pointer hover:border-[#264653] hover:text-[#264653] transition-all self-center"
                title="Show data">
                <span className="text-[18px] font-bold leading-none">{expandedInsight === i ? '−' : '+'}</span>
              </button>
            </motion.div>

            {/* Expanded data visualization panel */}
            <AnimatePresence>
              {expandedInsight === i && ins.data && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden">
                  <div className="bg-[#f8fafc] rounded-b-xl border border-t-0 border-gray-200 p-6">
                    <InsightChart type={ins.type} data={ins.data} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

// === JOURNEY (combines all parts) ===
function Journey({ leftCode, rightCode, onBack, onChangePair }) {
  const left = getProfile(leftCode)
  const right = getProfile(rightCode)
  if (!left || !right) return null

  const pairTagline = useMemo(() => {
    const sp = SUGGESTED_PAIRS.find(p => (p.a === leftCode && p.b === rightCode) || (p.a === rightCode && p.b === leftCode))
    return sp?.tagline || 'Two countries, two paths'
  }, [leftCode, rightCode])

  // Find next suggested pair
  const nextPair = useMemo(() => {
    const stories = pairStories.pair_story_rankings || []
    const next = stories.find(s =>
      s.country_a !== leftCode && s.country_b !== leftCode &&
      s.country_a !== rightCode && s.country_b !== rightCode
    )
    if (!next) return null
    const sp = SUGGESTED_PAIRS.find(p => (p.a === next.country_a && p.b === next.country_b) || (p.a === next.country_b && p.b === next.country_a))
    return { a: next.country_a, b: next.country_b, nameA: next.name_a, nameB: next.name_b, tagline: sp?.tagline || 'A compelling comparison' }
  }, [leftCode, rightCode])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <button onClick={onBack} className="mb-6 text-[15px] font-body text-[#475569] hover:text-[#264653] cursor-pointer transition-colors">
        Change pair
      </button>

      {/* Part A: Header */}
      <div className="bg-[#264653] rounded-xl p-8 mb-8 text-center">
        <p className="font-display text-[28px] md:text-[32px] text-white">{left.flag} {left.name} vs {right.flag} {right.name}</p>
        <p className="font-body text-[16px] text-white/70 mt-2">{pairTagline}</p>
      </div>

      {/* Part B: Timeline */}
      <MarkerTimeline left={left} right={right}/>

      {/* Part C: Outcomes */}
      <OutcomeMetrics left={left} right={right} leftCode={leftCode} rightCode={rightCode}/>

      {/* Part C2: Correlations */}
      <CorrelationConnections left={left} right={right}/>

      {/* Part D: Insights */}
      <KeyInsights left={left} right={right}/>

      {/* Part E: Return */}
      <div className="text-center py-12">
        <p className="font-display text-[20px] text-[#264653] mb-4">Explore another pair?</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={onBack}
            className="px-6 py-3 rounded-lg border-2 border-[#264653] text-[#264653] text-[16px] font-body font-semibold cursor-pointer hover:bg-[#264653] hover:text-white transition-all">
            Change pair
          </button>
          <button onClick={() => document.getElementById('discoveries')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-lg bg-[#264653] text-white text-[16px] font-body font-semibold cursor-pointer hover:opacity-90 transition-opacity">
            See what all 12 reveal
          </button>
        </div>
        {nextPair && (
          <button onClick={() => onChangePair(nextPair.a, nextPair.b)}
            className="mt-3 inline-block text-[15px] font-body text-[#E76F51] underline cursor-pointer hover:opacity-80">
            Try {nextPair.nameA} vs {nextPair.nameB}: "{nextPair.tagline}"
          </button>
        )}
      </div>
    </motion.div>
  )
}

// === MAIN COMPONENT ===
export default function PairComparison() {
  const [leftCode, setLeftCode] = useState('SWE')
  const [rightCode, setRightCode] = useState('IND')
  const [showJourney, setShowJourney] = useState(false)

  function handleCompare(a, b) {
    if (a) setLeftCode(a)
    if (b) setRightCode(b)
    setShowJourney(true)
  }

  function handleBack() {
    setShowJourney(false)
  }

  function handleChangePair(a, b) {
    setLeftCode(a)
    setRightCode(b)
    document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="compare" className="py-24 px-4 md:px-8 relative overflow-hidden"
      style={{ backgroundColor: '#f1f5f9', backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Background image - aerial city */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover" loading="lazy"/>
        <div className="absolute inset-0" style={{ backgroundColor: '#f1f5f9', opacity: 0.92 }}/>
      </div>
      <div className="max-w-[1200px] mx-auto relative z-10">
        <h2 className="font-display text-[36px] text-[#264653] mb-2">Compare Countries</h2>
        <p className="font-body text-[18px] text-[#475569] mb-8">Pick two countries. See how their life sequences diverge.</p>

        <AnimatePresence mode="wait">
          {!showJourney ? (
            <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Picker leftCode={leftCode} rightCode={rightCode} setLeftCode={setLeftCode} setRightCode={setRightCode} onCompare={handleCompare}/>
            </motion.div>
          ) : (
            <motion.div key="journey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Journey leftCode={leftCode} rightCode={rightCode} onBack={handleBack} onChangePair={handleChangePair}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}


