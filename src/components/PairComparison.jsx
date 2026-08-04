import { useState } from 'react'
import { motion } from 'framer-motion'
import Timeline from './Journey/Timeline'

const COUNTRIES = [
  { code:'SWE', name:'Sweden', flag:'🇸🇪' },{ code:'ITA', name:'Italy', flag:'🇮🇹' },
  { code:'JPN', name:'Japan', flag:'🇯🇵' },{ code:'KOR', name:'S. Korea', flag:'🇰🇷' },
  { code:'AUS', name:'Australia', flag:'🇦🇺' },{ code:'FRA', name:'France', flag:'🇫🇷' },
  { code:'DNK', name:'Denmark', flag:'🇩🇰' },{ code:'DEU', name:'Germany', flag:'🇩🇪' },
  { code:'USA', name:'USA', flag:'🇺🇸' },{ code:'BRA', name:'Brazil', flag:'🇧🇷' },
  { code:'MEX', name:'Mexico', flag:'🇲🇽' },{ code:'IND', name:'India', flag:'🇮🇳' },
]
const PAIRS = [
  { codes:['SWE','IND'], tagline:'Marriage age worlds apart', color:'#E76F51' },
  { codes:['FRA','MEX'], tagline:'Same lifespan, different retirement', color:'#457B9D' },
  { codes:['JPN','IND'], tagline:'Healthy years divide', color:'#7B2D8E' },
  { codes:['ITA','BRA'], tagline:'Living together, worlds apart', color:'#00897B' },
  { codes:['KOR','FRA'], tagline:'The squeeze vs the spread', color:'#E9C46A' },
  { codes:['USA','JPN'], tagline:"Money can't buy health", color:'#264653' },
]

export default function PairComparison() {
  const [pair, setPair] = useState(null)
  const [custom, setCustom] = useState([])

  function pickCustom(code) {
    if (custom.includes(code)) { setCustom(custom.filter(c=>c!==code)); return }
    if (custom.length < 2) {
      const next = [...custom, code]
      if (next.length === 2) { setPair(next); setCustom([]) }
      else setCustom(next)
    }
  }

  if (pair) {
    return (
      <section id="compare" className="border-t border-[#1a3340]/8">
        <div className="flex items-center justify-between px-4 md:px-8 py-3 bg-white border-b border-[#1a3340]/5">
          <h3 className="font-display text-lg text-text">Comparing: {pair[0]} & {pair[1]}</h3>
          <button onClick={() => setPair(null)} className="text-xs font-body text-text-muted hover:text-text cursor-pointer">← Change pair</button>
        </div>
        <Timeline pair={pair} onComplete={() => {}} />
      </section>
    )
  }

  return (
    <section id="compare" className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="font-display text-2xl md:text-[32px] text-center text-text mb-2">Compare Two Countries</h2>
        <p className="text-center text-text-secondary font-body text-sm mb-10">Pick a pair and see how life unfolds differently.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PAIRS.map(p => {
            const a = COUNTRIES.find(c=>c.code===p.codes[0])
            const b = COUNTRIES.find(c=>c.code===p.codes[1])
            return (
              <motion.button key={p.codes.join('-')} onClick={() => setPair(p.codes)}
                className="p-4 rounded-xl border-l-4 border border-[#1a3340]/6 bg-[#FAFAF8] hover:bg-white hover:shadow-lg transition-all text-left cursor-pointer"
                style={{ borderLeftColor: p.color }} whileHover={{ y:-2 }} whileTap={{ scale:0.98 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{a.flag}</span><span className="font-body font-bold text-sm text-text">{a.name}</span>
                  <span className="text-text-faint">&</span>
                  <span>{b.flag}</span><span className="font-body font-bold text-sm text-text">{b.name}</span>
                </div>
                <p className="font-body text-xs text-text-muted italic">{p.tagline}</p>
              </motion.button>
            )
          })}
        </div>
        <div className="text-center">
          <p className="text-text-muted font-body text-sm mb-3">Or choose your own:{custom.length===1&&<span className="ml-2 text-marriage font-medium">Pick one more</span>}</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-[600px] mx-auto">
            {COUNTRIES.map(c => (
              <button key={c.code} onClick={() => pickCustom(c.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-body cursor-pointer transition-all border
                  ${custom.includes(c.code)?'border-marriage bg-marriage/10 text-marriage font-medium':'border-[#1a3340]/8 text-text hover:bg-white hover:shadow-sm'}`}>
                {c.flag} {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
