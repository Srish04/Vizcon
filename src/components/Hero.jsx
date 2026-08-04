import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COUNTRIES = [
  { code:'SWE', menarche:13.1, education:25.0, marriage:34.8, retirement:65.1, lifeExp:84.1 },
  { code:'ITA', menarche:12.5, education:22.7, marriage:33.6, retirement:64.0, lifeExp:84.0 },
  { code:'JPN', menarche:12.5, education:21.5, marriage:29.4, retirement:66.9, lifeExp:84.0 },
  { code:'KOR', menarche:13.9, education:22.6, marriage:30.8, retirement:67.4, lifeExp:83.6 },
  { code:'AUS', menarche:13.0, education:26.6, marriage:29.2, retirement:64.9, lifeExp:83.1 },
  { code:'FRA', menarche:13.1, education:22.1, marriage:33.1, retirement:61.9, lifeExp:83.0 },
  { code:'DNK', menarche:13.0, education:24.7, marriage:33.0, retirement:66.3, lifeExp:82.3 },
  { code:'DEU', menarche:12.8, education:23.3, marriage:31.2, retirement:64.2, lifeExp:80.8 },
  { code:'USA', menarche:12.8, education:21.9, marriage:28.6, retirement:67.3, lifeExp:78.9 },
  { code:'BRA', menarche:12.4, education:21.8, marriage:23.9, retirement:63.4, lifeExp:76.0 },
  { code:'MEX', menarche:12.4, education:20.5, marriage:27.5, retirement:67.8, lifeExp:75.3 },
  { code:'IND', menarche:14.3, education:18.9, marriage:21.4, retirement:null, lifeExp:72.2 },
]

const STAGES = [
  { age:0, label:'', color:'#999' },
  { age:13, label:'Puberty', color:'#C2185B' },
  { age:22, label:'Education complete', color:'#2D6A4F' },
  { age:24, label:'Leave home', color:'#2A9D8F' },
  { age:27, label:'First relationship', color:'#00897B' },
  { age:30, label:'First child', color:'#E9C46A' },
  { age:31, label:'Marriage', color:'#E76F51' },
  { age:65, label:'Retirement', color:'#457B9D' },
]

const FACTS = [
  "In Sweden, marriage is literally the last social milestone.",
  "Korea's fertility rate fell from 5.99 to 0.72.",
  "One number correlates with 75% of a country's wealth: the age women marry.",
  "6 of 12 countries have baby before marriage.",
  "American women spend 15 years in poor health.",
]

const AGE_MIN = 12, AGE_MAX = 85
const ageToPercent = a => a == null ? null : ((a - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100

export default function Hero() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [factIdx, setFactIdx] = useState(0)

  useEffect(() => {
    function onScroll() {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionH = sectionRef.current.offsetHeight - window.innerHeight
      const p = Math.max(0, Math.min(1, -rect.top / sectionH))
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setFactIdx(i => (i + 1) % FACTS.length), 3500)
    return () => clearInterval(t)
  }, [])

  // Phase thresholds
  const phase = progress < 0.35 ? 1 : progress < 0.45 ? 2 : progress < 0.9 ? 3 : 4
  const phaseProgress = phase === 1 ? progress / 0.35
    : phase === 2 ? (progress - 0.35) / 0.1
    : phase === 3 ? (progress - 0.45) / 0.45
    : (progress - 0.9) / 0.1

  // Phase 1: which stage
  const stageIdx = Math.min(STAGES.length - 1, Math.floor(phaseProgress * STAGES.length))
  const stage = STAGES[stageIdx]

  // Phase 3: race position
  const raceProgress = phase >= 3 ? Math.min(1, phaseProgress) : 0

  function getRacePos(c) {
    // Interpolate through milestones based on raceProgress
    const milestones = [c.menarche, c.education, c.marriage, c.retirement, c.lifeExp].filter(v => v != null)
    const idx = raceProgress * (milestones.length - 1)
    const lo = Math.floor(idx), hi = Math.ceil(idx)
    const t = idx - lo
    const age = milestones[lo] + (milestones[hi] - milestones[lo]) * t
    return ageToPercent(age)
  }

  return (
    <section id="hero" ref={sectionRef} style={{ height: '400vh' }}>
      <div className="sticky top-12 h-[calc(100vh-48px)] overflow-hidden flex items-center justify-center">

        {/* PHASE 1: Life stages */}
        {phase === 1 && (
          <div className="text-center">
            {/* SVG Figure */}
            <svg viewBox="0 0 100 140" className="w-24 h-32 mx-auto mb-4">
              <circle cx="50" cy="25" r={stageIdx < 1 ? 10 : 12} fill={stage.color} opacity="0.2" className="transition-all duration-500"/>
              <circle cx="50" cy="25" r={stageIdx < 1 ? 8 : 10} fill={stage.color} className="transition-all duration-500"/>
              <rect x="42" y="38" width="16" height={stageIdx < 2 ? 30 : 40} rx="4" fill={stage.color} className="transition-all duration-500"/>
              <line x1="42" y1="50" x2="32" y2="65" stroke={stage.color} strokeWidth="3" strokeLinecap="round"/>
              <line x1="58" y1="50" x2="68" y2="65" stroke={stage.color} strokeWidth="3" strokeLinecap="round"/>
              {/* Props */}
              {stageIdx >= 2 && <polygon points="40,18 60,18 50,10" fill={stage.color} opacity="0.6"/>}
              {stageIdx >= 4 && <circle cx="72" cy="35" r="6" fill={stage.color} opacity="0.4"/>}
              {stageIdx >= 6 && <circle cx="50" cy="5" r="3" fill="#E76F51"/>}
            </svg>
            {stage.label && <p className="font-body text-lg font-bold text-[#264653] mb-1">{stage.label}</p>}
            {stage.age > 0 && <p className="font-data text-4xl font-medium" style={{ color: stage.color }}>{stage.age}</p>}
            {stageIdx >= 7 && (
              <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <p className="font-body text-base text-[#264653]/60 mb-2">This is the life sequence most people assume.</p>
                <p className="font-body text-lg font-bold text-[#264653]">But it's not universal.</p>
              </motion.div>
            )}
          </div>
        )}

        {/* PHASE 2: Split */}
        {phase === 2 && (
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex items-end justify-center gap-2 mb-6">
              {COUNTRIES.map(c => (
                <div key={c.code} className="flex flex-col items-center">
                  <svg viewBox="0 0 20 30" className="w-4 h-6">
                    <circle cx="10" cy="6" r="4" fill="#264653"/>
                    <rect x="6" y="12" width="8" height="14" rx="2" fill="#264653"/>
                  </svg>
                  <span className="text-[6px] font-data text-[#264653]/60 mt-0.5">{c.code}</span>
                </div>
              ))}
            </div>
            <p className="font-display text-xl text-[#264653]">12 countries. 12 different sequences.</p>
          </motion.div>
        )}

        {/* PHASE 3: Race */}
        {phase === 3 && (
          <div className="w-full max-w-[900px] px-4">
            <div className="space-y-1">
              {COUNTRIES.map(c => {
                const pos = getRacePos(c)
                return (
                  <div key={c.code} className="flex items-center h-5">
                    <span className="w-10 text-right pr-1.5 text-[9px] font-data text-[#264653]/60">{c.code}</span>
                    <div className="flex-1 relative h-full">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-[#264653]/8"/>
                      {raceProgress > 0.9 && (
                        <div className="absolute top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-[#264653]/10"
                          style={{ left: `${ageToPercent(c.menarche)}%`, width: `${ageToPercent(c.lifeExp) - ageToPercent(c.menarche)}%` }}/>
                      )}
                      <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#E76F51] shadow-sm transition-all duration-200"
                        style={{ left: `${pos}%` }}/>
                      {raceProgress > 0.95 && (
                        <span className="absolute top-1/2 -translate-y-1/2 text-[7px] font-data text-[#264653]/50"
                          style={{ left: `${ageToPercent(c.lifeExp) + 1}%` }}>{Math.round(c.lifeExp)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between ml-10 mt-2 text-[7px] font-data text-[#264653]/30">
              {[12,20,30,40,50,60,70,80,85].map(a => <span key={a}>{a}</span>)}
            </div>
            {raceProgress > 0.95 && (
              <motion.p className="text-center font-display text-xl text-[#264653] mt-8"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Same starting line. Twelve years apart at the finish.
              </motion.p>
            )}
          </div>
        )}

        {/* PHASE 4: Facts + CTA */}
        {phase === 4 && (
          <div className="text-center max-w-[600px] px-4">
            <AnimatePresence mode="wait">
              <motion.p key={factIdx} className="font-body text-lg text-[#264653]/80 leading-relaxed min-h-[60px]"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
                {FACTS[factIdx]}
              </motion.p>
            </AnimatePresence>
            <motion.div className="mt-8 text-[#264653]/40" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <p className="text-sm font-body mb-2">Scroll to explore the data</p>
              <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}
