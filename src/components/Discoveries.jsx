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
    { label: 'vs GDP', yKey: 'gdp_per_capita', yLabel: 'GDP per Capita (PPP $)', rSq: 0.61, format: v => `$${(v/1000).toFixed(0)}k` },
    { label: 'vs Gender Equality', yKey: 'gender_inequality_index', yLabel: 'Gender Inequality Index', rSq: 0.81, format: v => v.toFixed(3) },
    { label: 'vs Happiness', yKey: 'happiness', yLabel: 'Happiness Score', rSq: 0.52, format: v => v.toFixed(2) },
    { label: 'vs Teen Fertility', yKey: 'adolescent_fertility', yLabel: 'Adolescent Fertility (per 1000)', rSq: 0.31, format: v => v.toFixed(1) },
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

  // Guessing game state
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [gameComplete, setGameComplete] = useState(false)

  const QUESTIONS = [
    { label: 'GDP per person', options: ['Goes up', 'Goes down', 'No change'], correct: 'Goes up', explanation: 'Countries where women marry at 34 have 6.6x higher GDP than those where they marry at 21.' },
    { label: 'teenage pregnancy', options: ['Goes up', 'Goes down', 'No change'], correct: 'Goes down', explanation: 'Teen births drop from 59 per 1000 (Mexico, marries at 27) to 1.7 (Sweden, marries at 35).' },
    { label: 'gender equality', options: ['Goes up', 'Goes down', 'No change'], correct: 'Goes up', explanation: 'Gender inequality drops by 98% between India (marries at 21) and Denmark (marries at 33). r = -0.90.' },
    { label: 'mothers dying in childbirth', options: ['Goes up', 'Goes down', 'No change'], correct: 'Goes down', explanation: 'Maternal mortality drops from 80 per 100k (India) to 3 (Japan). Later marriage means better healthcare access.' },
  ]

  const score = Object.values(answers).filter((a, i) => a === QUESTIONS[i]?.correct).length

  function handleAnswer(opt) {
    setAnswers(prev => ({ ...prev, [currentQ]: opt }))
  }

  function nextQuestion() {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      setGameComplete(true)
    }
  }

  return (
    <div className="bg-[#264653] py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover" loading="lazy"/>
        <div className="absolute inset-0" style={{ backgroundColor: '#1a2332', opacity: 0.94 }}/>
      </div>
      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-body text-[14px] uppercase tracking-[0.3em] text-white/60 mb-4">Our winner life marker</p>
          <p className="font-display text-[48px] md:text-[64px] font-bold text-white leading-tight">The Age Women Marry</p>
          <p className="font-body text-[18px] text-white/70 mt-4 max-w-[600px] mx-auto">If women in a country marry later, what do you think happens to these outcomes?</p>
        </div>

        {/* Guessing game */}
        {!gameComplete && (
          <div className="max-w-[600px] mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <p className="font-body text-[14px] text-white/50 text-center mb-2">Question {currentQ + 1} of {QUESTIONS.length}</p>
              <p className="font-body text-[22px] text-white text-center font-semibold mb-8">
                When women marry later, what happens to <span className="text-[#E76F51]">{QUESTIONS[currentQ].label}</span>?
              </p>
              <div className="flex justify-center gap-4">
                {QUESTIONS[currentQ].options.map(opt => (
                  <button key={opt} onClick={() => handleAnswer(opt)}
                    className={`px-6 py-3 rounded-xl text-[16px] font-body font-semibold cursor-pointer transition-all border-2
                      ${answers[currentQ] === opt
                        ? answers[currentQ] === QUESTIONS[currentQ].correct
                          ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                          : 'bg-[#E76F51] border-[#E76F51] text-white'
                        : 'bg-white/5 border-white/30 text-white hover:bg-white/15'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              {answers[currentQ] && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                  <p className={`font-body text-[16px] font-semibold ${answers[currentQ] === QUESTIONS[currentQ].correct ? 'text-[#2D6A4F]' : 'text-[#E76F51]'}`}>
                    {answers[currentQ] === QUESTIONS[currentQ].correct ? '✓ Correct!' : `✗ It actually ${QUESTIONS[currentQ].correct.toLowerCase().replace('goes ', '')}s.`}
                  </p>
                  <p className="font-body text-[14px] text-white/70 mt-2">{QUESTIONS[currentQ].explanation}</p>
                  <button onClick={nextQuestion}
                    className="mt-4 px-6 py-2 rounded-lg bg-white/20 text-white font-body text-[14px] cursor-pointer hover:bg-white/30 transition-all">
                    {currentQ < QUESTIONS.length - 1 ? 'Next question →' : 'See the full picture →'}
                  </button>
                </motion.div>
              )}
            </div>
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-4">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentQ ? 'bg-white scale-125' : i < currentQ ? (answers[i] === QUESTIONS[i].correct ? 'bg-[#2D6A4F]' : 'bg-[#E76F51]') : 'bg-white/20'}`}/>
              ))}
            </div>
          </div>
        )}

        {/* After game: score + scatter */}
        {gameComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Score */}
            <div className="text-center mb-10">
              <p className="font-data text-[48px] font-bold text-white">{score}/{QUESTIONS.length}</p>
              <p className="font-body text-[16px] text-white/70 mt-1">
                {score === QUESTIONS.length ? 'Perfect. You saw the pattern.' : score >= 3 ? 'You got the intuition. Here\'s the proof.' : 'Surprising, right? Here\'s the data.'}
              </p>
            </div>

            {/* Scatter plot */}
            <div className="mx-auto" style={{ maxWidth: '700px' }}>
              <ExpandableChart title="Marriage Age vs Outcomes">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 p-6 shadow-lg shadow-black/20">
                <div className="absolute top-4 right-6 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="font-data text-[18px] font-bold text-white">R² = {panel.rSq.toFixed(2)}</span>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  <line x1={M.l} y1={H-M.b} x2={W-M.r} y2={H-M.b} stroke="white" strokeWidth="0.5" opacity="0.2"/>
                  <line x1={M.l} y1={M.t} x2={M.l} y2={H-M.b} stroke="white" strokeWidth="0.5" opacity="0.2"/>
                  {[20,24,28,32,36].map(v => (
                    <text key={v} x={sx(v)} y={H-M.b+18} textAnchor="middle" fill="white" fontSize="13" opacity="0.6" fontFamily="Inter">{v}</text>
                  ))}
                  {Array.from({length:5}).map((_,i) => {
                    const v = yRange[0]+(yRange[1]-yRange[0])*(i/4)
                    return <text key={i} x={M.l-10} y={sy(v)+4} textAnchor="end" fill="white" fontSize="13" opacity="0.6" fontFamily="Inter">{panel.format(v)}</text>
                  })}
                  <text x={M.l+pw/2} y={H-10} textAnchor="middle" fill="white" fontSize="14" opacity="0.7" fontFamily="Inter">Marriage Age - Female (years)</text>
                  <text x={16} y={M.t+ph/2} textAnchor="middle" fill="white" fontSize="14" opacity="0.7" fontFamily="Inter" transform={`rotate(-90,16,${M.t+ph/2})`}>{panel.yLabel}</text>
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
            </div>

            {/* Closing */}
            <div className="mt-12 text-center">
              <p className="font-body text-[18px] text-white font-semibold max-w-[700px] mx-auto">
                Every outcome tells the same story. Later marriage, better outcomes. Every single time.
              </p>
              <p className="font-body text-[14px] text-white/70 mt-4 max-w-[600px] mx-auto">
                Correlation, not causation. Marriage timing reflects deeper forces: education access, economic opportunity, and gender norms.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// === DISCOVERY 3: THE HEALTH PARADOX ===
function LongevityDiscovery() {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [revealed, setRevealed] = useState(false)

  // Compute % healthy life for women vs men using HALE and life expectancy data
  const data = useMemo(() => {
    const haleData = [
      { country: 'SWE', name: 'Sweden', haleFemale: 71.2, haleMale: 71.0 },
      { country: 'ITA', name: 'Italy', haleFemale: 71.1, haleMale: 70.0 },
      { country: 'KOR', name: 'S. Korea', haleFemale: 74.1, haleMale: 70.7 },
      { country: 'FRA', name: 'France', haleFemale: 71.0, haleMale: 69.1 },
      { country: 'DNK', name: 'Denmark', haleFemale: 70.4, haleMale: 69.7 },
      { country: 'JPN', name: 'Japan', haleFemale: 74.8, haleMale: 71.9 },
      { country: 'BRA', name: 'Brazil', haleFemale: 63.4, haleMale: 60.3 },
      { country: 'AUS', name: 'Australia', haleFemale: 71.1, haleMale: 70.1 },
      { country: 'USA', name: 'USA', haleFemale: 65.1, haleMale: 62.8 },
      { country: 'DEU', name: 'Germany', haleFemale: 69.4, haleMale: 68.4 },
      { country: 'IND', name: 'India', haleFemale: 58.3, haleMale: 58.0 },
      { country: 'MEX', name: 'Mexico', haleFemale: 63.5, haleMale: 59.5 },
    ]
    const leData = [
      { country: 'SWE', leFemale: 85.6, leMale: 82.6 },
      { country: 'ITA', leFemale: 86.0, leMale: 82.0 },
      { country: 'KOR', leFemale: 86.6, leMale: 80.8 },
      { country: 'FRA', leFemale: 85.9, leMale: 80.2 },
      { country: 'DNK', leFemale: 84.2, leMale: 80.4 },
      { country: 'JPN', leFemale: 87.1, leMale: 81.1 },
      { country: 'BRA', leFemale: 79.1, leMale: 73.0 },
      { country: 'AUS', leFemale: 85.1, leMale: 81.1 },
      { country: 'USA', leFemale: 81.4, leMale: 76.5 },
      { country: 'DEU', leFemale: 83.2, leMale: 78.5 },
      { country: 'IND', leFemale: 73.9, leMale: 70.7 },
      { country: 'MEX', leFemale: 78.0, leMale: 72.4 },
    ]
    return haleData.map(h => {
      const le = leData.find(l => l.country === h.country)
      const pctHealthyF = (h.haleFemale / le.leFemale) * 100
      const pctHealthyM = (h.haleMale / le.leMale) * 100
      const gap = pctHealthyM - pctHealthyF
      return { ...h, leFemale: le.leFemale, leMale: le.leMale, pctHealthyF, pctHealthyM, gap }
    }).sort((a, b) => b.gap - a.gap)
  }, [])

  // "Did you know?" reveal
  if (!revealed) {
    return (
      <div className="bg-[#f8fafc] py-24 px-6">
        <div className="max-w-[650px] mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl p-14 text-center border-2 border-[#264653]/10">
            <p className="font-display text-[32px] text-[#264653]">The Health Paradox</p>
            <p className="font-body text-[20px] text-[#475569] mt-6">Women live longer than men in every country.</p>
            <p className="font-body text-[20px] text-[#264653] font-semibold mt-4">But men spend a higher percentage of their life in good health.</p>
            <p className="font-body text-[16px] text-[#475569] mt-4">This is true across all 12 countries in our dataset. No exceptions.</p>
            <button onClick={() => setRevealed(true)}
              className="mt-10 px-10 py-4 rounded-xl bg-[#264653] text-white font-body text-[18px] font-semibold cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
              See the data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="bg-white py-20 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="max-w-[1100px] mx-auto">
        <h3 className="font-display text-[28px] md:text-[32px] text-[#264653] text-center">Women live longer. Men live healthier.</h3>
        <p className="font-body text-[20px] text-[#475569] text-center mt-4 mb-12">What percentage of total life is spent in good health?</p>

        {/* Two-column chart: women vs men % healthy */}
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <ExpandableChart title="% of Life Spent Healthy: Women vs Men">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 ml-[100px]">
                <div className="flex-1 text-center">
                  <span className="text-[13px] font-body font-bold text-[#AB47BC]">Women (% healthy)</span>
                </div>
                <div className="w-[40px]"/>
                <div className="flex-1 text-center">
                  <span className="text-[13px] font-body font-bold text-[#457B9D]">Men (% healthy)</span>
                </div>
              </div>

              {data.map((d, i) => (
                <motion.div key={d.country}
                  className={`flex items-center gap-3 mb-3 py-1 rounded transition-colors ${hoveredCountry === d.country ? 'bg-[#f8fafc]' : ''}`}
                  onMouseEnter={() => setHoveredCountry(d.country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}>
                  <span className="w-[100px] text-right text-[14px] font-body font-bold text-[#264653] shrink-0">{d.name}</span>
                  {/* Women bar */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-7 bg-[#e5e7eb] rounded-md overflow-hidden">
                      <div className="h-full rounded-md" style={{ width: `${d.pctHealthyF}%`, backgroundColor: '#AB47BC', opacity: 0.7 }}/>
                    </div>
                    <span className="w-[45px] text-[13px] font-data font-bold text-[#AB47BC]">{d.pctHealthyF.toFixed(1)}%</span>
                  </div>
                  {/* Gap indicator */}
                  <div className="w-[40px] text-center">
                    <span className="text-[12px] font-data font-bold text-[#E76F51]">-{d.gap.toFixed(1)}</span>
                  </div>
                  {/* Men bar */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-7 bg-[#e5e7eb] rounded-md overflow-hidden">
                      <div className="h-full rounded-md" style={{ width: `${d.pctHealthyM}%`, backgroundColor: '#457B9D', opacity: 0.7 }}/>
                    </div>
                    <span className="w-[45px] text-[13px] font-data font-bold text-[#457B9D]">{d.pctHealthyM.toFixed(1)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
            </ExpandableChart>
          </div>

          {/* Right: callouts + explanation */}
          <div className="w-[280px] shrink-0 space-y-4">
            <div className="bg-[#F5F3FF] rounded-lg p-4 border border-[#AB47BC]/20">
              <p className="text-[15px] font-body font-bold text-[#AB47BC]">Women: 78.9%–85.9%</p>
              <p className="text-[14px] font-body text-[#475569] mt-1">Range of life spent healthy across 12 countries.</p>
            </div>
            <div className="bg-[#EFF6FF] rounded-lg p-4 border border-[#457B9D]/20">
              <p className="text-[15px] font-body font-bold text-[#457B9D]">Men: 82.0%–88.7%</p>
              <p className="text-[14px] font-body text-[#475569] mt-1">Men's % healthy exceeds women's in every country.</p>
            </div>
            <div className="bg-[#FEF2F2] rounded-lg p-4 border border-[#E76F51]/20">
              <p className="text-[15px] font-body font-bold text-[#E76F51]">The gap: 1.4–3.8 points</p>
              <p className="text-[14px] font-body text-[#475569] mt-1">Women gain extra years but those years are disproportionately spent in poor health.</p>
            </div>

            {/* What this shows */}
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-gray-200">
              <p className="text-[14px] font-body font-bold text-[#264653] mb-2">Why this happens</p>
              <p className="text-[13px] font-body text-[#334155] leading-relaxed">
                Men who die younger tend to die from acute causes (heart attacks, accidents, cancers). They're either healthy or dead. Women survive these events more often but accumulate chronic, non-fatal conditions (autoimmune disorders, osteoporosis, depression) that extend life without preserving health. The result: women gain years, but those years come at a cost.
              </p>
              <p className="text-[12px] font-body italic text-[#64748b] mt-2">Data: HALE (WHO 2021), Life Expectancy (World Bank 2024).</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const FINDINGS = [
  {
    id: 'usa-health',
    stat: '$75,698',
    highlight: 'GDP per capita',
    title: 'The richest country is the sickest',
    desc: 'The United States has the highest GDP per capita among our 12 countries, yet the lowest life expectancy (78.9 years) and the most years spent in poor health (15.0). A car-dependent lifestyle, processed food culture, and the world\'s most expensive yet unequal healthcare system means money alone does not buy health.',
    vizType: 'bars',
    vizData: [
      { label: 'USA', values: [{ metric: 'GDP', value: 75698, max: 80000, format: v => `$${(v/1000).toFixed(0)}k`, color: '#C2185B' }, { metric: 'Life Exp', value: 78.9, max: 88, format: v => v.toFixed(1), color: '#C2185B' }, { metric: 'Yrs Poor Health', value: 15.0, max: 16, format: v => v.toFixed(1), color: '#E76F51' }] },
      { label: 'Japan', values: [{ metric: 'GDP', value: 47480, max: 80000, format: v => `$${(v/1000).toFixed(0)}k`, color: '#E76F51' }, { metric: 'Life Exp', value: 84.0, max: 88, format: v => v.toFixed(1), color: '#E76F51' }, { metric: 'Yrs Poor Health', value: 10.6, max: 16, format: v => v.toFixed(1), color: '#2D6A4F' }] },
      { label: 'Sweden', values: [{ metric: 'GDP', value: 62558, max: 80000, format: v => `$${(v/1000).toFixed(0)}k`, color: '#2D6A4F' }, { metric: 'Life Exp', value: 84.1, max: 88, format: v => v.toFixed(1), color: '#2D6A4F' }, { metric: 'Yrs Poor Health', value: 13.0, max: 16, format: v => v.toFixed(1), color: '#457B9D' }] },
    ],
  },
  {
    id: 'korea-fertility',
    stat: '0.72',
    highlight: 'children per woman',
    title: 'The steepest fertility collapse ever recorded',
    desc: 'South Korea: from 5.99 children per woman in 1960 to 0.72 today, an 88% drop. A hyper-competitive education culture (the "SKY" university obsession), crushing housing costs in Seoul, and a rigid corporate work culture (chaebols) have made family formation unaffordable for an entire generation.',
    vizType: 'timeline',
    vizData: { country: 'South Korea', points: [{ year: 1960, value: 5.99 }, { year: 1970, value: 4.53 }, { year: 1980, value: 2.83 }, { year: 1990, value: 1.57 }, { year: 2000, value: 1.47 }, { year: 2010, value: 1.23 }, { year: 2020, value: 0.84 }, { year: 2023, value: 0.72 }] },
  },
  {
    id: 'italy-home',
    stat: '30.2 vs 23.1',
    highlight: 'age leaving home',
    title: 'Same wealth, 7 years apart on independence',
    desc: 'Italians leave home at 30.2. Swedes at 23.1. Both wealthy EU nations. Italy\'s "mammismo" culture (strong family bonds, shared meals, and multi-generational living) is a feature, not a bug. But it correlates with lower female workforce participation and later independence.',
    vizType: 'comparison',
    vizData: [
      { metric: 'Leave Home', left: 30.2, right: 23.1, leftLabel: 'Italy', rightLabel: 'Sweden', unit: 'years' },
      { metric: 'GDP', left: 53285, right: 62558, leftLabel: 'Italy', rightLabel: 'Sweden', unit: '$k', format: v => `$${(v/1000).toFixed(0)}k` },
      { metric: 'Happiness', left: 6.32, right: 7.34, leftLabel: 'Italy', rightLabel: 'Sweden', unit: '/10' },
    ],
  },
  {
    id: 'france-retire',
    stat: '22.5 years',
    highlight: 'of retirement',
    title: 'France chose leisure. America chose labor.',
    desc: 'France retires at 61.9 → 22.5 years of post-work life. America retires at 67.3 → 17.0 years. The French "joie de vivre" philosophy prioritizes leisure, long lunches, and 5 weeks of annual leave. American culture celebrates hustle. Same lifespans, opposite philosophies of what life is for.',
    vizType: 'comparison',
    vizData: [
      { metric: 'Retire Age', left: 61.9, right: 67.3, leftLabel: 'France', rightLabel: 'USA', unit: 'years' },
      { metric: 'Retirement Years', left: 22.5, right: 17.0, leftLabel: 'France', rightLabel: 'USA', unit: 'years' },
      { metric: 'Happiness', left: 6.61, right: 6.73, leftLabel: 'France', rightLabel: 'USA', unit: '/10' },
    ],
  },
  {
    id: 'japan-health',
    stat: '73.4',
    highlight: 'healthy years (HALE)',
    title: 'Healthiest but not happiest',
    desc: 'Japan has the highest healthy life expectancy (73.4 years) but one of the lowest happiness scores (6.06) among wealthy nations. A diet-and-longevity culture (washoku, walking cities) extends life, but "karoshi" (death by overwork), social isolation, and extreme conformity pressure suppress wellbeing.',
    vizType: 'bars',
    vizData: [
      { label: 'Japan', values: [{ metric: 'HALE', value: 73.4, max: 75, format: v => v.toFixed(1), color: '#2D6A4F' }, { metric: 'Happiness', value: 6.06, max: 8, format: v => v.toFixed(2), color: '#E76F51' }] },
      { label: 'Denmark', values: [{ metric: 'HALE', value: 70.1, max: 75, format: v => v.toFixed(1), color: '#457B9D' }, { metric: 'Happiness', value: 7.58, max: 8, format: v => v.toFixed(2), color: '#2D6A4F' }] },
      { label: 'Sweden', values: [{ metric: 'HALE', value: 71.1, max: 75, format: v => v.toFixed(1), color: '#457B9D' }, { metric: 'Happiness', value: 7.34, max: 8, format: v => v.toFixed(2), color: '#2D6A4F' }] },
    ],
  },
  {
    id: 'sweden-marriage',
    stat: 'Age 35',
    highlight: 'marriage comes last',
    title: 'In Sweden, every life marker happens before marriage',
    desc: 'Leave home (23) → Education (25) → Cohabitation (26) → First baby (30) → First home (31) → Marriage (35). In Sweden\'s "lagom" (just right) culture, marriage is a personal celebration, not a social prerequisite. The state supports single parents equally, removing the economic pressure to marry young.',
    vizType: 'sequence',
    vizData: [
      { label: 'Leave Home', age: 23.1, color: '#2A9D8F' },
      { label: 'Education', age: 25.0, color: '#2D6A4F' },
      { label: 'Cohabitation', age: 25.5, color: '#00897B' },
      { label: 'First Baby', age: 30.2, color: '#E9C46A' },
      { label: 'First Home', age: 30.5, color: '#48BFE3' },
      { label: 'Marriage', age: 34.8, color: '#E76F51' },
    ],
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

          {/* Right fade hint for scroll affordance */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#f8fafc] to-transparent pointer-events-none z-10"/>
          )}
          {/* Left fade hint */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#f8fafc] to-transparent pointer-events-none z-10"/>
          )}

          <div ref={scrollRef} onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory pl-1 pr-16" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

                {/* Visualization based on type */}
                {f.vizType === 'bars' && (
                  <div className="space-y-6 mt-4">
                    {f.vizData.map((row, ri) => (
                      <div key={ri}>
                        <p className="text-[15px] font-body font-bold text-[#264653] mb-2">{row.label}</p>
                        <div className="space-y-2">
                          {row.values.map((v, vi) => (
                            <div key={vi} className="flex items-center gap-3">
                              <span className="w-[100px] text-[13px] font-body text-[#475569] shrink-0">{v.metric}</span>
                              <div className="flex-1 h-7 bg-[#f1f5f9] rounded-md overflow-hidden">
                                <div className="h-full rounded-md transition-all duration-500" style={{ width: `${(v.value / v.max) * 100}%`, backgroundColor: v.color, opacity: 0.8 }}/>
                              </div>
                              <span className="w-[70px] text-[14px] font-data font-bold text-[#264653] text-right">{v.format(v.value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {f.vizType === 'comparison' && (
                  <div className="space-y-4 mt-4">
                    {f.vizData.map((row, ri) => (
                      <div key={ri} className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-xl">
                        <span className="w-[100px] text-[13px] font-body font-semibold text-[#475569] shrink-0">{row.metric}</span>
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-[18px] font-data font-bold text-[#264653]">{row.format ? row.format(row.left) : row.left.toFixed(1)}</span>
                          <span className="text-[12px] font-body text-[#94a3b8]">{row.leftLabel}</span>
                        </div>
                        <span className="text-[14px] font-body text-[#94a3b8]">vs</span>
                        <div className="flex-1 flex items-center gap-3 justify-end">
                          <span className="text-[12px] font-body text-[#94a3b8]">{row.rightLabel}</span>
                          <span className="text-[18px] font-data font-bold text-[#475569]">{row.format ? row.format(row.right) : row.right.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {f.vizType === 'timeline' && f.vizData && (
                  <div className="mt-4">
                    <p className="text-[14px] font-body text-[#475569] mb-3">{f.vizData.country}: Fertility Rate over time</p>
                    <svg viewBox="0 0 500 150" className="w-full max-w-[500px]">
                      {/* Axis */}
                      <line x1="40" y1="130" x2="480" y2="130" stroke="#e5e7eb" strokeWidth="1"/>
                      <line x1="40" y1="10" x2="40" y2="130" stroke="#e5e7eb" strokeWidth="1"/>
                      {/* Replacement level */}
                      <line x1="40" y1={130 - (2.1/6.5)*120} x2="480" y2={130 - (2.1/6.5)*120} stroke="#E76F51" strokeWidth="1" strokeDasharray="4 3" opacity="0.5"/>
                      <text x="482" y={130 - (2.1/6.5)*120 + 4} fontSize="9" fill="#E76F51" fontFamily="Inter">2.1</text>
                      {/* Line */}
                      <polyline
                        points={f.vizData.points.map((p, i) => `${40 + (i / (f.vizData.points.length - 1)) * 440},${130 - (p.value / 6.5) * 120}`).join(' ')}
                        fill="none" stroke="#264653" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {/* Dots and labels */}
                      {f.vizData.points.map((p, i) => {
                        const x = 40 + (i / (f.vizData.points.length - 1)) * 440
                        const y = 130 - (p.value / 6.5) * 120
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill="#264653"/>
                            <text x={x} y="145" textAnchor="middle" fontSize="9" fill="#475569" fontFamily="Inter">{p.year}</text>
                            {(i === 0 || i === f.vizData.points.length - 1) && (
                              <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#264653" fontFamily="Inter" fontWeight="700">{p.value.toFixed(2)}</text>
                            )}
                          </g>
                        )
                      })}
                    </svg>
                    <p className="text-[11px] font-body text-[#94a3b8] mt-2">Dashed line = replacement level (2.1). Below this, population shrinks without immigration.</p>
                  </div>
                )}

                {f.vizType === 'sequence' && f.vizData && (
                  <div className="mt-4">
                    <p className="text-[14px] font-body text-[#475569] mb-4">Sweden's life sequence: every marker before marriage</p>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute top-4 left-[60px] right-[60px] h-[3px] bg-[#e5e7eb] rounded-full"/>
                      <div className="flex justify-between items-start">
                        {f.vizData.map((m, i) => (
                          <div key={i} className="flex flex-col items-center w-[80px]">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-data font-bold z-10 relative" style={{ backgroundColor: m.color }}>
                              {m.age.toFixed(0)}
                            </div>
                            <p className="text-[11px] font-body font-semibold text-[#264653] mt-2 text-center">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[12px] font-body italic text-[#64748b] mt-4">Data from WHO, World Bank, OECD (2021-2024).</p>
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
      <MarriageDiscovery />
      <LongevityDiscovery />
      <FindingsCards />
    </section>
  )
}


