import { useState, useMemo, useRef, useEffect } from 'react'
import correlations from '../data/correlations.json'
import correlationNarratives from '../data/correlation_narratives.json'
import ExpandableChart from './ExpandableChart'
import fertilityData from '../data/fertility_rate.json'
import educationData from '../data/education.json'
import marriageData from '../data/first_marriage.json'
import retirementData from '../data/retirement.json'

// === METRIC MAP ===
const METRIC_MAP = {
  'Puberty Age': { key: 'menarche_age', unit: 'years', color: '#C2185B', cat: 'marker', desc: 'Average age of first menstruation, ranging from 12.4 (Brazil) to 14.3 (India)' },
  'Education Age': { key: 'education_completion_age', unit: 'years', color: '#2D6A4F', cat: 'marker', desc: 'Age at which education is typically completed, from 18.9 (India) to 26.6 (Australia)' },
  'Leave Home Age': { key: 'leaving_home_age', unit: 'years', color: '#2A9D8F', cat: 'marker', desc: 'Age of leaving parental home, from 21.8 (Denmark) to 30.2 (Italy)' },
  'Cohabitation Age': { key: 'cohabitation_age', unit: 'years', color: '#00897B', cat: 'marker', desc: 'Age of first cohabitation with a partner' },
  'First Home Age': { key: 'first_home_age', unit: 'years', color: '#48BFE3', cat: 'marker', desc: 'Average age of purchasing first home' },
  'Marriage Age (F)': { key: 'marriage_age', unit: 'years', color: '#E76F51', cat: 'marker', desc: 'Average age women first marry, from 21.4 (India) to 34.8 (Sweden)' },
  'First Child Age': { key: 'first_birth_age', unit: 'years', color: '#E9C46A', cat: 'marker', desc: 'Average age at first birth' },
  'Menopause Age': { key: 'menopause_age', unit: 'years', color: '#AB47BC', cat: 'marker', desc: 'Average age of menopause onset' },
  'Retirement Age': { key: 'retirement_age', unit: 'years', color: '#457B9D', cat: 'marker', desc: 'Effective average retirement age' },
  'Fertility Rate': { key: 'fertility_rate', unit: 'children/woman', color: '#264653', cat: 'marker', desc: 'Total fertility rate, from 0.72 (S. Korea) to 1.98 (India)' },
  'HALE (Healthy Years)': { key: 'hale', unit: 'years', color: '#7B2D8E', cat: 'marker', desc: 'Healthy life expectancy (HALE): years lived in good health, without major disease or disability' },
  'GDP per Capita': { key: 'gdp_per_capita', unit: 'PPP $', color: '#457B9D', cat: 'outcome', desc: 'GDP per person adjusted for purchasing power' },
  'Happiness Score': { key: 'happiness', unit: '/10', color: '#457B9D', cat: 'outcome', desc: 'Gallup World Poll life satisfaction, from 4.1 (India) to 7.6 (Denmark)' },
  'Life Expectancy': { key: 'life_expectancy', unit: 'years', color: '#457B9D', cat: 'outcome', desc: 'Average life expectancy at birth' },
  'Female LFPR': { key: 'female_lfpr', unit: '%', color: '#457B9D', cat: 'outcome', desc: 'Female labor force participation rate (working-age)' },
  'Gender Inequality (GII)': { key: 'gender_inequality_index', unit: 'index', color: '#457B9D', cat: 'outcome', desc: 'UNDP Gender Inequality Index. 0 means perfect gender equality, higher means more inequality. Sweden: 0.007, India: 0.403.' },
  'Adolescent Fertility': { key: 'adolescent_fertility', unit: 'per 1000', color: '#457B9D', cat: 'outcome', desc: 'Births per 1000 women aged 15-19' },
  'Maternal Mortality': { key: 'maternal_mortality', unit: 'per 100k', color: '#457B9D', cat: 'outcome', desc: 'Maternal deaths per 100,000 live births' },
  'Years Poor Health': { key: 'years_poor_health', unit: 'years', color: '#457B9D', cat: 'outcome', desc: 'Average years spent in poor health' },
  'Contraceptive Prevalence': { key: 'contraceptive_prevalence', unit: '%', color: '#457B9D', cat: 'outcome', desc: 'Percentage of women using modern contraception' },
}

const METRIC_NAMES = Object.keys(METRIC_MAP)
const MARKER_METRICS = METRIC_NAMES.filter(n => METRIC_MAP[n].cat === 'marker')
const OUTCOME_METRICS = METRIC_NAMES.filter(n => METRIC_MAP[n].cat === 'outcome')

const COUNTRY_CONFIG = {
  SWE:{name:'Sweden',color:'#2D6A4F'}, DNK:{name:'Denmark',color:'#2D6A4F'},
  ITA:{name:'Italy',color:'#457B9D'}, FRA:{name:'France',color:'#457B9D'},
  DEU:{name:'Germany',color:'#457B9D'}, AUS:{name:'Australia',color:'#457B9D'},
  JPN:{name:'Japan',color:'#E76F51'}, KOR:{name:'S. Korea',color:'#E76F51'},
  USA:{name:'USA',color:'#C2185B'}, BRA:{name:'Brazil',color:'#C2185B'},
  MEX:{name:'Mexico',color:'#C2185B'}, IND:{name:'India',color:'#7B2D8E'},
}
const ALL_CODES = Object.keys(COUNTRY_CONFIG)

const PRESETS = [
  { x:'Marriage Age (F)', y:'GDP per Capita', label:'Marriage x GDP', r:'0.78' },
  { x:'Marriage Age (F)', y:'Gender Inequality (GII)', label:'Marriage x Gender Equality', r:'-0.90' },
  { x:'Education Age', y:'Happiness Score', label:'Education x Happiness', r:'0.72' },
  { x:'Puberty Age', y:'Adolescent Fertility', label:'Menarche x Adol.Fertility', r:'-0.65' },
]

const VIEWS = ['Scatter','Rankings','Radar','Timeline']

function pearsonR(xs, ys) {
  const n = xs.length; if (n < 3) return 0
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n
  let num=0, dx2=0, dy2=0
  for (let i=0;i<n;i++){const dx=xs[i]-mx,dy=ys[i]-my;num+=dx*dy;dx2+=dx*dx;dy2+=dy*dy}
  const den=Math.sqrt(dx2*dy2)
  return den===0?0:num/den
}

function formatVal(key, v) {
  if (v == null) return '--'
  if (key === 'gdp_per_capita') return `$${(v/1000).toFixed(0)}k`
  if (key === 'female_lfpr' || key === 'contraceptive_prevalence') return `${v.toFixed(1)}%`
  if (key === 'gender_inequality_index') return v.toFixed(3)
  if (key === 'fertility_rate') return v.toFixed(2)
  if (v >= 100) return Math.round(v).toString()
  return v.toFixed(1)
}

// Drag handle SVG icon
function DragHandle({ color }) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" className="shrink-0">
      <line x1="0" y1="2" x2="12" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="0" y1="5" x2="12" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="0" y1="8" x2="12" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// Metric pill in left pane
function MetricPill({ name, metric, isSelected, axisLabel, onClick, mode }) {
  const c = metric.color
  // Use shorter display names
  const shortName = name.replace(' Age', '').replace(' (F)', '(F)').replace('Contraceptive Prevalence', 'Contraceptive')
  return (
    <div
      draggable={mode === 'scatter'}
      onDragStart={e => { e.dataTransfer.setData('text/plain', name); e.dataTransfer.effectAllowed = 'copy' }}
      onClick={() => onClick && onClick(name)}
      className={`min-h-[32px] py-1 flex items-center gap-1 px-2 rounded-md border-2 cursor-pointer transition-all hover:shadow-sm
        ${isSelected ? 'shadow-md scale-[1.03]' : 'hover:opacity-100'}`}
      style={{
        backgroundColor: isSelected ? `${c}30` : `${c}0a`,
        borderColor: isSelected ? c : `${c}55`,
      }}>
      {isSelected && axisLabel && (
        <span className="w-4 h-4 rounded text-[9px] font-data font-bold flex items-center justify-center text-white shrink-0" style={{ backgroundColor: c }}>
          {axisLabel}
        </span>
      )}
      <span className={`text-[11px] font-body ${isSelected ? 'font-bold' : 'font-semibold'}`} style={{ color: isSelected ? c : '#1e293b' }}>{shortName}</span>
    </div>
  )
}

// === LEFT PANE ===
function LeftPane({ selectedCountries, setSelectedCountries, mode, xMetric, yMetric, setXMetric, setYMetric, rankMetric, setRankMetric }) {
  function handlePillClick(name) {
    if (mode === 'rankings' || mode === 'radar' || mode === 'timeline') {
      setRankMetric(name)
    } else {
      // Scatter mode: Markers go to X, Outcomes go to Y
      const clickedMetric = METRIC_MAP[name]
      if (clickedMetric.cat === 'marker') {
        setXMetric(name)
      } else {
        setYMetric(name)
      }
    }
  }

  function isSelected(name) {
    if (mode === 'rankings' || mode === 'radar' || mode === 'timeline') return rankMetric === name
    return xMetric === name || yMetric === name
  }

  function getLabel(name) {
    if (mode !== 'scatter') return null
    if (xMetric === name) return 'X'
    if (yMetric === name) return 'Y'
    return null
  }

  return (
    <div className="w-[420px] shrink-0 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
      {mode === 'radar' ? (
        <div>
          <p className="text-[10px] font-body font-bold uppercase text-[#1e293b] tracking-wider border-b border-[#e5e7eb] pb-1 mb-2">Countries</p>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setSelectedCountries(ALL_CODES)}
              className={`text-[10px] font-body cursor-pointer px-1.5 py-0.5 rounded ${selectedCountries.length === 12 ? 'font-bold text-[#264653] bg-[#264653]/10' : 'text-[#1e293b]'}`}>
              All
            </button>
            <button onClick={() => setSelectedCountries([])}
              className={`text-[10px] font-body cursor-pointer px-1.5 py-0.5 rounded ${selectedCountries.length === 0 ? 'font-bold text-[#E76F51]' : 'text-[#1e293b]'}`}>
              None
            </button>
          </div>
          <div className="space-y-1">
            {ALL_CODES.map(code => {
              const active = selectedCountries.includes(code)
              const c = COUNTRY_CONFIG[code]
              return (
                <button key={code}
                  onClick={() => setSelectedCountries(prev => active ? prev.filter(x=>x!==code) : [...prev, code])}
                  className="w-full flex items-center gap-2 h-7 cursor-pointer transition-all hover:bg-gray-50 rounded px-1">
                  <span className="w-3 h-3 rounded-full shrink-0 transition-opacity" style={{ backgroundColor: c.color, opacity: active ? 1 : 0.3 }}/>
                  <span className={`text-[13px] font-body transition-all ${active ? 'text-[#1a2a32] font-semibold' : 'text-[#94a3b8]'}`}>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
      <>
      {/* Three-column: Markers, Outcomes, Countries */}
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-body font-bold uppercase text-[#1e293b] tracking-wider border-b border-[#e5e7eb] pb-1 mb-2">Markers</p>
          <div className="space-y-1">
            {(mode === 'timeline' ? MARKER_METRICS.filter(n => TIMELINE_METRIC_NAMES.includes(n)) : MARKER_METRICS).map(name => (
              <MetricPill key={name} name={name} metric={METRIC_MAP[name]}
                isSelected={isSelected(name)} axisLabel={getLabel(name)}
                onClick={handlePillClick} mode={mode}/>
            ))}
          </div>
        </div>
        {mode !== 'timeline' && (
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-body font-bold uppercase text-[#1e293b] tracking-wider border-b border-[#e5e7eb] pb-1 mb-2">Outcomes</p>
          <div className="space-y-1">
            {OUTCOME_METRICS.map(name => (
              <MetricPill key={name} name={name} metric={METRIC_MAP[name]}
                isSelected={isSelected(name)} axisLabel={getLabel(name)}
                onClick={handlePillClick} mode={mode}/>
            ))}
          </div>
        </div>
        )}
        <div className="w-[100px] shrink-0">
          <p className="text-[9px] font-body font-bold uppercase text-[#1e293b] tracking-wider border-b border-[#e5e7eb] pb-1 mb-2">Countries</p>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setSelectedCountries(ALL_CODES)}
              className={`text-[9px] font-body cursor-pointer px-1.5 py-0.5 rounded-md transition-all ${selectedCountries.length === 12 ? 'font-bold text-white bg-[#264653]' : 'text-[#1e293b] bg-gray-100 hover:bg-gray-200'}`}>
              All
            </button>
            <button onClick={() => setSelectedCountries([])}
              className={`text-[9px] font-body cursor-pointer px-1.5 py-0.5 rounded-md transition-all ${selectedCountries.length === 0 ? 'font-bold text-white bg-[#E76F51]' : 'text-[#1e293b] bg-gray-100 hover:bg-gray-200'}`}>
              None
            </button>
          </div>
          <div className="space-y-0.5">
            {ALL_CODES.map(code => {
              const active = selectedCountries.includes(code)
              const c = COUNTRY_CONFIG[code]
              return (
                <button key={code}
                  onClick={() => setSelectedCountries(prev => active ? prev.filter(x=>x!==code) : [...prev, code])}
                  className="w-full flex items-center gap-1.5 h-6 cursor-pointer transition-all hover:bg-gray-50 rounded px-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity" style={{ backgroundColor: c.color, opacity: active ? 1 : 0.3 }}/>
                  <span className={`text-[11px] font-body transition-all ${active ? 'text-[#1a2a32] font-semibold' : 'text-[#94a3b8]'}`}>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Interaction hint */}
      <p className="text-[11px] font-body text-[#475569] mt-3 italic">
        {mode === 'scatter' ? 'Markers go to X-axis. Outcomes go to Y-axis.' : 'Click to select metric.'}
      </p>
      </>
      )}
    </div>
  )
}

// === RIGHT PANE: Country filter + What this shows (side by side) ===
function CountryFilter({ selectedCountries, setSelectedCountries, activeView, narrative, r, xMetric, yMetric, rankMetric }) {
  return (
    <div className="w-[280px] shrink-0 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pl-4 border-l border-[#e5e7eb]">
      {/* What this shows - prominent insight card */}
      {activeView === 'Scatter' && narrative && (
        <div className="bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] rounded-xl p-4 border border-[#264653]/15 shadow-sm">
          <p className="text-[13px] font-body font-bold text-[#264653] mb-2">What this shows</p>
          <p className="text-[13px] font-body text-[#334155] leading-relaxed mb-3 font-medium">{narrative.one_liner}</p>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <p className="text-[10px] font-data text-[#475569] mb-0.5">Direction</p>
              <p className="text-[12px] font-body font-semibold text-[#1e293b]">{r > 0 ? 'Later' : 'Earlier'} {xMetric?.split(' ')[0]} = {r > 0 ? 'higher' : 'lower'} {yMetric}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <p className="text-[10px] font-data text-[#475569] mb-0.5">Strength</p>
              <p className="text-[16px] font-data font-bold text-[#264653]">r = {r?.toFixed(2)}</p>
              <p className="text-[11px] font-body text-[#475569]">({Math.abs(r) > 0.7 ? 'strong' : Math.abs(r) > 0.4 ? 'moderate' : 'weak'})</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <div className="flex items-center gap-1 mb-1">
                <p className="text-[10px] font-data text-[#475569]">Type</p>
                <div className="relative group">
                  <svg width="10" height="10" viewBox="0 0 10 10" className="cursor-pointer text-[#475569]">
                    <circle cx="5" cy="5" r="4.5" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                    <text x="5" y="7.5" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="Inter" fontWeight="700">i</text>
                  </svg>
                  <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 w-[160px] bg-[#1e293b] text-white rounded-lg p-2 z-50 shadow-xl">
                    <p className="text-[9px] font-body leading-relaxed mb-0.5"><span className="font-bold">Causal:</span> A causes B directly.</p>
                    <p className="text-[9px] font-body leading-relaxed mb-0.5"><span className="font-bold">Feedback:</span> A and B reinforce each other.</p>
                    <p className="text-[9px] font-body leading-relaxed"><span className="font-bold">Shared:</span> Third factor drives both.</p>
                  </div>
                </div>
              </div>
              <p className="text-[12px] font-body font-semibold text-[#1e293b]">
                {narrative.group === 'causal' && 'Causal'}
                {narrative.group === 'feedback' && 'Feedback loop'}
                {narrative.group === 'common_cause' && 'Shared drivers'}
              </p>
              <p className="text-[11px] font-body text-[#475569] mt-1 leading-relaxed">{narrative.mechanism}</p>
            </div>
          </div>
          {narrative.improvement_path && (
            <div className="bg-[#ecfdf5] rounded-lg p-2.5 border border-[#10b981]/20 mt-2">
              <p className="text-[10px] font-body font-bold text-[#065f46] mb-1">💡 How to improve this</p>
              <p className="text-[11px] font-body text-[#065f46] leading-relaxed">{narrative.improvement_path}</p>
            </div>
          )}
          <p className="text-[10px] font-body italic text-[#64748b] mt-2">N=12. Correlation only.</p>
        </div>
      )}
      {activeView === 'Scatter' && !narrative && xMetric && yMetric && r !== 0 && (
        <div className="bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] rounded-xl p-4 border border-[#264653]/15 shadow-sm">
          <p className="text-[13px] font-body font-bold text-[#264653] mb-2">What this shows</p>
          <p className="text-[12px] font-body text-[#334155] leading-relaxed mb-3">
            {r > 0 ? 'Higher' : 'Lower'} {xMetric} tends to correlate with {r > 0 ? 'higher' : 'lower'} {yMetric} across these countries.
          </p>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <p className="text-[10px] font-data text-[#475569]">Direction</p>
              <p className="text-[12px] font-body font-semibold text-[#1e293b]">{r > 0 ? 'Positive' : 'Negative'}: as one rises, the other {r > 0 ? 'rises' : 'falls'}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-gray-100">
              <p className="text-[10px] font-data text-[#475569]">Strength</p>
              <p className="text-[16px] font-data font-bold text-[#264653]">r = {r?.toFixed(2)}</p>
              <p className="text-[11px] font-body text-[#475569]">({Math.abs(r) > 0.7 ? 'strong' : Math.abs(r) > 0.4 ? 'moderate' : 'weak'})</p>
            </div>
          </div>
          <p className="text-[10px] font-body italic text-[#64748b] mt-2">N=12. Correlation only.</p>
        </div>
      )}
      {activeView === 'Scatter' && !narrative && (!xMetric || !yMetric) && (
        <div className="bg-[#f8fafc] rounded-xl p-4 border border-gray-200">
          <p className="text-[12px] font-body text-[#475569]">Select two metrics to see correlation analysis.</p>
        </div>
      )}
      {activeView !== 'Scatter' && (
        <div className="bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] rounded-xl p-4 border border-[#264653]/15 shadow-sm">
          <p className="text-[13px] font-body font-bold text-[#264653] mb-2">What this shows</p>
          <p className="text-[12px] font-body text-[#334155] leading-relaxed">
            {activeView === 'Rankings' && rankMetric && METRIC_MAP[rankMetric] && (
              `${rankMetric} ranked highest to lowest across 12 countries. ${METRIC_MAP[rankMetric].desc} Dashed line = 12-country average.`
            )}
            {activeView === 'Rankings' && (!rankMetric || !METRIC_MAP[rankMetric]) && 'Select a metric to rank countries.'}
            {activeView === 'Radar' && 'Compare 2-3 countries across 8 normalized metrics. Each axis scales 0-1 within the 12-country range. Larger shape = higher values. GII is inverted (higher = more equal).'}
            {activeView === 'Timeline' && rankMetric && (() => {
              const tm = TIMELINE_METRICS.find(m => m.metricName === rankMetric)
              if (!tm) return 'Select a metric to see trends over time.'
              const descriptions = {
                'Education Age': 'How the age of completing education has shifted since 1990. Rising lines reflect longer time in school and expanding higher education access.',
                'Marriage Age (F)': 'How the average age women first marry has changed since 2001. Nearly all countries show a rising trend as marriage is delayed.',
                'Fertility Rate': 'How fertility rates have fallen since 1960. The dashed line at 2.1 marks replacement level. Below it, populations shrink without immigration.',
                'Retirement Age': 'How effective retirement ages have shifted since 1970. Rising lines reflect policy changes to address aging populations and pension sustainability.',
              }
              return descriptions[rankMetric] || `${rankMetric} over time. Each line = one country.`
            })()}
            {activeView === 'Timeline' && !rankMetric && 'Select a metric to see trends over time.'}
          </p>
        </div>
      )}
    </div>
  )
}

// === SCATTER VIEW ===
function ScatterView({ selectedCountries, xMetric, yMetric, setXMetric, setYMetric }) {
  const [hovered, setHovered] = useState(null)
  const [dragOverX, setDragOverX] = useState(false)
  const [dragOverY, setDragOverY] = useState(false)

  const xM = METRIC_MAP[xMetric]
  const yM = METRIC_MAP[yMetric]

  const points = useMemo(() => {
    if (!xM || !yM) return []
    return correlations
      .filter(c => selectedCountries.includes(c.country) && c[xM.key] != null && c[yM.key] != null)
      .map(c => ({ code: c.country, name: c.name, x: c[xM.key], y: c[yM.key], color: COUNTRY_CONFIG[c.country]?.color || '#999' }))
  }, [selectedCountries, xM, yM])

  const r = useMemo(() => {
    if (points.length < 3) return 0
    return pearsonR(points.map(p=>p.x), points.map(p=>p.y))
  }, [points])

  const narrative = useMemo(() => {
    if (!xM || !yM) return null
    return correlationNarratives.correlations?.find(c =>
      (c.milestone === xM.key || c.milestone === xM.key.replace('_age','').replace('_completion','')) &&
      (c.outcome === yM.key || c.outcome === yM.key.replace('_age',''))
    )
  }, [xM, yM])

  // Chart dimensions
  const W=800, H=550, M={t:40,r:40,b:80,l:80}
  const pw=W-M.l-M.r, ph=H-M.t-M.b

  const { xRange, yRange, sx, sy } = useMemo(() => {
    if (points.length === 0) return { xRange:[0,1], yRange:[0,1], sx:()=>M.l, sy:()=>M.t }
    const xMin=Math.min(...points.map(p=>p.x)), xMax=Math.max(...points.map(p=>p.x))
    const yMin=Math.min(...points.map(p=>p.y)), yMax=Math.max(...points.map(p=>p.y))
    const xPad=(xMax-xMin)*0.12||1, yPad=(yMax-yMin)*0.12||1
    const xR=[xMin-xPad,xMax+xPad], yR=[yMin-yPad,yMax+yPad]
    return {
      xRange:xR, yRange:yR,
      sx: v => M.l+((v-xR[0])/(xR[1]-xR[0]))*pw,
      sy: v => M.t+ph-((v-yR[0])/(yR[1]-yR[0]))*ph,
    }
  }, [points])

  function handleDrop(axis, e) {
    e.preventDefault()
    const name = e.dataTransfer.getData('text/plain')
    if (METRIC_MAP[name]) { axis === 'x' ? setXMetric(name) : setYMetric(name) }
    setDragOverX(false); setDragOverY(false)
  }

  return (
    <div>
      {/* Drop zones */}
      <div className="flex gap-4 mb-4">
        <div onDragOver={e=>{e.preventDefault();setDragOverX(true)}} onDragLeave={()=>setDragOverX(false)}
          onDrop={e=>handleDrop('x',e)}
          className={`flex-1 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all
            ${dragOverX ? 'border-[#264653] bg-[#264653]/5' : 'border-[#cbd5e1] bg-[#f8fafc]'}`}>
          {xMetric ? (
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-body font-semibold" style={{color:xM?.color}}>{xMetric}</span>
              <button onClick={()=>setXMetric(null)} className="w-5 h-5 rounded-full bg-gray-300 text-white text-[11px] flex items-center justify-center cursor-pointer">x</button>
            </div>
          ) : <span className="text-[15px] font-body text-[#94a3b8]">Drop X-axis metric here</span>}
        </div>
        <div onDragOver={e=>{e.preventDefault();setDragOverY(true)}} onDragLeave={()=>setDragOverY(false)}
          onDrop={e=>handleDrop('y',e)}
          className={`flex-1 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all
            ${dragOverY ? 'border-[#264653] bg-[#264653]/5' : 'border-[#cbd5e1] bg-[#f8fafc]'}`}>
          {yMetric ? (
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-body font-semibold" style={{color:yM?.color}}>{yMetric}</span>
              <button onClick={()=>setYMetric(null)} className="w-5 h-5 rounded-full bg-gray-300 text-white text-[11px] flex items-center justify-center cursor-pointer">x</button>
            </div>
          ) : <span className="text-[15px] font-body text-[#94a3b8]">Drop Y-axis metric here</span>}
        </div>
      </div>
      {/* Presets removed */}

      {/* Chart */}
      {xM && yM && points.length > 0 && (
        <ExpandableChart title={`${xMetric} vs ${yMetric}`}>
        <div className="relative bg-white rounded-xl border border-gray-200 p-4">
          {/* R value */}
          <div className="absolute top-4 right-6 text-right">
            <span className="font-data text-[22px] font-bold text-[#264653]">r = {r.toFixed(2)}</span>
            <span className="block font-data text-[14px] text-[#475569]">N = {points.length}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{maxHeight:'550px'}}>
            {/* Grid */}
            {Array.from({length:5}).map((_,i)=>{
              const v=yRange[0]+(yRange[1]-yRange[0])*(i/4)
              return <line key={i} x1={M.l} y1={sy(v)} x2={W-M.r} y2={sy(v)} stroke="#f1f5f9" strokeWidth="1"/>
            })}
            {/* Axes */}
            <line x1={M.l} y1={H-M.b} x2={W-M.r} y2={H-M.b} stroke="#e2e8f0" strokeWidth="1"/>
            <line x1={M.l} y1={M.t} x2={M.l} y2={H-M.b} stroke="#e2e8f0" strokeWidth="1"/>
            {/* X ticks */}
            {Array.from({length:5}).map((_,i)=>{
              const v=xRange[0]+(xRange[1]-xRange[0])*(i/4)
              return <text key={i} x={sx(v)} y={H-M.b+20} textAnchor="middle" fill="#475569" fontSize="13" fontFamily="Inter">{formatVal(xM.key,v)}</text>
            })}
            {/* Y ticks */}
            {Array.from({length:5}).map((_,i)=>{
              const v=yRange[0]+(yRange[1]-yRange[0])*(i/4)
              return <text key={i} x={M.l-12} y={sy(v)+5} textAnchor="end" fill="#475569" fontSize="13" fontFamily="Inter">{formatVal(yM.key,v)}</text>
            })}
            {/* X axis label */}
            <text x={M.l+pw/2} y={H-15} textAnchor="middle" fill="#264653" fontSize="15" fontFamily="Inter" fontWeight="600">{xMetric}</text>
            {/* Y axis label */}
            <text x={16} y={M.t+ph/2} textAnchor="middle" fill="#264653" fontSize="15" fontFamily="Inter" fontWeight="600" transform={`rotate(-90,16,${M.t+ph/2})`}>{yMetric}</text>
            {/* Average reference lines */}
            {(() => {
              const avgX = points.reduce((s,p) => s+p.x, 0) / points.length
              const avgY = points.reduce((s,p) => s+p.y, 0) / points.length
              return (
                <g>
                  <line x1={sx(avgX)} y1={M.t} x2={sx(avgX)} y2={H-M.b} stroke="#E76F51" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3"/>
                  <line x1={M.l} y1={sy(avgY)} x2={W-M.r} y2={sy(avgY)} stroke="#E76F51" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3"/>
                  <text x={sx(avgX)+4} y={M.t+14} fill="#E76F51" fontSize="11" fontFamily="Inter">12-country avg</text>
                </g>
              )
            })()}
            {/* Dots */}
            {points.map(p=>(
              <g key={p.code} onMouseEnter={()=>setHovered(p)} onMouseLeave={()=>setHovered(null)} className="cursor-pointer">
                <circle cx={sx(p.x)} cy={sy(p.y)} r={hovered?.code===p.code?18:12} fill={p.color} opacity={0.85} className="transition-all duration-150"/>
                <text x={sx(p.x)>W-M.r-100?sx(p.x)-16:sx(p.x)+16} y={sy(p.y)+5}
                  textAnchor={sx(p.x)>W-M.r-100?'end':'start'}
                  fill={p.color} fontSize="13" fontFamily="Inter" fontWeight="700"
                  style={{textShadow:'0 0 3px white,0 0 3px white,0 0 3px white'}}>{p.code}</text>
              </g>
            ))}
          </svg>
          {/* Tooltip */}
          {hovered && (
            <div className="absolute top-16 left-16 bg-white shadow-xl rounded-xl p-5 border border-gray-200 z-50 min-w-[240px]">
              <p className="font-body font-bold text-[16px] text-[#264653]">{hovered.name}</p>
              <p className="font-body text-[14px] text-[#475569] mt-1">{xMetric}: {formatVal(xM.key, hovered.x)} {xM.unit}</p>
              <p className="font-body text-[14px] text-[#475569]">{yMetric}: {formatVal(yM.key, hovered.y)} {yM.unit}</p>
            </div>
          )}
          {/* Region color legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {[
              { color: '#2D6A4F', label: 'Nordic' },
              { color: '#457B9D', label: 'W. Europe / Oceania' },
              { color: '#E76F51', label: 'East Asia' },
              { color: '#C2185B', label: 'Americas' },
              { color: '#7B2D8E', label: 'South Asia' },
            ].map(r => (
              <span key={r.label} className="flex items-center gap-1.5 text-[14px] font-body text-[#475569]">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}/> {r.label}
              </span>
            ))}
          </div>
        </div>
        </ExpandableChart>
      )}
      {(!xM || !yM) && (
        <div className="flex items-center justify-center h-[400px] bg-[#f8fafc] rounded-xl border border-dashed border-gray-300">
          <p className="text-[16px] font-body text-[#94a3b8]">Drag metrics to both axes to see the chart</p>
        </div>
      )}

      {/* Trend explanation - now shown in right panel */}
    </div>
  )
}

// === RADAR VIEW ===
const RADAR_AXES = [
  { key: 'education_completion_age', label: 'Education' },
  { key: 'marriage_age', label: 'Marriage (F)' },
  { key: 'fertility_rate', label: 'Fertility Rate' },
  { key: 'hale', label: 'HALE (Healthy Years)' },
  { key: 'happiness', label: 'Happiness' },
  { key: 'gdp_per_capita', label: 'GDP' },
  { key: 'gender_inequality_index', label: 'GII (inv)', inverted: true },
  { key: 'female_lfpr', label: 'LFPR' },
]

function RadarView({ selectedCountries }) {
  // Use up to 3 selected countries for radar comparison
  const radarCountries = selectedCountries.slice(0, 3)
  const [hovered, setHovered] = useState(null)

  // Compute min/max for normalization
  const ranges = useMemo(() => {
    const r = {}
    for (const axis of RADAR_AXES) {
      const vals = correlations.map(c => c[axis.key]).filter(v => v != null)
      r[axis.key] = { min: Math.min(...vals), max: Math.max(...vals) }
    }
    return r
  }, [])

  function normalize(key, val, inverted) {
    if (val == null) return 0
    const { min, max } = ranges[key]
    if (max === min) return 0.5
    const norm = (val - min) / (max - min)
    const raw = inverted ? 1 - norm : norm
    // Apply minimum floor of 8% so lowest-scoring countries still have a visible shape
    return 0.08 + raw * 0.92
  }

  // Radar geometry
  const cx = 200, cy = 200, radius = 150
  const numAxes = RADAR_AXES.length

  function getPoint(axisIdx, value) {
    const angle = (Math.PI * 2 * axisIdx) / numAxes - Math.PI / 2
    const r = radius * value
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  function getPolygonPoints(code) {
    return RADAR_AXES.map((axis, i) => {
      const c = correlations.find(d => d.country === code)
      const val = c ? normalize(axis.key, c[axis.key], axis.inverted) : 0
      return getPoint(i, val)
    })
  }

  return (
    <div>
      {/* Radar chart */}
      <p className="text-[14px] font-body text-[#475569] mb-4">Select 2-3 countries from the left panel to compare (max 3)</p>
      <ExpandableChart title="Radar Comparison">
      <div className="flex justify-center">
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1.0].map(level => (
            <circle key={level} cx={cx} cy={cy} r={radius * level} fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          ))}
          {/* Axis lines */}
          {RADAR_AXES.map((axis, i) => {
            const end = getPoint(i, 1)
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e5e7eb" strokeWidth="1"/>
          })}
          {/* Country polygons */}
          {radarCountries.map(code => {
            const points = getPolygonPoints(code)
            const color = COUNTRY_CONFIG[code]?.color || '#999'
            const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
            return (
              <g key={code}>
                <path d={pathD} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"/>
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="4" fill={color}/>
                ))}
              </g>
            )
          })}
          {/* Axis labels */}
          {RADAR_AXES.map((axis, i) => {
            const labelPoint = getPoint(i, 1.18)
            return (
              <text key={i} x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle"
                fill="#264653" fontSize="12" fontFamily="Inter" fontWeight="600"
                onMouseEnter={() => setHovered(axis.key)} onMouseLeave={() => setHovered(null)}
                className="cursor-pointer">
                {axis.label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm max-w-[400px] mx-auto">
          <p className="text-[14px] font-body font-bold text-[#264653] mb-2">
            {RADAR_AXES.find(a => a.key === hovered)?.label} (raw values)
          </p>
          {radarCountries.map(code => {
            const c = correlations.find(d => d.country === code)
            const val = c?.[hovered]
            return (
              <p key={code} className="text-[14px] font-body text-[#475569]">
                <span style={{ color: COUNTRY_CONFIG[code]?.color }} className="font-semibold">{COUNTRY_CONFIG[code]?.name}</span>: {val != null ? (val >= 1000 ? `$${(val/1000).toFixed(0)}k` : val.toFixed(2)) : '--'}
              </p>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        {radarCountries.map(code => (
          <span key={code} className="flex items-center gap-2 text-[14px] font-body text-[#475569]">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COUNTRY_CONFIG[code]?.color }}/>
            {COUNTRY_CONFIG[code]?.name}
          </span>
        ))}
      </div>
      <p className="text-[13px] font-body italic text-[#64748b] text-center mt-3">
        Values normalized 0-1 within the 12-country range. GII is inverted (higher = more equal).
      </p>
      </ExpandableChart>

      {/* What this shows - inline for radar since right panel is hidden */}
      <div className="bg-[#f8fafc] rounded-lg p-4 border border-gray-200 mt-6 max-w-[600px] mx-auto">
        <p className="text-[12px] font-body font-bold text-[#1e293b] mb-1">What this shows</p>
        <p className="text-[11px] font-body text-[#334155] leading-relaxed">
          Compare 2-3 countries across 8 normalized metrics. Each axis scales 0-1 within the 12-country range. Larger shape = higher values. Select countries from the left panel (first 3 selected will be shown).
        </p>
      </div>
    </div>
  )
}

// === RANKINGS VIEW ===
function RankingsView({ selectedCountries, rankMetric }) {
  const m = METRIC_MAP[rankMetric]
  const data = useMemo(() => {
    if (!m) return []
    return correlations
      .filter(c => selectedCountries.includes(c.country) && c[m.key] != null)
      .map(c => ({ code: c.country, name: c.name, value: c[m.key], color: COUNTRY_CONFIG[c.country]?.color || '#999' }))
      .sort((a,b) => b.value - a.value)
  }, [selectedCountries, m])

  const maxVal = data.length > 0 ? Math.max(...data.map(d=>d.value)) : 1
  const avg = data.length > 0 ? data.reduce((s,d)=>s+d.value,0)/data.length : 0
  const avgPct = (avg / maxVal) * 100

  if (!m) return <p className="text-[16px] font-body text-[#475569] py-20 text-center">Click a metric in the left panel to rank countries.</p>

  return (
    <div>
      <p className="text-[14px] font-body text-[#475569] mb-1">{rankMetric}. ranked highest to lowest</p>
      <p className="text-[14px] font-body text-[#475569] mb-6">{m.desc}</p>

      <ExpandableChart title={`${rankMetric} Rankings`}>
      <div className="relative">
        <div className="space-y-2">
          {data.map((d, i) => {
            const pct = (d.value / maxVal) * 100
            return (
              <div key={d.code} className="flex items-center gap-3 group">
                <span className="w-[120px] text-right text-[15px] font-body font-bold text-[#264653] shrink-0">{d.name}</span>
                <div className="flex-1 relative h-10">
                  <div className="absolute inset-0 bg-[#f1f5f9] rounded-r-lg"/>
                  <div className="absolute top-0 left-0 h-full rounded-r-lg transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: d.color, opacity: 0.85 }}/>
                  {/* Average line inside each bar row */}
                  {i === 0 && (
                    <div className="absolute top-0 h-[calc(100%*12+100%*11)] border-l-2 border-dashed border-[#E76F51] z-10 pointer-events-none"
                      style={{ left: `${avgPct}%`, height: `${data.length * 48}px` }}/>
                  )}
                </div>
                <span className="w-[120px] text-[14px] font-data font-bold text-[#264653] shrink-0 text-right whitespace-nowrap">
                  {formatVal(m.key, d.value)} {m.unit}
                </span>
              </div>
            )
          })}
        </div>

        {/* Average label */}
        <div className="mt-2 text-[13px] font-data text-[#E76F51]" style={{ marginLeft: '120px' }}>
          12-country avg: {formatVal(m.key, avg)}
        </div>
        {/* Region legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4" style={{ marginLeft: '120px' }}>
          {[
            { color: '#2D6A4F', label: 'Nordic' },
            { color: '#457B9D', label: 'W. Europe / Oceania' },
            { color: '#E76F51', label: 'East Asia' },
            { color: '#C2185B', label: 'Americas' },
            { color: '#7B2D8E', label: 'South Asia' },
          ].map(r => (
            <span key={r.label} className="flex items-center gap-1.5 text-[14px] font-body text-[#475569]">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }}/> {r.label}
            </span>
          ))}
        </div>
      </div>
      </ExpandableChart>
    </div>
  )
}

// === TIMELINE VIEW ===
const TIMELINE_METRICS = [
  { id: 'education', label: 'Education Age', data: educationData, valueKey: 'completion_age', unit: 'years', yearRange: [1990, 2023], metricName: 'Education Age' },
  { id: 'marriage', label: 'Marriage Age (F)', data: marriageData, valueKey: 'age', unit: 'years', yearRange: [2001, 2021], filter: d => d.sex === 'Female', metricName: 'Marriage Age (F)' },
  { id: 'fertility', label: 'Fertility Rate', data: fertilityData, valueKey: 'fertility_rate', unit: 'children/woman', yearRange: [1960, 2023], refLine: { y: 2.1, label: 'Replacement level (2.1)' }, metricName: 'Fertility Rate' },
  { id: 'retirement', label: 'Retirement Age', data: retirementData, valueKey: 'retirement_age', unit: 'years', yearRange: [1970, 2024], filter: d => d.sex === 'Female', metricName: 'Retirement Age' },
]

// Metric names that have timeline data
const TIMELINE_METRIC_NAMES = TIMELINE_METRICS.map(m => m.metricName)

function TimelineView({ selectedCountries, rankMetric }) {
  const metricIdx = useMemo(() => {
    const idx = TIMELINE_METRICS.findIndex(m => m.metricName === rankMetric)
    return idx >= 0 ? idx : 2 // default to fertility rate
  }, [rankMetric])
  const metric = TIMELINE_METRICS[metricIdx]

  const lines = useMemo(() => {
    return selectedCountries.map(code => {
      let d = metric.data.filter(r => r.country === code)
      if (metric.filter) d = d.filter(metric.filter)
      const points = d.filter(r => r[metric.valueKey] != null).map(r => ({ year: r.year, value: r[metric.valueKey] })).sort((a, b) => a.year - b.year)
      return { code, name: COUNTRY_CONFIG[code]?.name || code, color: COUNTRY_CONFIG[code]?.color || '#999', points }
    }).filter(l => l.points.length > 0)
  }, [selectedCountries, metric])

  // Chart dimensions
  const W = 750, H = 420, M = { t: 30, r: 80, b: 50, l: 60 }
  const pw = W - M.l - M.r, ph = H - M.t - M.b

  const { xRange, yRange } = useMemo(() => {
    const allYears = lines.flatMap(l => l.points.map(p => p.year))
    const allVals = lines.flatMap(l => l.points.map(p => p.value))
    if (allYears.length === 0) return { xRange: metric.yearRange, yRange: [0, 5] }
    const yMin = Math.min(...allVals), yMax = Math.max(...allVals)
    const yPad = (yMax - yMin) * 0.1 || 1
    return { xRange: [Math.min(...allYears), Math.max(...allYears)], yRange: [yMin - yPad, yMax + yPad] }
  }, [lines, metric])

  const sx = v => M.l + ((v - xRange[0]) / (xRange[1] - xRange[0])) * pw
  const sy = v => M.t + ph - ((v - yRange[0]) / (yRange[1] - yRange[0])) * ph

  return (
    <div>
      {lines.length === 0 ? (
        <div className="flex items-center justify-center h-[400px] bg-[#f8fafc] rounded-xl border border-gray-200">
          <p className="text-[16px] font-body text-[#475569]">No data available for selected countries</p>
        </div>
      ) : (
        <ExpandableChart title={`${metric.label} over time`}>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '450px' }}>
            {/* Grid */}
            {Array.from({ length: 5 }).map((_, i) => {
              const v = yRange[0] + (yRange[1] - yRange[0]) * (i / 4)
              return <line key={i} x1={M.l} y1={sy(v)} x2={W - M.r} y2={sy(v)} stroke="#f1f5f9" strokeWidth="1"/>
            })}
            {/* Axes */}
            <line x1={M.l} y1={H - M.b} x2={W - M.r} y2={H - M.b} stroke="#e2e8f0" strokeWidth="1"/>
            <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="#e2e8f0" strokeWidth="1"/>
            {/* X ticks */}
            {Array.from({ length: 6 }).map((_, i) => {
              const yr = xRange[0] + (xRange[1] - xRange[0]) * (i / 5)
              return <text key={i} x={sx(yr)} y={H - M.b + 20} textAnchor="middle" fill="#475569" fontSize="13" fontFamily="Inter">{Math.round(yr)}</text>
            })}
            {/* Y ticks */}
            {Array.from({ length: 5 }).map((_, i) => {
              const v = yRange[0] + (yRange[1] - yRange[0]) * (i / 4)
              return <text key={i} x={M.l - 10} y={sy(v) + 4} textAnchor="end" fill="#475569" fontSize="13" fontFamily="Inter">{v.toFixed(1)}</text>
            })}
            {/* Reference line (fertility replacement level) */}
            {metric.refLine && (
              <g>
                <line x1={M.l} y1={sy(metric.refLine.y)} x2={W - M.r} y2={sy(metric.refLine.y)} stroke="#E76F51" strokeWidth="1.5" strokeDasharray="6 4"/>
                <text x={W - M.r + 4} y={sy(metric.refLine.y) + 4} fill="#E76F51" fontSize="12" fontFamily="Inter">{metric.refLine.label}</text>
              </g>
            )}
            {/* Lines */}
            {lines.map(l => {
              const pathD = l.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.year)},${sy(p.value)}`).join(' ')
              const lastPt = l.points[l.points.length - 1]
              return (
                <g key={l.code}>
                  <path d={pathD} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Country label at end */}
                  <text x={sx(lastPt.year) + 6} y={sy(lastPt.value) + 4} fill={l.color} fontSize="13" fontFamily="Inter" fontWeight="700">
                    {l.code}
                  </text>
                </g>
              )
            })}
            {/* KOR annotation for fertility */}
            {metric.id === 'fertility' && lines.find(l => l.code === 'KOR') && (() => {
              const kor = lines.find(l => l.code === 'KOR')
              const lastPt = kor.points[kor.points.length - 1]
              if (!lastPt) return null
              return (
                <g>
                  <line x1={sx(lastPt.year)} y1={sy(lastPt.value) - 5} x2={sx(lastPt.year) - 30} y2={sy(lastPt.value) - 30} stroke="#264653" strokeWidth="1"/>
                  <rect x={sx(lastPt.year) - 180} y={sy(lastPt.value) - 46} width="150" height="22" rx="4" fill="white" stroke="#e5e7eb"/>
                  <text x={sx(lastPt.year) - 105} y={sy(lastPt.value) - 32} textAnchor="middle" fill="#264653" fontSize="11" fontFamily="Inter">
                    0.72: steepest decline ever
                  </text>
                </g>
              )
            })()}
            {/* Axis labels */}
            <text x={M.l + pw / 2} y={H - 8} textAnchor="middle" fill="#475569" fontSize="14" fontFamily="Inter">Year</text>
            <text x={14} y={M.t + ph / 2} textAnchor="middle" fill="#475569" fontSize="14" fontFamily="Inter" transform={`rotate(-90,14,${M.t + ph / 2})`}>{metric.label} ({metric.unit})</text>
          </svg>
        </div>
        </ExpandableChart>
      )}
    </div>
  )
}

// === MAIN EXPLORE COMPONENT ===
export default function Explore() {
  const [activeView, setActiveView] = useState('Scatter')
  const [selectedCountries, setSelectedCountries] = useState(ALL_CODES)
  const [xMetric, setXMetric] = useState('Marriage Age (F)')
  const [yMetric, setYMetric] = useState('GDP per Capita')
  const [rankMetric, setRankMetric] = useState('Fertility Rate')

  return (
    <section id="explore" className="bg-white py-20 px-6 relative">
      {/* Background - diverse crowd from above */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover" loading="lazy"/>
        <div className="absolute inset-0" style={{ backgroundColor: '#ffffff', opacity: 0.94 }}/>
      </div>
      <div className="max-w-[1280px] mx-auto relative z-10">
        {/* Header */}
        <h2 className="font-display text-[36px] text-[#264653] mb-2">Explore the Data</h2>
        <p className="font-body text-[18px] text-[#475569] mb-6">Pick a marker. Pick an outcome. Watch the pattern emerge.</p>

        {/* View switcher */}
        <div className="flex gap-2 mb-8">
          {VIEWS.map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-5 py-2 rounded-full text-[15px] font-body font-semibold cursor-pointer transition-all
                ${activeView === v ? 'bg-[#264653] text-white' : 'bg-gray-100 text-[#475569] hover:bg-gray-200'}`}>
              {v}
            </button>
          ))}
        </div>

        {/* Three-pane layout: left metrics | center chart | right countries */}
        <div className="flex gap-6">
          <LeftPane
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            mode={activeView.toLowerCase()}
            xMetric={xMetric} yMetric={yMetric}
            setXMetric={setXMetric} setYMetric={setYMetric}
            rankMetric={rankMetric} setRankMetric={setRankMetric}
          />
          <div className="flex-1 min-w-0">
            {activeView === 'Scatter' && (
              <ScatterView selectedCountries={selectedCountries}
                xMetric={xMetric} yMetric={yMetric}
                setXMetric={setXMetric} setYMetric={setYMetric}/>
            )}
            {activeView === 'Rankings' && (
              <RankingsView selectedCountries={selectedCountries} rankMetric={rankMetric}/>
            )}
            {activeView === 'Radar' && (
              <RadarView selectedCountries={selectedCountries}/>
            )}
            {activeView === 'Timeline' && (
              <TimelineView selectedCountries={selectedCountries} rankMetric={rankMetric}/>
            )}
          </div>
          {activeView !== 'Radar' && (
          <CountryFilter selectedCountries={selectedCountries} setSelectedCountries={setSelectedCountries} activeView={activeView}
            rankMetric={rankMetric}
            narrative={(() => {
              const xM = METRIC_MAP[xMetric]; const yM = METRIC_MAP[yMetric]
              if (!xM || !yM) return null
              return correlationNarratives.correlations?.find(c => (c.milestone === xM.key || c.milestone === xM.key.replace('_age','').replace('_completion','')) && (c.outcome === yM.key || c.outcome === yM.key.replace('_age','')))
            })()}
            r={(() => {
              const xM = METRIC_MAP[xMetric]; const yM = METRIC_MAP[yMetric]
              if (!xM || !yM) return 0
              const pts = correlations.filter(c => selectedCountries.includes(c.country) && c[xM.key] != null && c[yM.key] != null)
              if (pts.length < 3) return 0
              return pearsonR(pts.map(p=>p[xM.key]), pts.map(p=>p[yM.key]))
            })()}
            xMetric={xMetric} yMetric={yMetric}/>
          )}
        </div>
      </div>
    </section>
  )
}


