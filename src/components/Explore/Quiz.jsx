import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTIONS = [
  {
    id: 1,
    question: "Which country's women marry youngest?",
    type: "mc",
    options: ["Sweden", "Brazil", "India", "Mexico"],
    answer: "India",
    reveal: "India. 21.4 years old. Rose from 17 to 21 in two generations."
  },
  {
    id: 2,
    question: "Rank these by years in retirement (most to least):",
    type: "rank",
    options: ["France", "USA", "South Korea", "Japan"],
    answer: ["France", "Japan", "South Korea", "USA"],
    reveal: "France retires 8 years earlier than Korea, but lives nearly as long."
  },
  {
    id: 3,
    question: "At what age do Italians leave home?",
    type: "slider",
    min: 18,
    max: 35,
    answer: 30.2,
    threshold: 2,
    reveal: "30.2. Eight years later than Swedes, despite similar GDP."
  },
  {
    id: 4,
    question: "Which country has the lowest fertility rate?",
    type: "mc",
    options: ["Japan", "Italy", "South Korea", "Germany"],
    answer: "South Korea",
    reveal: "South Korea. 0.72 children per woman. Down from 5.99 in 1960."
  },
  {
    id: 5,
    question: "In Sweden, women live 3 years longer than men. What % of those extra years are in poor health?",
    type: "slider",
    min: 0,
    max: 100,
    answer: 93,
    threshold: 10,
    reveal: "93%. They're not living longer. They're dying slower."
  },
  {
    id: 6,
    question: "Lowest life expectancy: USA, Germany, Denmark, or Australia?",
    type: "mc",
    options: ["USA", "Germany", "Denmark", "Australia"],
    answer: "USA",
    reveal: "USA. 78.9 years. 4.2 years less than Australia, despite higher GDP."
  },
  {
    id: 7,
    question: "Marriage age alone predicts what % of a country's GDP variation? (Across 44 countries)",
    type: "slider",
    min: 0,
    max: 100,
    answer: 75,
    threshold: 10,
    reveal: "75%. Validated across 44 countries, every continent, every income level."
  },
  {
    id: 8,
    question: "How many of our 12 countries have baby before marriage?",
    type: "mc",
    options: ["2", "4", "6", "8"],
    answer: "6",
    reveal: "6. Sweden, Italy, France, Denmark, Germany, USA. The 'normal' sequence is the minority."
  }
]

function getScoreMessage(score, total) {
  const pct = score / total
  if (pct >= 0.85) return "You see the world clearly."
  if (pct >= 0.6) return "Good instincts, but the data still has surprises for you."
  if (pct >= 0.3) return "The world isn't quite what we assume. That's the whole point."
  return "Every wrong answer is an 'I had no idea' moment. That's what this project is for."
}

// --- MC Question ---
function MCQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  function handleSelect(opt) {
    if (revealed) return
    setSelected(opt)
    setRevealed(true)
    const isCorrect = opt === question.answer
    setTimeout(() => onAnswer(isCorrect), 1800)
  }

  return (
    <div className="space-y-3">
      {question.options.map(opt => {
        const isThis = selected === opt
        const isCorrect = opt === question.answer
        let bg = 'bg-white/60 border-[#1a3340]/10'
        if (revealed && isCorrect) bg = 'bg-[#2D6A4F]/10 border-[#2D6A4F]/40'
        if (revealed && isThis && !isCorrect) bg = 'bg-[#E76F51]/8 border-[#E76F51]/30'

        return (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`w-full text-left px-5 py-3.5 rounded-xl border font-body text-sm md:text-base transition-all cursor-pointer ${bg}`}
          >
            {opt}
            {revealed && isCorrect && <span className="float-right text-[#2D6A4F]">✓</span>}
            {revealed && isThis && !isCorrect && <span className="float-right text-[#E76F51]">✗</span>}
          </button>
        )
      })}
      {revealed && (
        <motion.p
          className="text-text-secondary text-sm font-body mt-4 italic leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {question.reveal}
        </motion.p>
      )}
    </div>
  )
}

// --- Slider Question ---
function SliderQuestion({ question, onAnswer }) {
  const [value, setValue] = useState(Math.round((question.min + question.max) / 2))
  const [revealed, setRevealed] = useState(false)

  function handleSubmit() {
    setRevealed(true)
    const isCorrect = Math.abs(value - question.answer) <= question.threshold
    setTimeout(() => onAnswer(isCorrect), 1800)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="text-xs font-data text-text-muted w-8 text-right">{question.min}</span>
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.max > 50 ? 1 : 0.5}
          value={value}
          onChange={e => !revealed && setValue(parseFloat(e.target.value))}
          className="flex-1 h-2 rounded-lg appearance-none bg-[#1a3340]/10 cursor-pointer accent-marriage"
        />
        <span className="text-xs font-data text-text-muted w-8">{question.max}</span>
      </div>
      <div className="text-center">
        <span className="font-data text-2xl text-text font-medium">
          {question.max <= 50 ? value.toFixed(1) : Math.round(value)}
          {question.max === 100 && '%'}
        </span>
      </div>
      {!revealed && (
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-3 rounded-xl bg-marriage text-white text-sm font-body cursor-pointer hover:bg-marriage/90 transition-all"
        >
          Lock in answer
        </button>
      )}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-center gap-6 mb-3">
            <span className="text-sm font-data text-text-muted">Your answer: <span className="text-text font-medium">{question.max <= 50 ? value.toFixed(1) : Math.round(value)}</span></span>
            <span className="text-sm font-data text-[#2D6A4F]">Correct: <span className="font-medium">{question.answer}</span></span>
          </div>
          <p className="text-text-secondary text-sm font-body italic text-center leading-relaxed">{question.reveal}</p>
        </motion.div>
      )}
    </div>
  )
}

// --- Rank Question ---
function RankQuestion({ question, onAnswer }) {
  const [order, setOrder] = useState([...question.options])
  const [revealed, setRevealed] = useState(false)

  function moveUp(i) {
    if (revealed || i === 0) return
    const newOrder = [...order]
    ;[newOrder[i - 1], newOrder[i]] = [newOrder[i], newOrder[i - 1]]
    setOrder(newOrder)
  }

  function moveDown(i) {
    if (revealed || i === order.length - 1) return
    const newOrder = [...order]
    ;[newOrder[i], newOrder[i + 1]] = [newOrder[i + 1], newOrder[i]]
    setOrder(newOrder)
  }

  function handleSubmit() {
    setRevealed(true)
    const correctCount = order.filter((o, i) => o === question.answer[i]).length
    const isCorrect = correctCount >= 3
    setTimeout(() => onAnswer(isCorrect), 1800)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted font-body mb-2">Arrange from most to least:</p>
      {order.map((item, i) => {
        let itemBg = 'border-[#1a3340]/10 bg-white/60'
        if (revealed) {
          const correctIdx = question.answer.indexOf(item)
          if (correctIdx === i) itemBg = 'border-[#2D6A4F]/40 bg-[#2D6A4F]/8'
          else itemBg = 'border-[#E76F51]/20 bg-[#E76F51]/5'
        }
        return (
          <div key={item} className="flex items-center gap-2">
            <span className="w-5 text-xs font-data text-text-muted">{i + 1}.</span>
            <div className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-body text-text ${itemBg}`}>
              {item}
            </div>
            {!revealed && (
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="text-text-muted hover:text-text text-xs cursor-pointer leading-none">▲</button>
                <button onClick={() => moveDown(i)} className="text-text-muted hover:text-text text-xs cursor-pointer leading-none">▼</button>
              </div>
            )}
          </div>
        )
      })}
      {!revealed && (
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-3 rounded-xl bg-marriage text-white text-sm font-body cursor-pointer hover:bg-marriage/90 transition-all mt-2"
        >
          Lock in order
        </button>
      )}
      {revealed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-data text-text-muted mt-3">Correct: {question.answer.join(' > ')}</p>
          <p className="text-text-secondary text-sm font-body italic mt-2 leading-relaxed">{question.reveal}</p>
        </motion.div>
      )}
    </div>
  )
}

// --- Main Quiz ---
export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = QUESTIONS.length

  function handleAnswer(isCorrect) {
    if (isCorrect) setScore(s => s + 1)
    setTimeout(() => {
      if (currentQ + 1 >= total) {
        setFinished(true)
      } else {
        setCurrentQ(q => q + 1)
      }
    }, 600)
  }

  function handleShare() {
    const text = `I scored ${score}/${total} on "Life Milestones: How the World Grows Up". Test your intuition!`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (finished) {
    return (
      <motion.div
        className="text-center max-w-[500px] mx-auto py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="font-display text-4xl md:text-5xl text-text mb-3">{score} / {total}</h3>
        <p className="text-text-secondary font-body text-base md:text-lg mb-8">{getScoreMessage(score, total)}</p>
        <div className="flex flex-col gap-3 max-w-[300px] mx-auto">
          <button
            onClick={handleShare}
            className="px-5 py-3 rounded-xl bg-marriage text-white text-sm font-body cursor-pointer hover:bg-marriage/90 transition-all"
          >
            {copied ? 'Copied!' : 'Share your score'}
          </button>
          <button
            onClick={() => { setCurrentQ(0); setScore(0); setFinished(false) }}
            className="text-xs text-text-muted hover:text-text font-body cursor-pointer"
          >
            Try again
          </button>
        </div>
      </motion.div>
    )
  }

  const q = QUESTIONS[currentQ]

  return (
    <div className="max-w-[550px] mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs font-data text-text-muted">Question {currentQ + 1} of {total}</span>
        <span className="text-xs font-data text-text-secondary">{score} correct</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-display text-xl md:text-2xl text-text mb-6 leading-relaxed">
            {q.question}
          </h3>

          {q.type === 'mc' && <MCQuestion question={q} onAnswer={handleAnswer} />}
          {q.type === 'slider' && <SliderQuestion question={q} onAnswer={handleAnswer} />}
          {q.type === 'rank' && <RankQuestion question={q} onAnswer={handleAnswer} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
