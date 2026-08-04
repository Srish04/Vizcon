import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import correlationsData from '../../data/correlations.json'
import narrativesData from '../../data/correlation_narratives.json'

const MILESTONES = [
  { key: 'menarche_age', label: 'Menarche (Puberty)' },
  { key: 'education_completion_age', label: 'Education Completion' },
  { key: 'leaving_home_age', label: 'Leaving Home' },
  { key: 'cohabitation_age', label: 'Cohabitation' },
  { key: 'first_home_age', label: 'First Home' },
  { key: 'marriage_age', label: 'Marriage Age' },
  { key: 'first_birth_age', label: 'First Child' },
  { key: 'fertility_rate', label: 'Fertility Rate' },
  { key: 'menopause_age', label: 'Menopause' },
  { key: 'retirement_age', label: 'Retirement' },
]

const OUTCOMES = [
  { key: 'happiness', label: 'Happiness' },
  { key: 'life_expectancy', label: 'Life Expectancy' },
  { key: 'hale', label: 'HALE' },
  { key: 'years_poor_health', label: 'Years in Poor Health' },
  { key: 'gdp_per_capita', label: 'GDP per Capita' },
  { key: 'female_lfpr', label: 'Female LFPR' },
  { key: 'fertility_rate', label: 'Fertility Rate' },
  { key: 'divorce_rate', label: 'Divorce Rate' },
  { key: 'maternal_mortality', label: 'Maternal Mortality' },
  { key: 'adolescent_fertility', label: 'Adolescent Fertility' },
  { key: 'gender_inequality_index', label: 'Gender Inequality Index' },
]

const REGION_COLORS = {
  'Northern Europe': '#457B9D',
  'Nordic': '#457B9D',
  'Western Europe': '#2D6A4F',
  'Southern Europe': '#2A9D8F',
  'East Asia': '#E76F51',
  'Oceania': '#48BFE3',
  'Americas': '#C2185B',
  'South America': '#C2185B',
  'North America': '#C2185B',
  'South Asia': '#AB47BC',
}

const PRESETS = [
  { x: 'marriage_age', y: 'gdp_per_capita', label: 'Marriage x GDP' },
  { x: 'marriage_age', y: 'gender_inequality_index', label: 'Marriage x GII' },
  { x: 'education_completion_age', y: 'happiness', label: 'Education x Happiness' },
  { x: 'menarche_age', y: 'adolescent_fertility', label: 'Menarche x Adol.Fertility' },
]

function pearsonR(xs, ys) {
  const n = xs.length
  if (n < 3) return null
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  const den = Math.sqrt(denX * denY)
  return den === 0 ? 0 : num / den
}

function getRegion(code) {
  const c = correlationsData.find(d => d.country === code)
  // Map to region from country_profiles
  const profiles = { SWE: 'Nordic', ITA: 'Southern Europe', JPN: 'East Asia', KOR: 'East Asia', AUS: 'Oceania', FRA: 'Western Europe', DNK: 'Nordic', DEU: 'Western Europe', USA: 'North America', BRA: 'South America', MEX: 'Americas', IND: 'South Asia' }
  return profiles[code] || 'Other'
}

export default function CorrelationExplorer() {
  const [xKey, setXKey] = useState('marriage_age')
  const [yKey, setYKey] = useState('gdp_per_capita')
  const [hoveredDot, setHoveredDot] = useState(null)

  const { points, r, n } = useMemo(() => {
    const pts = correlationsData
      .filter(c => c[xKey] != null && c[yKey] != null)
      .map(c => ({
        code: c.country,
        name: c.name,
        x: c[xKey],
        y: c[yKey],
        region: getRegion(c.country),
      }))
    const xs = pts.map(p => p.x)
    const ys = pts.map(p => p.y)
    const rVal = pearsonR(xs, ys)
    return { points: pts, r: rVal, n: pts.length }
  }, [xKey, yKey])

  // Find narrative
  const narrative = useMemo(() => {
    // Map explorer keys to correlation_narratives keys
    const corrKey = xKey // They already match
    return narrativesData.correlations.find(c => c.milestone === corrKey && c.outcome === yKey)
  }, [xKey, yKey])

  // Compute SVG scale
  const plotW = 400, plotH = 280
  const xVals = points.map(p => p.x)
  const yVals = points.map(p => p.y)
  const xMin = Math.min(...xVals) - 1
  const xMax = Math.max(...xVals) + 1
  const yMin = Math.min(...yVals) * 0.9
  const yMax = Math.max(...yVals) * 1.1

  function sx(v) { return ((v - xMin) / (xMax - xMin)) * plotW }
  function sy(v) { return plotH - ((v - yMin) / (yMax - yMin)) * plotH }

  const xLabel = MILESTONES.find(m => m.key === xKey)?.label || xKey
  const yLabel = OUTCOMES.find(o => o.key === yKey)?.label || yKey

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="text-xs font-data text-text/50 block mb-1">Life milestone (X-axis)</label>
          <select
            value={xKey}
            onChange={e => setXKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-text/15 bg-white text-sm font-body text-text"
          >
            {MILESTONES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs font-data text-text/50 block mb-1">Life outcome (Y-axis)</label>
          <select
            value={yKey}
            onChange={e => setYKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-text/15 bg-white text-sm font-body text-text"
          >
            {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => { setXKey(p.x); setYKey(p.y) }}
            className={`px-3 py-1 rounded-full text-xs font-body border cursor-pointer transition-all
              ${xKey === p.x && yKey === p.y
                ? 'border-marriage bg-marriage/10 text-marriage'
                : 'border-text/10 text-text/50 hover:border-text/20 hover:bg-white'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white/60 rounded-xl p-4 border border-text/5 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-data text-text-muted">{xLabel} vs {yLabel}</span>
          <span className="text-xs font-data text-marriage font-medium">
            r = {r != null ? r.toFixed(2) : '—'} | N = {n}
          </span>
        </div>

        {/* Region legend */}
        <div className="flex flex-wrap gap-3 mb-3">
          {[
            { region: 'Nordic', color: '#457B9D' },
            { region: 'W. Europe', color: '#2D6A4F' },
            { region: 'E. Asia', color: '#E76F51' },
            { region: 'Americas', color: '#C2185B' },
            { region: 'S. Asia', color: '#AB47BC' },
          ].map(r => (
            <span key={r.region} className="flex items-center gap-1 text-[10px] font-data text-text-muted">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: r.color }} />
              {r.region}
            </span>
          ))}
        </div>

        <div className="relative">
          <svg viewBox={`-40 -10 ${plotW + 60} ${plotH + 40}`} className="w-full h-64 md:h-80">
            {/* Grid */}
            <line x1="0" y1={plotH} x2={plotW} y2={plotH} stroke="#26465315" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2={plotH} stroke="#26465315" strokeWidth="1" />

            {/* X axis label */}
            <text x={plotW / 2} y={plotH + 30} textAnchor="middle" className="text-[9px]" fill="#26465350">{xLabel}</text>
            {/* Y axis label */}
            <text x={-30} y={plotH / 2} textAnchor="middle" className="text-[9px]" fill="#26465350" transform={`rotate(-90, -30, ${plotH / 2})`}>{yLabel}</text>

            {/* Points */}
            {points.map(p => {
              const cx = sx(p.x)
              const cy = sy(p.y)
              const color = REGION_COLORS[p.region] || '#666'
              return (
                <g key={p.code}
                  onMouseEnter={() => setHoveredDot(p)}
                  onMouseLeave={() => setHoveredDot(null)}
                >
                  <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.75} className="cursor-pointer" />
                  <text x={cx + 7} y={cy + 3} className="text-[8px]" fill="#26465370">{p.code}</text>
                </g>
              )
            })}
          </svg>

          {/* Tooltip */}
          {hoveredDot && (
            <div className="absolute top-2 right-2 bg-white shadow-lg rounded-lg px-3 py-2 border border-text/10 z-10">
              <p className="text-sm font-body font-medium text-text">{hoveredDot.name}</p>
              <p className="text-xs font-data text-text/60">{xLabel}: {hoveredDot.x}</p>
              <p className="text-xs font-data text-text/60">{yLabel}: {hoveredDot.y}</p>
            </div>
          )}
        </div>
      </div>

      {/* Narrative */}
      {narrative ? (
        <div className="bg-white/40 rounded-xl p-4 border border-text/5">
          <p className="font-body text-sm text-text/80 font-medium mb-1">{narrative.one_liner}</p>
          <p className="font-body text-xs text-text/60 mb-2">{narrative.mechanism}</p>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-data bg-text/5 text-text/50">
            {narrative.group === 'causal' && '🔗 Causal'}
            {narrative.group === 'feedback' && '🔄 Feedback loop'}
            {narrative.group === 'common_cause' && '🌐 Common cause'}
          </span>
        </div>
      ) : (
        <p className="text-text/40 text-xs font-body text-center italic">
          No pre-analyzed connection for this combination. Explore the pattern yourself.
        </p>
      )}
    </div>
  )
}
