import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Country data sorted by life expectancy (highest first)
const COUNTRIES = [
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪', menarche: 13.1, education: 25.0, marriage: 34.8, retirement: 65.1, lifeExp: 84.1 },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹', menarche: 12.5, education: 22.7, marriage: 33.6, retirement: 64.0, lifeExp: 84.0 },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵', menarche: 12.5, education: 21.5, marriage: 29.4, retirement: 66.9, lifeExp: 84.0 },
  { code: 'KOR', name: 'S. Korea', flag: '🇰🇷', menarche: 13.9, education: 22.6, marriage: 30.8, retirement: 67.4, lifeExp: 83.6 },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', menarche: 13.0, education: 26.6, marriage: 29.2, retirement: 64.9, lifeExp: 83.1 },
  { code: 'FRA', name: 'France', flag: '🇫🇷', menarche: 13.1, education: 22.1, marriage: 33.1, retirement: 61.9, lifeExp: 83.0 },
  { code: 'DNK', name: 'Denmark', flag: '🇩🇰', menarche: 13.0, education: 24.7, marriage: 33.0, retirement: 66.3, lifeExp: 82.3 },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪', menarche: 12.8, education: 23.3, marriage: 31.2, retirement: 64.2, lifeExp: 80.8 },
  { code: 'USA', name: 'USA', flag: '🇺🇸', menarche: 12.8, education: 21.9, marriage: 28.6, retirement: 67.3, lifeExp: 78.9 },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', menarche: 12.4, education: 21.8, marriage: 23.9, retirement: 63.4, lifeExp: 76.0 },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', menarche: 12.4, education: 20.5, marriage: 27.5, retirement: 67.8, lifeExp: 75.3 },
  { code: 'IND', name: 'India', flag: '🇮🇳', menarche: 14.3, education: 18.9, marriage: 21.4, retirement: null, lifeExp: 72.2 },
]

const SUGGESTED_PAIRS = [
  { codes: ['SWE', 'IND'], tagline: 'Marriage age worlds apart' },
  { codes: ['FRA', 'MEX'], tagline: 'Same lifespan, different retirement' },
  { codes: ['JPN', 'IND'], tagline: 'Healthy years divide' },
  { codes: ['ITA', 'BRA'], tagline: 'Living together, worlds apart' },
  { codes: ['KOR', 'FRA'], tagline: 'The squeeze vs the spread' },
  { codes: ['USA', 'JPN'], tagline: "Money can't buy health" },
]

const STEPS = [
  { key: 'menarche', label: 'Puberty', color: '#C2185B', field: 'menarche' },
  { key: 'education', label: 'Education ends', color: '#2D6A4F', field: 'education' },
  { key: 'marriage', label: 'Marriage', color: '#E76F51', field: 'marriage' },
  { key: 'retirement', label: 'Retirement', color: '#457B9D', field: 'retirement' },
  { key: 'lifeExp', label: 'End of life', color: '#264653', field: 'lifeExp' },
]

const AGE_MIN = 12
const AGE_MAX = 85
const AGE_TICKS = [12, 20, 30, 40, 50, 60, 70, 80, 85]

function ageToPercent(age) {
  if (age === null) return null
  return ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100
}

function getCountryByCode(code) {
  return COUNTRIES.find(c => c.code === code)
}

// --- PHASE 1: Animated Race ---
function AnimatedRace({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showAnnotation, setShowAnnotation] = useState(false)

  useEffect(() => {
    // Faster timings: 10 seconds total
    const timings = [1500, 3500, 5500, 7500, 9000]
    const timers = timings.map((t, i) =>
      setTimeout(() => setCurrentStep(i + 1), t)
    )
    // Show annotation after final dots settle
    timers.push(setTimeout(() => setShowAnnotation(true), 9500))
    // Complete after 10s
    timers.push(setTimeout(() => onComplete(), 10500))
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const isFinalStep = currentStep >= 5

  function getDotPosition(country) {
    if (currentStep === 0) return ageToPercent(country.menarche)
    const s = STEPS[Math.min(currentStep - 1, STEPS.length - 1)]
    const val = country[s.field]
    if (val === null) return null
    return ageToPercent(val)
  }

  function getDotColor() {
    if (currentStep === 0) return STEPS[0].color
    return STEPS[Math.min(currentStep - 1, STEPS.length - 1)].color
  }

  function getLabel() {
    if (currentStep === 0) return STEPS[0].label
    return STEPS[Math.min(currentStep - 1, STEPS.length - 1)].label
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
      {/* Title */}
      <motion.h1
        className="font-display text-2xl md:text-4xl text-center mb-2 text-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Life, in motion
      </motion.h1>
      <motion.p
        className="text-center text-text-secondary font-body text-sm md:text-base mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Twelve countries begin at the same age. Watch how quickly their lives diverge.
      </motion.p>

      {/* Large milestone label — centered, bold, fading in/out */}
      <div className="h-12 flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          <motion.h2
            key={getLabel()}
            className="font-display text-xl md:text-3xl font-semibold"
            style={{ color: getDotColor() }}
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            {getLabel()}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Race visualization */}
      <div className="relative">
        {/* Country rows */}
        <div className="space-y-1 md:space-y-2 mb-4">
          {COUNTRIES.map((country) => {
            const pos = getDotPosition(country)
            const hidden = pos === null && currentStep > 0
            const startPct = ageToPercent(country.menarche)
            const endPct = ageToPercent(country.lifeExp)

            return (
              <div key={country.code} className="flex items-center h-6 md:h-7">
                {/* Country label */}
                <div className="w-16 md:w-24 flex-shrink-0 text-right pr-2 md:pr-3">
                  <span className="text-[10px] md:text-xs font-body text-text/70">
                    <span className="hidden md:inline">{country.flag} </span>
                    {country.code}
                  </span>
                </div>

                {/* Track */}
                <div className="flex-1 relative h-full">
                  {/* Track line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-text/10" />

                  {/* Life span bar (appears at final step) */}
                  {isFinalStep && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
                      style={{
                        left: `${startPct}%`,
                        backgroundColor: getDotColor(),
                        opacity: 0.2,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${endPct - startPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  )}

                  {/* Dot */}
                  {!hidden && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 flex items-center"
                      initial={{ left: `${startPct}%` }}
                      animate={{ left: `${pos ?? startPct}%` }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                    >
                      <motion.div
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-sm"
                        animate={{
                          backgroundColor: getDotColor(),
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          backgroundColor: { duration: 0.4 },
                          scale: { duration: 0.6, ease: 'easeInOut' },
                        }}
                        key={`${country.code}-${currentStep}`}
                      />
                    </motion.div>
                  )}

                  {/* Fade out for null retirement */}
                  {hidden && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 flex items-center"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0.2 }}
                      transition={{ duration: 0.8 }}
                      style={{ left: `${ageToPercent(country.marriage)}%` }}
                    >
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-text/20" />
                    </motion.div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Final annotation — BELOW the chart, centered */}
        <AnimatePresence>
          {showAnnotation && (
            <motion.p
              className="text-center font-display text-lg md:text-xl text-text/80 mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Same starting line. 12 years apart at the finish.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Age axis */}
        <div className="flex items-center ml-16 md:ml-24">
          <div className="flex-1 relative h-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-text/30" />
            {AGE_TICKS.map(age => {
              const pct = ageToPercent(age)
              return (
                <div
                  key={age}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-px h-2 bg-text/30" />
                  <span className="text-[9px] md:text-[10px] font-data text-text/50 mt-1">{age}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="fixed bottom-6 right-6 text-text/40 hover:text-text/70 text-xs font-body transition-colors cursor-pointer z-50"
      >
        Skip animation →
      </button>
    </div>
  )
}

function CountryPicker({ onPairSelected }) {
  const [selected, setSelected] = useState([])

  function handleCustomSelect(code) {
    if (selected.includes(code)) {
      setSelected(selected.filter(c => c !== code))
    } else if (selected.length < 2) {
      const newSelected = [...selected, code]
      if (newSelected.length === 2) {
        setTimeout(() => onPairSelected(newSelected), 300)
      }
      setSelected(newSelected)
    }
  }

  return (
    <motion.div
      className="w-full max-w-[1200px] mx-auto px-4 py-12 min-h-screen flex flex-col justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Headline */}
      <h2 className="font-display text-3xl md:text-5xl text-center mb-3 text-text">
        Two countries. One life.
      </h2>
      <p className="text-center text-text/60 font-body text-base md:text-lg mb-10">
        Pick a pair and see how differently life unfolds.
      </p>

      {/* Suggested pairs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-12">
        {SUGGESTED_PAIRS.map(pair => {
          const a = getCountryByCode(pair.codes[0])
          const b = getCountryByCode(pair.codes[1])
          return (
            <motion.button
              key={pair.codes.join('-')}
              onClick={() => onPairSelected(pair.codes)}
              className="p-4 md:p-5 rounded-xl border border-text/10 bg-white/60 hover:bg-white hover:border-text/20 hover:shadow-md transition-all text-left cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base md:text-lg">{a.flag}</span>
                <span className="font-body font-medium text-sm md:text-base text-text">{a.name}</span>
                <span className="text-text/30 font-body">&</span>
                <span className="text-base md:text-lg">{b.flag}</span>
                <span className="font-body font-medium text-sm md:text-base text-text">{b.name}</span>
              </div>
              <p className="font-body text-xs md:text-sm text-text/50 italic">
                {pair.tagline}
              </p>
            </motion.button>
          )
        })}
      </div>

      {/* Custom picker */}
      <div className="text-center">
        <p className="text-text/50 font-body text-sm mb-4">
          Or choose your own:
          {selected.length === 1 && (
            <span className="ml-2 text-marriage font-medium">Pick one more</span>
          )}
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-[700px] mx-auto">
          {COUNTRIES.map(country => {
            const isSelected = selected.includes(country.code)
            return (
              <motion.button
                key={country.code}
                onClick={() => handleCustomSelect(country.code)}
                className={`
                  px-3 py-2 rounded-lg border font-body text-sm cursor-pointer transition-all
                  ${isSelected
                    ? 'border-marriage bg-marriage/10 text-marriage ring-2 ring-marriage/30 font-medium'
                    : 'border-text/10 bg-white/60 hover:bg-white hover:border-text/20 text-text/80'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-1">{country.flag}</span>
                {country.name}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Jump to discoveries */}
      <div className="text-center mt-10">
        <button
          onClick={() => onPairSelected('__reveals__')}
          className="text-xs text-text-muted hover:text-text font-body cursor-pointer transition-colors"
        >
          Skip the journey — jump to discoveries →
        </button>
      </div>
    </motion.div>
  )
}

// --- Main Hook Component ---
export default function Hook({ onPairSelected, onJumpToReveals, onPhaseChange, initialPhase }) {
  const [phase, setPhase] = useState(initialPhase || 'animation')

  function changePhase(newPhase) {
    setPhase(newPhase)
    onPhaseChange?.(newPhase)
  }

  function handlePairSelected(pair) {
    if (pair === '__reveals__') {
      onJumpToReveals?.()
    } else {
      onPairSelected(pair)
    }
  }

  return (
    <div className="bg-bg min-h-screen">
      <AnimatePresence mode="wait">
        {phase === 'animation' && (
          <motion.div
            key="animation"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedRace onComplete={() => changePhase('picker')} />
          </motion.div>
        )}
        {phase === 'picker' && (
          <motion.div
            key="picker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <CountryPicker onPairSelected={handlePairSelected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
