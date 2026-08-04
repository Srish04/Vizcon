import { useState, useMemo, useRef, useEffect } from 'react'
import correlations from '../data/correlations.json'
import correlationNarratives from '../data/correlation_narratives.json'

const COUNTRY_CONFIG = {
  SWE:{name:'Sweden',code:'SE',region:'Nordic',color:'#2D6A4F'},
  ITA:{name:'Italy',code:'IT',region:'W. Europe',color:'#457B9D'},
  JPN:{name:'Japan',code:'JP',region:'E. Asia',color:'#E76F51'},
  KOR:{name:'S. Korea',code:'KR',region:'E. Asia',color:'#E76F51'},
  AUS:{name:'Australia',code:'AU',region:'Oceania',color:'#457B9D'},
  FRA:{name:'France',code:'FR',region:'W. Europe',color:'#457B9D'},
  DNK:{name:'Denmark',code:'DK',region:'Nordic',color:'#2D6A4F'},
  DEU:{name:'Germany',code:'DE',region:'W. Europe',color:'#457B9D'},
  USA:{name:'USA',code:'US',region:'Americas',color:'#C2185B'},
  BRA:{name:'Brazil',code:'BR',region:'Americas',color:'#C2185B'},
  MEX:{name:'Mexico',code:'MX',region:'Americas',color:'#C2185B'},
  IND:{name:'India',code:'IN',region:'S. Asia',color:'#7B2D8E'},
}
const ALL_CODES = Object.keys(COUNTRY_CONFIG)

const METRIC_CONFIG = {
  marriage_age:{label:'Marriage Age (F)',unit:'years',cat:'milestone'},
  education_completion_age:{label:'Education Completion',unit:'years',cat:'milestone'},
  leaving_home_age:{label:'Leaving Home',unit:'years',cat:'milestone'},
  cohabitation_age:{label:'Cohabitation Age',unit:'years',cat:'milestone'},
  first_home_age:{label:'First Home Age',unit:'years',cat:'milestone'},
  first_birth_age:{label:'First Child Age',unit:'years',cat:'milestone'},
  menarche_age:{label:'Menarche Age',unit:'years',cat:'milestone'},
  menopause_age:{label:'Menopause Age',unit:'years',cat:'milestone'},
  retirement_age:{label:'Retirement Age',unit:'years',cat:'milestone'},
  fertility_rate:{label:'Fertility Rate',unit:'children',cat:'milestone'},
  happiness:{label:'Happiness Score',unit:'/10',cat:'outcome'},
  life_expectancy:{label:'Life Expectancy',unit:'years',cat:'outcome'},
  gdp_per_capita:{label:'GDP per Capita',unit:'PPP $',cat:'outcome'},
  female_lfpr:{label:'Female LFPR',unit:'%',cat:'outcome'},
  hale:{label:'Healthy Life (HALE)',unit:'years',cat:'outcome'},
  divorce_rate:{label:'Divorce Rate',unit:'per 1000',cat:'outcome'},
  maternal_mortality:{label:'Maternal Mortality',unit:'per 100k',cat:'outcome'},
  adolescent_fertility:{label:'Adolescent Fertility',unit:'per 1000',cat:'outcome'},
  gender_inequality_index:{label:'Gender Inequality',unit:'index',cat:'outcome'},
}
const METRIC_KEYS = Object.keys(METRIC_CONFIG)

const PRESETS = [
  {x:'marriage_age',y:'gdp_per_capita',label:'Marriage × GDP',r:'0.78'},
  {x:'marriage_age',y:'gender_inequality_index',label:'Marriage × GII',r:'-0.90'},
  {x:'education_completion_age',y:'happiness',label:'Education × Happiness',r:'0.72'},
  {x:'menarche_age',y:'adolescent_fertility',label:'Menarche × Adol. Fertility',r:'-0.65'},
]

const VIEWS = [
  {id:'scatter',icon:'📊',label:'Scatter'},
  {id:'rankings',icon:'📈',label:'Rankings'},
  {id:'radar',icon:'🕸️',label:'Radar'},
  {id:'timeline',icon:'📉',label:'Timeline'},
]

function pearsonR(xs, ys) {
  const n = xs.length; if (n < 3) return 0
  const mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n
  let num=0, dx2=0, dy2=0
  for (let i=0;i<n;i++) { const dx=xs[i]-mx, dy=ys[i]-my; num+=dx*dy; dx2+=dx*dx; dy2+=dy*dy }
  const den = Math.sqrt(dx2*dy2)
  return den===0 ? 0 : num/den
}

// ===== SCATTER VIEW =====
function ScatterView({ selectedCountries, xKey, yKey, setXKey, setYKey }) {
  const [hovered, setHovered] = useState(null)

  const points = useMemo(() => {
    return correlations
      .filter(c => selectedCountries.includes(c.country) && c[xKey] != null && c[yKey] != null)
      .map(c => ({ code: c.country, name: c.name, x: c[xKey], y: c[yKey], ...COUNTRY_CONFIG[c.country] }))
  }, [selectedCountries, xKey, yKey])

  const r = useMemo(() => {
    if (points.length < 3) return 0
    return pearsonR(points.map(p=>p.x), points.map(p=>p.y))
  }, [points])

  const xMin = Math.min(...points.map(p=>p.x)), xMax = Math.max(...points.map(p=>p.x))
  const yMin = Math.min(...points.map(p=>p.y)), yMax = Math.max(...points.map(p=>p.y))
  const xPad = (xMax-xMin)*0.1||1, yPad = (yMax-yMin)*0.1||1
  const xRange = [xMin-xPad, xMax+xPad], yRange = [yMin-yPad, yMax+yPad]

  const W=650, H=420, M={t:30,r:30,b:60,l:70}
  const pw=W-M.l-M.r, ph=H-M.t-M.b
  const sx = v => M.l + ((v-xRange[0])/(xRange[1]-xRange[0]))*pw
  const sy = v => M.t + ph - ((v-yRange[0])/(yRange[1]-yRange[0]))*ph

  // Find narrative
  const narrative = useMemo(() => {
    return correlationNarratives.correlations.find(c => c.milestone === xKey && c.outcome === yKey)
  }, [xKey, yKey])

  const xLabel = METRIC_CONFIG[xKey]?.label || xKey
  const yLabel = METRIC_CONFIG[yKey]?.label || yKey

  return (
    <div>
      {/* Dropdowns + presets */}
      <div className="flex flex-col sm:flex-row gap-4 mb-3">
        <div className="flex-1">
          <label className="text-[11px] font-data text-gray-400 block mb-1">X-axis</label>
          <select value={xKey} onChange={e=>setXKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-body bg-white">
            {METRIC_KEYS.map(k=><option key={k} value={k}>{METRIC_CONFIG[k].label}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[11px] font-data text-gray-400 block mb-1">Y-axis</label>
          <select value={yKey} onChange={e=>setYKey(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-body bg-white">
            {METRIC_KEYS.map(k=><option key={k} value={k}>{METRIC_CONFIG[k].label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map(p=>(
          <button key={p.label} onClick={()=>{setXKey(p.x);setYKey(p.y)}}
            className={`px-3 py-1 rounded-full text-xs font-body border cursor-pointer transition-all
              ${xKey===p.x&&yKey===p.y?'bg-[#264653] text-white border-[#264653]':'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'}`}>
            {p.label} <span className="font-data text-[10px] ml-1 opacity-60">r={p.r}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative bg-gray-50/50 rounded-xl p-4 border border-gray-100">
        <div className="absolute top-4 right-4 font-data text-lg text-[#264653]">
          r = {r.toFixed(2)} <span className="text-xs text-gray-400 ml-1">N = {points.length}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[700px] mx-auto" style={{height:'auto',maxHeight:'450px'}}>
          {/* Axes */}
          <line x1={M.l} y1={M.t+ph} x2={M.l+pw} y2={M.t+ph} stroke="#e5e7eb" strokeWidth="1"/>
          <line x1={M.l} y1={M.t} x2={M.l} y2={M.t+ph} stroke="#e5e7eb" strokeWidth="1"/>
          {/* X ticks */}
          {Array.from({length:5}).map((_,i)=>{
            const v = xRange[0]+(xRange[1]-xRange[0])*(i/4)
            return <g key={i}><line x1={sx(v)} y1={M.t+ph} x2={sx(v)} y2={M.t+ph+5} stroke="#9ca3af" strokeWidth="0.5"/>
              <text x={sx(v)} y={M.t+ph+18} textAnchor="middle" fill="#6b7280" fontSize="10">{v>=1000?(v/1000).toFixed(0)+'k':v.toFixed(1)}</text></g>
          })}
          {/* Y ticks */}
          {Array.from({length:5}).map((_,i)=>{
            const v = yRange[0]+(yRange[1]-yRange[0])*(i/4)
            return <g key={i}><line x1={M.l-5} y1={sy(v)} x2={M.l} y2={sy(v)} stroke="#9ca3af" strokeWidth="0.5"/>
              <text x={M.l-10} y={sy(v)+4} textAnchor="end" fill="#6b7280" fontSize="10">{v>=1000?(v/1000).toFixed(0)+'k':v.toFixed(1)}</text></g>
          })}
          {/* Axis labels */}
          <text x={M.l+pw/2} y={H-8} textAnchor="middle" fill="#374151" fontSize="12" fontFamily="Inter">{xLabel}</text>
          <text x={14} y={M.t+ph/2} textAnchor="middle" fill="#374151" fontSize="12" fontFamily="Inter" transform={`rotate(-90,14,${M.t+ph/2})`}>{yLabel}</text>
          {/* Dots */}
          {points.map(p=>(
            <g key={p.code} onMouseEnter={()=>setHovered(p)} onMouseLeave={()=>setHovered(null)} className="cursor-pointer">
              <circle cx={sx(p.x)} cy={sy(p.y)} r={hovered?.code===p.code?10:7} fill={p.color} opacity={0.85}
                className="transition-all duration-200"/>
              <text x={sx(p.x)+10} y={sy(p.y)+4} fill={p.color} fontSize="10" fontFamily="Inter" fontWeight="500">{p.code}</text>
            </g>
          ))}
        </svg>
        {/* Tooltip */}
        {hovered && (
          <div className="absolute top-12 left-12 bg-white shadow-lg rounded-lg p-3 border border-gray-100 z-10 min-w-[180px]">
            <p className="font-body font-bold text-sm text-[#264653]">{hovered.name}</p>
            <p className="font-data text-xs text-gray-500 mt-1">{xLabel}: {hovered.x>=1000?`$${(hovered.x/1000).toFixed(1)}k`:hovered.x}</p>
            <p className="font-data text-xs text-gray-500">{yLabel}: {hovered.y>=1000?`$${(hovered.y/1000).toFixed(1)}k`:hovered.y}</p>
          </div>
        )}
      </div>

      {/* Narrative card */}
      {narrative && (
        <div className="mt-6 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
          <p className="font-body font-bold text-base text-[#264653] mb-2">{narrative.one_liner}</p>
          <p className="font-body text-sm text-gray-600 leading-relaxed mb-3">{narrative.mechanism}</p>
          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-data
            ${narrative.group==='causal'?'bg-blue-50 text-blue-700':''}
            ${narrative.group==='feedback'?'bg-green-50 text-green-700':''}
            ${narrative.group==='common_cause'?'bg-amber-50 text-amber-700':''}`}>
            {narrative.group==='causal'&&'🔗 Causal relationship'}
            {narrative.group==='feedback'&&'🔄 Feedback loop'}
            {narrative.group==='common_cause'&&'🌐 Shared underlying drivers'}
          </span>
        </div>
      )}
    </div>
  )
}

// ===== RANKINGS VIEW =====
function RankingsView({ selectedCountries, metric, setMetric }) {
  const data = useMemo(() => {
    return correlations
      .filter(c => selectedCountries.includes(c.country) && c[metric] != null)
      .map(c => ({ code: c.country, name: c.name, value: c[metric], ...COUNTRY_CONFIG[c.country] }))
      .sort((a,b) => b.value - a.value)
  }, [selectedCountries, metric])
  const maxVal = Math.max(...data.map(d=>d.value))
  const label = METRIC_CONFIG[metric]?.label || metric

  return (
    <div>
      <select value={metric} onChange={e=>setMetric(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-body bg-white mb-6">
        {METRIC_KEYS.map(k=><option key={k} value={k}>{METRIC_CONFIG[k].label}</option>)}
      </select>
      <p className="text-xs font-data text-gray-400 mb-3">{label} — ranked highest to lowest</p>
      <div className="space-y-2">
        {data.map((d,i) => (
          <div key={d.code} className="flex items-center gap-3">
            <span className="w-20 text-right text-sm font-body text-gray-600">{d.name}</span>
            <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden relative">
              <div className="h-full rounded transition-all duration-500" style={{width:`${(d.value/maxVal)*100}%`,backgroundColor:d.color,opacity:0.8}}/>
            </div>
            <span className="w-16 text-xs font-data text-gray-500">{d.value>=1000?`$${(d.value/1000).toFixed(0)}k`:d.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== MAIN EXPLORE =====
export default function Explore() {
  const [activeView, setActiveView] = useState('scatter')
  const [selectedCountries, setSelectedCountries] = useState(ALL_CODES)
  const [xKey, setXKey] = useState('marriage_age')
  const [yKey, setYKey] = useState('gdp_per_capita')
  const [rankMetric, setRankMetric] = useState('marriage_age')

  function toggleCountry(code) {
    setSelectedCountries(prev => prev.includes(code) ? prev.filter(c=>c!==code) : [...prev, code])
  }

  return (
    <section id="explore" className="bg-white py-24 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-display text-[32px] md:text-[36px] text-[#264653] mb-2">Explore the Data</h2>
        <p className="font-body text-lg text-gray-500 mb-8">24 metrics. 12 countries. Pick any combination.</p>

        {/* View switcher */}
        <div className="flex gap-2 mb-6">
          {VIEWS.map(v=>(
            <button key={v.id} onClick={()=>setActiveView(v.id)}
              className={`px-4 py-2 rounded-full text-sm font-body cursor-pointer transition-all
                ${activeView===v.id?'bg-[#264653] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* Country filter */}
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          <button onClick={()=>setSelectedCountries(ALL_CODES)} className="text-[10px] font-data px-2 py-0.5 rounded bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200">All</button>
          {ALL_CODES.map(code=>{
            const c = COUNTRY_CONFIG[code]
            const active = selectedCountries.includes(code)
            return (
              <button key={code} onClick={()=>toggleCountry(code)}
                className={`w-7 h-7 rounded-full text-[9px] font-data font-bold cursor-pointer transition-all border-2
                  ${active?'text-white':'text-gray-400 bg-white'}`}
                style={active?{backgroundColor:c.color,borderColor:c.color}:{borderColor:'#e5e7eb'}}>
                {c.code}
              </button>
            )
          })}
        </div>

        {/* View content */}
        {activeView === 'scatter' && <ScatterView selectedCountries={selectedCountries} xKey={xKey} yKey={yKey} setXKey={setXKey} setYKey={setYKey} />}
        {activeView === 'rankings' && <RankingsView selectedCountries={selectedCountries} metric={rankMetric} setMetric={setRankMetric} />}
        {activeView === 'radar' && <p className="text-gray-400 font-body py-20 text-center">Radar view — coming soon</p>}
        {activeView === 'timeline' && <p className="text-gray-400 font-body py-20 text-center">Timeline view — coming soon</p>}
      </div>
    </section>
  )
}
