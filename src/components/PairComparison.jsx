import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import countryProfiles from '../data/country_profiles.json'
import correlationNarratives from '../data/correlation_narratives.json'
import pairStories from '../data/pair_story_analysis.json'

// === CONFIG ===
const MILESTONE_CONFIG = [
  { key: 'menarche', label: 'Puberty', color: '#C2185B', annotation: 'Biologically constrained. Nutrition and healthcare drive the small variation.' },
  { key: 'education', label: 'Education', color: '#2D6A4F', annotation: 'Reflects years of schooling available. Longer education delays every milestone after it.' },
  { key: 'leaving_home', label: 'Leave Home', color: '#2A9D8F', annotation: 'Cultural and economic. Southern European and South Asian youth stay home longer.' },
  { key: 'cohabitation', label: 'Cohabitation', color: '#00897B', annotation: 'In Nordic countries, cohabitation replaces early marriage. In others, it barely exists.' },
  { key: 'first_home', label: 'First Home', color: '#48BFE3', annotation: 'Driven by housing costs and cultural norms around family property.' },
  { key: 'marriage', label: 'Marriage', color: '#E76F51', annotation: 'The single most variable social milestone. Correlates with GDP, equality, and health outcomes.' },
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
  { key: 'fertility_rate', label: 'Fertility Rate', format: v => v?.toFixed(2), unit: 'children', note: null },
  { key: 'gender_inequality_index', label: 'Gender Inequality Index (GII)', format: v => v?.toFixed(3), unit: 'index', note: 'Lower is better. 0 = perfect gender equality.' },
]

const SUGGESTED_PAIRS = [
  { a: 'SWE', b: 'IND', label: 'Sweden vs India', tagline: 'Marriage age worlds apart' },
  { a: 'FRA', b: 'MEX', label: 'France vs Mexico', tagline: 'Same lifespan, different retirement' },
  { a: 'JPN', b: 'IND', label: 'Japan vs India', tagline: 'Healthy years divide' },
  { a: 'ITA', b: 'BRA', label: 'Italy vs Brazil', tagline: 'Living together, worlds apart' },
  { a: 'KOR', b: 'FRA', label: 'S. Korea vs France', tagline: 'The squeeze vs the spread' },
  { a: 'USA', b: 'JPN', label: 'USA vs Japan', tagline: "Money can not buy health" },
]

const COUNTRY_COLORS = {
  SWE:'#2D6A4F',DNK:'#2D6A4F',ITA:'#457B9D',FRA:'#457B9D',DEU:'#457B9D',AUS:'#457B9D',
  JPN:'#E76F51',KOR:'#E76F51',USA:'#C2185B',BRA:'#C2185B',MEX:'#C2185B',IND:'#7B2D8E',
}

function getProfile(code) { return countryProfiles.find(c => c.country === code) }
function getMVal(profile, key) { return profile?.milestones?.[key]?.value ?? null }
function getOVal(profile, key) { return profile?.outcomes?.[key]?.value ?? null }

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
function MilestoneTimeline({ left, right }) {
  const [hoveredRow, setHoveredRow] = useState(null)

  const rows = useMemo(() => {
    return MILESTONE_CONFIG.map(mc => {
      const lv = getMVal(left, mc.key)
      const rv = getMVal(right, mc.key)
      if (lv == null && rv == null) return null
      const gap = (lv != null && rv != null) ? lv - rv : null
      return { ...mc, leftVal: lv, rightVal: rv, gap }
    }).filter(Boolean)
  }, [left, right])

  return (
    <div className="bg-white rounded-xl shadow-sm p-10 mb-8 border border-gray-200">
      <h3 className="font-body text-[22px] font-bold text-[#264653] mb-1">Milestone Timeline</h3>
      <p className="font-body text-[16px] text-[#475569] mb-8">Age 12 to 70. Every milestone compared.</p>

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
      <div className="flex items-center gap-4 mt-4 ml-[146px] text-[14px] font-body text-[#475569]">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNTRY_COLORS[left.country] || '#264653' }}/> {left.name}</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COUNTRY_COLORS[right.country] || '#457B9D', opacity: 0.7 }}/> {right.name}</span>
      </div>
      <p className="ml-[146px] mt-2 text-[13px] font-body italic text-[#64748b]">Milestones with no data for either country are not shown.</p>
    </div>
  )
}

// === OUTCOME METRICS ===
function OutcomeMetrics({ left, right, leftCode, rightCode }) {
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
      <p className="font-body text-[16px] text-[#475569] mb-6">How these two countries compare on life outcomes</p>
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

          return (
            <motion.div key={o.key} className="bg-white rounded-xl border border-gray-200 p-6"
              style={{ borderLeft: `4px solid ${borderColor}` }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}>
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
        const lm = getMVal(left, cn.milestone) ?? getMVal(left, cn.milestone + '_age')
        const rm = getMVal(right, cn.milestone) ?? getMVal(right, cn.milestone + '_age')
        const lo = getOVal(left, cn.outcome)
        const ro = getOVal(right, cn.outcome)
        return lm != null && rm != null && lo != null && ro != null
      })
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
      .slice(0, 3)
      .map(cn => {
        const mKey = getMVal(left, cn.milestone) != null ? cn.milestone : cn.milestone + '_age'
        const lm = getMVal(left, mKey)
        const rm = getMVal(right, mKey)
        const lo = getOVal(left, cn.outcome)
        const ro = getOVal(right, cn.outcome)
        const mc = MILESTONE_CONFIG.find(m => m.key === mKey || m.key === cn.milestone)
        return { ...cn, lm, rm, lo, ro, mColor: mc?.color || '#264653', mLabel: mc?.label || cn.milestone }
      })
  }, [left, right])

  if (connections.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="font-display text-[24px] text-[#264653] mb-1">Connections between timing and outcomes</h3>
      <p className="font-body text-[16px] text-[#475569] mb-6">How milestone differences relate to outcome differences for this pair</p>
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

// === KEY INSIGHTS ===
function KeyInsights({ left, right }) {
  const insights = useMemo(() => {
    const gaps = MILESTONE_CONFIG.map(mc => {
      const lv = getMVal(left, mc.key)
      const rv = getMVal(right, mc.key)
      if (lv == null || rv == null) return null
      return { ...mc, leftVal: lv, rightVal: rv, gap: Math.abs(lv - rv), higher: lv > rv ? left : right, lower: lv > rv ? right : left, hVal: Math.max(lv, rv), lVal: Math.min(lv, rv) }
    }).filter(Boolean).sort((a, b) => b.gap - a.gap).slice(0, 3)
    return gaps
  }, [left, right])

  function getInsightText(ins) {
    const hName = ins.higher.name
    const lName = ins.lower.name
    if (ins.key === 'marriage') {
      const hEdu = getMVal(ins.higher, 'education')
      const lEdu = getMVal(ins.lower, 'education')
      const hGapFromEdu = hEdu ? (ins.hVal - hEdu).toFixed(0) : null
      const lGapFromEdu = lEdu ? (ins.lVal - lEdu).toFixed(0) : null
      let text = `${lName} women marry at ${ins.lVal.toFixed(1)}.`
      if (lGapFromEdu) text += ` Marriage comes ${lGapFromEdu} years after education.`
      text += ` ${hName} women marry at ${ins.hVal.toFixed(1)}.`
      if (hGapFromEdu) text += ` They spend ${hGapFromEdu} years after education before marrying.`
      return text
    }
    if (ins.key === 'retirement_age') {
      const lRetYrs = getMVal(ins.lower, 'retirement_age') ? getOVal(ins.lower, 'life_expectancy') - getMVal(ins.lower, 'retirement_age') : null
      const hRetYrs = getMVal(ins.higher, 'retirement_age') ? getOVal(ins.higher, 'life_expectancy') - getMVal(ins.higher, 'retirement_age') : null
      let text = `${lName} retires at ${ins.lVal.toFixed(1)}.`
      if (lRetYrs) text += ` That gives ${lRetYrs.toFixed(0)} years of retirement.`
      text += ` ${hName} retires at ${ins.hVal.toFixed(1)}.`
      if (hRetYrs) text += ` ${hRetYrs.toFixed(0)} years of retirement. Same lifespan, different distribution.`
      return text
    }
    if (ins.key === 'education') {
      return `${lName} finishes education at ${ins.lVal.toFixed(1)}, entering the workforce ${ins.gap.toFixed(1)} years earlier. ${hName} gets ${ins.gap.toFixed(1)} more years of schooling, finishing at ${ins.hVal.toFixed(1)}.`
    }
    if (ins.key === 'leaving_home') {
      return `${hName} young adults stay in the family home until ${ins.hVal.toFixed(1)}. ${lName} leaves at ${ins.lVal.toFixed(1)}. A ${ins.gap.toFixed(1)} year gap driven by culture, not economics.`
    }
    if (ins.key === 'menopause') {
      const lMenarche = getMVal(ins.lower, 'menarche')
      const hMenarche = getMVal(ins.higher, 'menarche')
      const lRepro = lMenarche ? (ins.lVal - lMenarche).toFixed(0) : null
      const hRepro = hMenarche ? (ins.hVal - hMenarche).toFixed(0) : null
      let text = `${ins.lower.name} women reach menopause ${ins.gap.toFixed(1)} years earlier than ${ins.higher.name} women, at ${ins.lVal.toFixed(1)} vs ${ins.hVal.toFixed(1)}.`
      if (lRepro && hRepro) text += ` Combined with different puberty timing, ${ins.lower.name} women have ${lRepro} reproductive years compared to ${ins.higher.name}'s ${hRepro}. A ${Math.abs(parseFloat(hRepro) - parseFloat(lRepro))} year difference shaped by nutrition and healthcare access.`
      return text
    }
    return `${hName} reaches ${ins.label.toLowerCase()} at ${ins.hVal.toFixed(1)}. ${lName} at ${ins.lVal.toFixed(1)}. A ${ins.gap.toFixed(1)} year gap.`
  }

  return (
    <div className="mb-8">
      <h3 className="font-body text-[20px] font-bold text-[#264653] mb-4">Key insights for this pair</h3>
      <div className="space-y-4">
        {insights.map((ins, i) => (
          <motion.div key={ins.key} className="flex items-start gap-6 bg-white rounded-xl border border-gray-200 p-6"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}>
            <div className="w-[120px] shrink-0 text-center">
              <span className="text-[36px] font-data font-bold" style={{ color: ins.color }}>+{ins.gap.toFixed(1)}</span>
              <span className="block text-[14px] font-body text-[#475569]">years</span>
            </div>
            <div className="flex-1">
              <p className="font-body text-[16px] text-[#334155] leading-relaxed">{getInsightText(ins)}</p>
            </div>
          </motion.div>
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
      <MilestoneTimeline left={left} right={right}/>

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
