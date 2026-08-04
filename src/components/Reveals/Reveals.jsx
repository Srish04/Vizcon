import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import globalMetrics from '../../data/global_metrics.json'
import surpriseMetrics from '../../data/surprise_metrics.json'

const MILESTONE_COLORS = { education:'#2D6A4F', leave_home:'#2A9D8F', leaving_home:'#2A9D8F', cohabitation:'#00897B', first_home:'#48BFE3', marriage:'#E76F51', first_baby:'#E9C46A' }
const MILESTONE_ABBREV = { education:'Edu', leave_home:'Home', leaving_home:'Home', cohabitation:'Coh', first_home:'1stH', marriage:'Mar', first_baby:'Baby' }
const JOURNEY_CODES = ['SWE','ITA','JPN','KOR','AUS','FRA','DNK','DEU','USA','BRA','MEX','IND']

// ===== CHAPTER 1: Sequences (split layout: text left, viz right) =====
function Chapter1() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2, once: true })
  const socialKeys = new Set(['education','leave_home','leaving_home','cohabitation','first_home','marriage','first_baby'])
  const sequences = surpriseMetrics.milestone_sequences || []
  const sorted = [...sequences].sort((a,b) => {
    const vA=(a.violations||[]).length, vB=(b.violations||[]).length
    if(vB!==vA) return vB-vA
    return ((b.ordered_milestones||[]).findIndex(m=>m.name==='marriage'))-((a.ordered_milestones||[]).findIndex(m=>m.name==='marriage'))
  })
  const babyCount = sequences.filter(s=>(s.violations||[]).includes('baby_before_marriage')).length

  return (
    <section ref={ref} className="min-h-screen flex flex-col md:flex-row items-center px-4 md:px-12 py-12 bg-bg">
      {/* Left: text + expected timeline */}
      <motion.div className="md:w-[40%] mb-8 md:mb-0 md:pr-8"
        initial={{ opacity:0, x:-30 }} animate={inView?{ opacity:1, x:0 }:{}} transition={{ duration:0.6 }}>
        <h2 className="font-display text-2xl md:text-[32px] text-text mb-4 leading-tight">Our assumptions are wrong.</h2>
        <p className="font-body text-sm text-text-secondary mb-4">Most people picture life in order: education, independence, partnership, marriage, children.</p>
        {/* Mini expected sequence */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[#2D6A4F]/5">
          {['📚','🚪','💑','💍','👶'].map((icon,i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="text-lg">{icon}</span>
              {i<4 && <span className="text-text-faint text-xs">→</span>}
            </span>
          ))}
        </div>
        <p className="font-body text-sm text-text-secondary mb-4">But in {babyCount} of {sequences.length} countries, the first child arrives before marriage.</p>
        <p className="font-display text-lg text-text">The assumed sequence is the minority pattern.</p>
        <div className="flex items-center gap-3 mt-4 text-[9px] font-data text-text-faint">
          {Object.entries(MILESTONE_COLORS).slice(0,5).map(([k,c]) => (
            <span key={k} className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm" style={{backgroundColor:c}}/>{MILESTONE_ABBREV[k]||k}</span>
          ))}
        </div>
      </motion.div>

      {/* Right: swim lane visualization */}
      <motion.div className="md:w-[60%]"
        initial={{ opacity:0, x:30 }} animate={inView?{ opacity:1, x:0 }:{}} transition={{ delay:0.3, duration:0.6 }}>
        <p className="text-[9px] font-data text-text-muted mb-1 text-center">Milestones positioned by actual age (18-38)</p>
        <div className="flex items-center mb-1 ml-16 md:ml-20">
          <div className="flex-1 flex justify-between text-[7px] font-data text-text-faint px-1">
            {[18,22,26,30,34,38].map(a=><span key={a}>{a}</span>)}
          </div>
        </div>
        <div className="space-y-1">
          {sorted.map((country, i) => {
            const ms = (country.ordered_milestones||[]).filter(m=>socialKeys.has(m.name)&&m.age>=18&&m.age<=38)
            const hasBaby = (country.violations||[]).includes('baby_before_marriage')
            return (
              <motion.div key={country.country} className="flex items-center"
                initial={{ opacity:0 }} animate={inView?{ opacity:1 }:{}} transition={{ delay:0.4+i*0.05, duration:0.3 }}>
                <span className="w-16 md:w-20 text-right pr-1.5 text-[9px] font-body text-text-muted flex-shrink-0">{country.name}</span>
                <div className="flex-1 relative h-5 bg-[#1a3340]/3 rounded">
                  {ms.map((m,j) => {
                    const left = ((m.age-18)/(38-18))*100
                    const color = MILESTONE_COLORS[m.name]||'#666'
                    return <div key={j} className="absolute top-0.5 h-4 flex items-center justify-center rounded text-[6px] font-data text-white font-medium"
                      style={{ left:`${left}%`, width:'24px', backgroundColor:color, transform:'translateX(-50%)' }}>
                      {MILESTONE_ABBREV[m.name]||''}
                    </div>
                  })}
                  {hasBaby && <span className="absolute -top-0.5 right-0.5 text-[7px] text-[#E76F51] font-bold">↺</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
        <p className="text-[8px] font-data text-text-faint text-right mt-1">↺ = baby before marriage</p>
      </motion.div>
    </section>
  )
}

// ===== CHAPTER 2: Correlations (dark, dense grid) =====
function Chapter2() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15, once: true })
  const data = globalMetrics.filter(c => c.marriage_age_female != null)
  const charts = [
    { yKey:'gdp_per_capita', label:'GDP', r2:0.75 },
    { yKey:'gii', label:'Equality (GII)', r2:0.76 },
    { yKey:'happiness_score', label:'Happiness', r2:0.55 },
    { yKey:'adolescent_fertility', label:'Teen Pregnancies', r2:0.54 },
  ]
  const plotW=200, plotH=130, xMin=17, xMax=36
  const xScale = v => ((v-xMin)/(xMax-xMin))*plotW
  const yScale = (vals,v) => { const mn=Math.min(...vals.filter(x=>x!=null)), mx=Math.max(...vals.filter(x=>x!=null)); return plotH-((v-mn)/(mx-mn))*plotH }

  return (
    <section ref={ref} className="py-12 px-4 md:px-12" style={{ backgroundColor:'#1a2e3b' }}>
      <div className="max-w-[1100px] mx-auto">
        {/* Top: hub-spoke + text side by side */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
          <div className="md:w-[35%]">
            <svg viewBox="0 0 200 140" className="w-full max-w-[220px] h-[140px] mx-auto">
              <circle cx="100" cy="70" r="20" fill="none" stroke="#E76F51" strokeWidth="2"/>
              <text x="100" y="67" textAnchor="middle" fill="#E76F51" fontSize="7">Marriage</text>
              <text x="100" y="77" textAnchor="middle" fill="#E76F51" fontSize="6">Age</text>
              {[{x:35,y:25,l:'GDP',r:0.75},{x:165,y:25,l:'GII',r:0.76},{x:25,y:110,l:'Happy',r:0.55},{x:175,y:110,l:'Teen',r:0.54}].map((s,i) => (
                <g key={i}>
                  <motion.line x1="100" y1="70" x2={s.x} y2={s.y} stroke="rgba(255,255,255,0.35)" strokeWidth={s.r>0.7?2:1.5}
                    strokeDasharray={s.r>0.7?'':'4 3'}
                    initial={{pathLength:0}} animate={inView?{pathLength:1}:{}} transition={{delay:0.3+i*0.15,duration:0.5}}/>
                  <circle cx={s.x} cy={s.y} r="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
                  <text x={s.x} y={s.y+3} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6">{s.l}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="md:w-[65%]">
            <h2 className="font-display text-2xl md:text-[28px] text-white mb-3">One number, many correlations</h2>
            <p className="font-body text-sm text-white/60 leading-relaxed mb-2">
              When women marry correlates with a country's wealth, equality, happiness, and health outcomes across 44 nations.
            </p>
            <p className="font-body text-sm text-white/40 leading-relaxed">
              Not causation. Marriage timing reflects deeper forces: education access, economic opportunity, gender norms, healthcare.
            </p>
            <p className="text-[9px] font-data text-white/25 mt-2 italic">Correlation, not causation. Shared underlying drivers.</p>
          </div>
        </div>

        {/* Scatter grid: 2x2, compact */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial={{ opacity:0 }} animate={inView?{ opacity:1 }:{}} transition={{ delay:0.5, duration:0.6 }}>
          {charts.map(chart => {
            const pts = data.filter(c=>c[chart.yKey]!=null)
            const yVals = pts.map(c=>c[chart.yKey])
            return (
              <div key={chart.yKey} className="bg-white/5 rounded-lg p-3 border border-white/8">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-white/50">{chart.label}</span>
                  <span className="text-[10px] font-data text-[#E76F51] font-bold">{chart.r2}</span>
                </div>
                <svg viewBox={`0 0 ${plotW} ${plotH+15}`} className="w-full h-28">
                  <line x1="0" y1={plotH} x2={plotW} y2={plotH} stroke="rgba(255,255,255,0.1)"/>
                  {pts.map(c => {
                    const cx=xScale(c.marriage_age_female), cy=yScale(yVals,c[chart.yKey])
                    const isJ=JOURNEY_CODES.includes(c.country_code)
                    return <circle key={c.country_code} cx={cx} cy={cy} r={isJ?3.5:2} fill="#E76F51" opacity={isJ?1:0.45}/>
                  })}
                  <text x={plotW/2} y={plotH+12} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7">Marriage age →</text>
                </svg>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ===== CHAPTER 3: Longevity Tax (text+viz integrated) =====
function Chapter3() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.15, once: true })
  const extremes = [
    { code:'SWE', label:'Sweden', extra:3.0, unhealthy:2.8, pct:93, quote:"Not living longer. Dying slower." },
    { code:'ISR', label:'Israel', extra:4.3, unhealthy:6.3, pct:147, quote:"Fewer healthy years than men." },
    { code:'MEX', label:'Mexico', extra:5.6, unhealthy:1.6, pct:29, quote:"Extra years that are genuinely good." },
  ]
  const longevityData = globalMetrics
    .filter(c=>c.extra_years_female>0&&c.longevity_tax_pct!=null)
    .map(c=>({code:c.country_code, extra:c.extra_years_female, healthy:c.extra_healthy_years||0, unhealthy:c.extra_unhealthy_years||0, pct:c.longevity_tax_pct, isJ:JOURNEY_CODES.includes(c.country_code)}))
    .sort((a,b)=>b.pct-a.pct)
  const maxExtra = Math.max(...longevityData.map(d=>d.extra))

  return (
    <section ref={ref} className="py-12 px-4 md:px-12 bg-bg">
      <div className="max-w-[1000px] mx-auto">
        {/* Header: text + silhouette side by side */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="md:w-[55%]">
            <h2 className="font-display text-2xl md:text-[28px] text-text mb-3">The Longevity Tax</h2>
            <p className="font-body text-sm text-text-secondary mb-2">Women outlive men everywhere. But how much of that extra time is healthy?</p>
            <p className="font-body text-sm text-text-muted">In most countries, the majority of women's extra years are spent in poor health.</p>
          </div>
          <div className="md:w-[45%] flex justify-center">
            <svg viewBox="0 0 180 100" className="w-full max-w-[180px] h-[100px]">
              <circle cx="55" cy="22" r="10" fill="#2D6A4F"/><rect x="46" y="35" width="18" height="50" rx="5" fill="#2D6A4F"/>
              <circle cx="125" cy="15" r="10" fill="#E07A5F"/><rect x="116" y="28" width="18" height="38" rx="5" fill="#2D6A4F"/><rect x="116" y="28" width="18" height="15" rx="5" fill="#E07A5F"/>
              <text x="55" y="95" textAnchor="middle" fill="#4a6e7f" fontSize="7">♂</text>
              <text x="125" y="95" textAnchor="middle" fill="#4a6e7f" fontSize="7">♀</text>
            </svg>
          </div>
        </div>

        {/* Extreme cases as cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {extremes.map((e, i) => (
            <motion.div key={e.code} className="p-4 rounded-xl border border-[#1a3340]/8 bg-white/50"
              initial={{ opacity:0, y:20 }} animate={inView?{ opacity:1, y:0 }:{}} transition={{ delay:0.3+i*0.15, duration:0.4 }}>
              <p className="font-data text-xs text-text-muted mb-1">{e.label}</p>
              <p className="font-display text-2xl mb-2" style={{ color: e.pct > 80 ? '#E07A5F' : '#2D6A4F' }}>{e.pct}%</p>
              <div className="h-5 rounded overflow-hidden flex bg-[#1a3340]/5 mb-2">
                <motion.div className="h-full bg-[#2D6A4F]" initial={{width:0}} animate={inView?{width:`${((e.extra-e.unhealthy)/7)*100}%`}:{}} transition={{delay:0.5+i*0.15,duration:0.7}}/>
                <motion.div className="h-full bg-[#E07A5F]" initial={{width:0}} animate={inView?{width:`${(e.unhealthy/7)*100}%`}:{}} transition={{delay:0.7+i*0.15,duration:0.7}}/>
              </div>
              <p className="font-body text-[10px] text-text-muted italic">"{e.quote}"</p>
            </motion.div>
          ))}
        </div>

        {/* Legend + full chart (compact) */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-[9px] font-data text-text-muted">All 44 countries, sorted by % unhealthy</p>
          <div className="flex gap-3 text-[8px] font-data text-text-faint">
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-[#2D6A4F]"/>Healthy</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-[#E07A5F]"/>Unhealthy</span>
          </div>
        </div>
        <motion.div className="space-y-px" initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:0.8,duration:0.5}}>
          {longevityData.map((d,i) => (
            <div key={d.code} className={`flex items-center gap-1.5 ${d.pct>100?'bg-[#E07A5F]/5':''} ${d.isJ?'bg-[#1a3340]/4':''} rounded px-1`}>
              <span className={`w-8 text-right text-[8px] font-data ${d.isJ?'font-bold text-text':'text-text-faint'}`}>{d.code}</span>
              <div className="flex-1 flex h-3.5 rounded overflow-hidden bg-[#1a3340]/4">
                <div className="h-full bg-[#2D6A4F]" style={{width:`${(d.healthy/maxExtra)*100}%`,opacity:0.85}}/>
                <div className="h-full bg-[#E07A5F]" style={{width:`${(d.unhealthy/maxExtra)*100}%`,opacity:0.85}}/>
              </div>
              <span className={`w-7 text-[7px] font-data ${d.pct>100?'text-[#E07A5F] font-bold':'text-text-faint'}`}>{d.pct.toFixed(0)}%</span>
            </div>
          ))}
        </motion.div>
        <p className="text-[8px] font-data text-text-faint text-center mt-3">Life expectancy 2024, HALE 2021. Year mismatch inflates values above 100%.</p>
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
      {/* Compact intro */}
      <section className="py-20 flex flex-col items-center justify-center px-4 bg-bg">
        <motion.div className="text-center" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
          <h2 className="font-display text-2xl md:text-3xl text-text mb-2">{introTitle}</h2>
          <p className="font-body text-lg text-text-secondary">{introSub}</p>
        </motion.div>
      </section>

      <Chapter1 />
      <Chapter2 />
      <Chapter3 />

      {/* Compact outro */}
      <section className="py-16 flex flex-col items-center justify-center px-4 bg-bg">
        <h2 className="font-display text-xl md:text-2xl text-text mb-5">Now explore for yourself.</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button onClick={()=>onComplete('explore')} className="px-6 py-2.5 rounded-full bg-marriage text-white font-body text-sm cursor-pointer hover:bg-marriage/90 transition-all" whileHover={{scale:1.03}} whileTap={{scale:0.97}}>Explore correlations →</motion.button>
          <motion.button onClick={()=>onComplete('quiz')} className="px-6 py-2.5 rounded-full border border-[#1a3340]/20 font-body text-sm text-text cursor-pointer hover:bg-white hover:shadow-md transition-all" whileHover={{scale:1.03}} whileTap={{scale:0.97}}>Test your intuition →</motion.button>
          <motion.button onClick={onPickPair} className="px-6 py-2.5 rounded-full border border-[#1a3340]/10 font-body text-sm text-text-muted cursor-pointer hover:bg-white/60 transition-all" whileHover={{scale:1.03}} whileTap={{scale:0.97}}>← Pick another pair</motion.button>
        </div>
      </section>
    </div>
  )
}
