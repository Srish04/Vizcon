import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const COUNTRIES = [
  { code: 'SWE', menarche: 13.1, education: 25.0, marriage: 34.8, retirement: 65.1, lifeExp: 84.1 },
  { code: 'ITA', menarche: 12.5, education: 22.7, marriage: 33.6, retirement: 64.0, lifeExp: 84.0 },
  { code: 'JPN', menarche: 12.5, education: 21.5, marriage: 29.4, retirement: 66.9, lifeExp: 84.0 },
  { code: 'KOR', menarche: 13.9, education: 22.6, marriage: 30.8, retirement: 67.4, lifeExp: 83.6 },
  { code: 'AUS', menarche: 13.0, education: 26.6, marriage: 29.2, retirement: 64.9, lifeExp: 83.1 },
  { code: 'FRA', menarche: 13.1, education: 22.1, marriage: 33.1, retirement: 61.9, lifeExp: 83.0 },
  { code: 'DNK', menarche: 13.0, education: 24.7, marriage: 33.0, retirement: 66.3, lifeExp: 82.3 },
  { code: 'DEU', menarche: 12.8, education: 23.3, marriage: 31.2, retirement: 64.2, lifeExp: 80.8 },
  { code: 'USA', menarche: 12.8, education: 21.9, marriage: 28.6, retirement: 67.3, lifeExp: 78.9 },
  { code: 'BRA', menarche: 12.4, education: 21.8, marriage: 23.9, retirement: 63.4, lifeExp: 76.0 },
  { code: 'MEX', menarche: 12.4, education: 20.5, marriage: 27.5, retirement: 67.8, lifeExp: 75.3 },
  { code: 'IND', menarche: 14.3, education: 18.9, marriage: 21.4, retirement: null, lifeExp: 72.2 },
]
const STEPS = [
  { label: 'Puberty', color: '#C2185B', field: 'menarche' },
  { label: 'Education', color: '#2D6A4F', field: 'education' },
  { label: 'Marriage', color: '#E76F51', field: 'marriage' },
  { label: 'Retirement', color: '#457B9D', field: 'retirement' },
  { label: 'Life end', color: '#264653', field: 'lifeExp' },
]
const AGE_MIN = 12, AGE_MAX = 85
const ageToPercent = age => age == null ? null : ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100

export default function Hero() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4, once: true })
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (inView && !started) {
      setStarted(true)
      ;[1500, 3500, 5500, 7500, 9000].forEach((t, i) => setTimeout(() => setStep(i + 1), t))
    }
  }, [inView, started])

  const isFinal = step >= 5
  const color = step === 0 ? STEPS[0].color : STEPS[Math.min(step - 1, 4)].color
  const label = step === 0 ? STEPS[0].label : STEPS[Math.min(step - 1, 4)].label
  const getPos = c => { if (step === 0) return ageToPercent(c.menarche); const s = STEPS[Math.min(step-1,4)]; return c[s.field]==null?null:ageToPercent(c[s.field]) }

  return (
    <section id="hero" ref={ref} className="min-h-screen flex items-center px-4 md:px-12 relative" style={{ backgroundColor: '#1a2e3b' }}>
      <div className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row items-center gap-8">
        {/* Left: text */}
        <motion.div className="md:w-[45%] text-left" initial={{ opacity:0,x:-30 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.8 }}>
          <h1 className="font-display text-[32px] md:text-[44px] leading-tight mb-4 text-white">Life Milestones: How the World Grows Up</h1>
          <p className="font-body text-base md:text-lg text-white/60 mb-4">When does adulthood happen, and does the timing matter?</p>
          <motion.p className="font-body text-sm text-white/40" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1, duration:0.8 }}>
            11 milestones. 12 countries. 44 for validation.
          </motion.p>
          {isFinal && <motion.p className="font-body text-sm text-white/50 mt-4" initial={{ opacity:0 }} animate={{ opacity:1 }}>Scroll to explore the data.</motion.p>}
        </motion.div>

        {/* Right: race animation */}
        <div className="md:w-[55%] w-full">
          <div className="h-8 flex items-center justify-center mb-2">
            <AnimatePresence mode="wait">
              {started && <motion.span key={label} className="font-display text-sm md:text-lg text-white/80" style={{ color }}
                initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }} transition={{ duration:0.3 }}>{label}</motion.span>}
            </AnimatePresence>
          </div>
          <div className="space-y-0.5">
            {COUNTRIES.map(c => {
              const pos = getPos(c)
              const hidden = pos == null && step > 0
              return (
                <div key={c.code} className="flex items-center h-5">
                  <span className="w-10 text-right pr-1.5 text-[9px] font-data text-white/60">{c.code}</span>
                  <div className="flex-1 relative h-full">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/8"/>
                    {isFinal && <motion.div className="absolute top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-white/15"
                      style={{ left:`${ageToPercent(c.menarche)}%` }} initial={{ width:0 }} animate={{ width:`${ageToPercent(c.lifeExp)-ageToPercent(c.menarche)}%` }} transition={{ duration:0.8 }}/>}
                    {!hidden && started && (
                      <motion.div className="absolute top-1/2 -translate-y-1/2" initial={{ left:`${ageToPercent(c.menarche)}%` }} animate={{ left:`${pos}%` }} transition={{ duration:1.5, ease:'easeInOut' }}>
                        <div className="w-2 h-2 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.4)]" style={{ backgroundColor: color }}/>
                      </motion.div>
                    )}
                    {isFinal && <span className="absolute top-1/2 -translate-y-1/2 text-[7px] font-data text-white/40" style={{ left:`${ageToPercent(c.lifeExp)+1}%` }}>{Math.round(c.lifeExp)}</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between ml-10 mt-1 text-[7px] font-data text-white/30">
            {[12,20,30,40,50,60,70,80,85].map(a=><span key={a}>{a}</span>)}
          </div>
        </div>
      </div>
      <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/25" animate={{ y:[0,6,0] }} transition={{ repeat:Infinity, duration:2 }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
      </motion.div>
    </section>
  )
}
