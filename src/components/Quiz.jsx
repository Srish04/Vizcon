import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import quizData from '../data/quiz.json'

const total = quizData.length

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 3l8 8M11 3l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Progress circles
function ProgressDots({ current, answers, questions }) {
  return (
    <div className="flex justify-center gap-3 mb-8">
      {questions.map((q, i) => {
        const answered = answers[q.id] !== undefined
        const isCurrent = i === current
        const isCorrect = answered && checkCorrect(q, answers[q.id])
        const isWrong = answered && !isCorrect
        let bg = 'bg-transparent border-2 border-[#d1d5db]'
        if (isCurrent && !answered) bg = 'bg-[#264653] border-2 border-[#264653] animate-pulse'
        else if (isCorrect) bg = 'bg-[#2D6A4F] border-2 border-[#2D6A4F]'
        else if (isWrong) bg = 'bg-[#E76F51] border-2 border-[#E76F51]'
        return (
          <div key={i} className={`w-4 h-4 rounded-full flex items-center justify-center ${bg}`}>
            {isCorrect && <CheckIcon/>}
            {isWrong && <XIcon/>}
          </div>
        )
      })}
    </div>
  )
}

function checkCorrect(q, answer) {
  if (q.type === 'multiple_choice' || q.type === 'binary') return answer === q.answer
  if (q.type === 'slider') return Math.abs(answer - q.answer_value) <= 2
  if (q.type === 'rank') return JSON.stringify(answer) === JSON.stringify(q.answer)
  return false
}

function MultipleChoice({ question, onAnswer, answered, userAnswer }) {
  return (
    <div className="space-y-3">
      {question.options.map(opt => {
        const isCorrect = opt === question.answer
        const isSelected = opt === userAnswer
        let cls = 'border-[#e5e7eb] bg-white hover:border-[#264653] hover:bg-[#f8fafc]'
        if (answered) {
          if (isCorrect) cls = 'border-[#2D6A4F] bg-[#f0fdf4] scale-[1.02]'
          else if (isSelected) cls = 'border-[#E76F51] bg-[#fef2f2]'
          else cls = 'border-[#e5e7eb] bg-white opacity-40'
        }
        return (
          <button key={opt} onClick={() => !answered && onAnswer(opt)} disabled={answered}
            className={`w-full h-14 flex items-center justify-between px-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${cls}`}>
            <span className={`text-[16px] font-body font-semibold ${answered && isCorrect ? 'text-[#2D6A4F]' : answered && isSelected ? 'text-[#E76F51]' : 'text-[#264653]'}`}>
              {opt}
            </span>
            {answered && isCorrect && <span className="w-6 h-6 rounded-full bg-[#2D6A4F] flex items-center justify-center"><CheckIcon/></span>}
            {answered && isSelected && !isCorrect && <span className="w-6 h-6 rounded-full bg-[#E76F51] flex items-center justify-center"><XIcon/></span>}
          </button>
        )
      })}
    </div>
  )
}

function BinaryChoice({ question, onAnswer, answered, userAnswer }) {
  return (
    <div className="flex gap-4">
      {question.options.map(opt => {
        const isCorrect = opt === question.answer
        const isSelected = opt === userAnswer
        let cls = 'border-[#e5e7eb] bg-white hover:border-[#264653] hover:bg-[#f8fafc]'
        if (answered) {
          if (isCorrect) cls = 'border-[#2D6A4F] bg-[#f0fdf4]'
          else if (isSelected) cls = 'border-[#E76F51] bg-[#fef2f2]'
          else cls = 'border-[#e5e7eb] bg-white opacity-40'
        }
        return (
          <button key={opt} onClick={() => !answered && onAnswer(opt)} disabled={answered}
            className={`flex-1 h-16 rounded-xl border-2 text-[16px] font-body font-semibold cursor-pointer transition-all ${cls} ${answered && isCorrect ? 'text-[#2D6A4F]' : answered && isSelected ? 'text-[#E76F51]' : 'text-[#264653]'}`}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function SliderQuestion({ question, onAnswer, answered, userAnswer }) {
  const [val, setVal] = useState(Math.round((question.min + question.max) / 2))
  return (
    <div>
      {!answered && (
        <div className="space-y-6">
          <div className="text-center">
            <span className="font-data text-[32px] font-bold text-[#264653]">{val}</span>
            <span className="text-[16px] font-body text-[#94a3b8] ml-2">years old</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-body text-[#94a3b8]">{question.min}</span>
            <input type="range" min={question.min} max={question.max} step={0.5} value={val}
              onChange={e => setVal(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#264653]"/>
            <span className="text-[14px] font-body text-[#94a3b8]">{question.max}</span>
          </div>
          <button onClick={() => onAnswer(val)}
            className="w-full py-3 rounded-lg bg-[#264653] text-white font-body text-[15px] font-semibold cursor-pointer hover:opacity-90 transition-opacity">
            Lock in answer
          </button>
        </div>
      )}
      {answered && (
        <div className="text-center space-y-2">
          <p className="font-data text-[16px] text-[#475569]">Your guess: <span className="text-[#264653] font-bold">{userAnswer}</span></p>
          <p className="font-data text-[16px] text-[#475569]">Actual: <span className="text-[#E76F51] font-bold">{question.answer_value}</span></p>
          <p className="font-data text-[14px] text-[#94a3b8]">
            You were {Math.abs(userAnswer - question.answer_value).toFixed(1)} years {userAnswer > question.answer_value ? 'too high' : 'too low'}
          </p>
        </div>
      )}
    </div>
  )
}

function RankQuestion({ question, onAnswer, answered, userAnswer }) {
  const [items, setItems] = useState([...question.options])
  function moveUp(idx) { if (idx===0)return; const a=[...items];[a[idx-1],a[idx]]=[a[idx],a[idx-1]];setItems(a) }
  function moveDown(idx) { if (idx===items.length-1)return; const a=[...items];[a[idx],a[idx+1]]=[a[idx+1],a[idx]];setItems(a) }
  return (
    <div>
      {!answered && (
        <div className="space-y-4">
          <p className="text-[14px] font-body text-[#475569] mb-2">Reorder (most to fewest):</p>
          {items.map((item, i) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#e5e7eb] bg-white">
              <span className="w-6 text-[14px] font-data text-[#94a3b8]">{i+1}.</span>
              <span className="flex-1 text-[16px] font-body text-[#264653]">{item}</span>
              <button onClick={()=>moveUp(i)} disabled={i===0} className="text-[#475569] hover:text-[#264653] disabled:opacity-20 cursor-pointer text-[14px]">Up</button>
              <button onClick={()=>moveDown(i)} disabled={i===items.length-1} className="text-[#475569] hover:text-[#264653] disabled:opacity-20 cursor-pointer text-[14px]">Dn</button>
            </div>
          ))}
          <button onClick={()=>onAnswer(items)}
            className="w-full py-3 rounded-lg bg-[#264653] text-white font-body text-[15px] font-semibold cursor-pointer hover:opacity-90 transition-opacity">
            Submit ranking
          </button>
        </div>
      )}
      {answered && (
        <div className="space-y-2">
          <p className="text-[14px] font-body text-[#475569] mb-2">Correct order:</p>
          {question.answer.map((item, i) => {
            const userIdx = userAnswer.indexOf(item)
            const ok = userIdx === i
            return (
              <div key={item} className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${ok ? 'border-[#2D6A4F] bg-[#f0fdf4]' : 'border-[#E76F51] bg-[#fef2f2]'}`}>
                <span className="w-6 text-[14px] font-data text-[#475569]">{i+1}.</span>
                <span className="flex-1 text-[15px] font-body">{item}</span>
                <span className="text-[14px] font-data text-[#475569]">{question.answer_value[i]} years</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Score circle with animated ring
function ScoreCircle({ score, total }) {
  const pct = total > 0 ? score / total : 0
  const circumference = 2 * Math.PI * 52
  const strokeColor = pct > 0.5 ? '#2D6A4F' : '#E76F51'
  return (
    <div className="relative w-[120px] h-[120px] mx-auto mb-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="white" stroke="#e5e7eb" strokeWidth="8"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke={strokeColor} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className="transition-all duration-1000 ease-out"
          transform="rotate(-90 60 60)"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-data text-[36px] font-bold text-[#264653]">{score}/{total}</span>
        <span className="text-[14px] font-body text-[#475569]">correct</span>
      </div>
    </div>
  )
}

// === MAIN COMPONENT ===
export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const question = quizData[currentQ]
  const answered = answers[question?.id] !== undefined

  function handleAnswer(answer) {
    const q = quizData[currentQ]
    const correct = checkCorrect(q, answer)
    setAnswers(prev => ({ ...prev, [q.id]: answer }))
    if (correct) setScore(s => s + 1)
  }

  function nextQuestion() {
    if (currentQ < total - 1) setCurrentQ(currentQ + 1)
    else setShowResults(true)
  }

  function restart() {
    setCurrentQ(0); setAnswers({}); setScore(0); setShowResults(false)
  }

  function getHeadline() {
    const pct = score / total
    if (pct >= 0.85) return 'Remarkable. You know this world well.'
    if (pct >= 0.6) return 'Better than most. The data holds some surprises.'
    if (pct >= 0.35) return 'The world surprised you. That is exactly the point.'
    return 'The data sees the world very differently. Scroll up to explore why.'
  }

  // Results screen
  if (showResults) {
    return (
      <section id="quiz" className="py-24 px-4 md:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #fef3c7, #fff7ed)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(245,158,11,0.05) 20px, rgba(245,158,11,0.05) 21px)' }}>
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover" loading="lazy"/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(254,243,199,0.93), rgba(255,247,237,0.95))' }}/>
        </div>
        <div className="max-w-[600px] mx-auto relative z-10">
          <motion.div className="bg-white rounded-2xl shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <ScoreCircle score={score} total={total}/>
            <p className="font-display text-[22px] text-[#264653] mt-6 mb-8">{getHeadline()}</p>
            <div className="flex justify-center gap-4">
              <button onClick={restart}
                className="px-6 py-3 rounded-lg border-2 border-[#264653] text-[#264653] text-[16px] font-body font-semibold cursor-pointer hover:bg-[#264653] hover:text-white transition-all">
                Try again
              </button>
              <button onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-lg bg-[#264653] text-white text-[16px] font-body font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                Explore the data
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="quiz" className="py-24 px-4 md:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #fef3c7, #fff7ed)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(245,158,11,0.05) 20px, rgba(245,158,11,0.05) 21px)' }}>
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80&auto=format" alt="" className="w-full h-full object-cover" loading="lazy"/>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(254,243,199,0.93), rgba(255,247,237,0.95))' }}/>
      </div>
      <div className="max-w-[600px] mx-auto relative z-10">
        <h2 className="font-display text-[36px] md:text-[40px] text-[#264653] mb-2 text-center">Test Your Intuition</h2>
        <p className="font-body text-[18px] text-[#475569] mb-8 text-center">
          {total} questions about life milestones. Most people get fewer than half right.
        </p>

        <ProgressDots current={currentQ} answers={answers} questions={quizData}/>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-200 mb-6">
          <p className="text-[13px] font-body font-bold uppercase text-[#94a3b8] tracking-wider">Question {currentQ + 1}</p>
          <p className="font-display text-[20px] md:text-[22px] text-[#264653] mt-4 mb-8 leading-relaxed">{question.question}</p>

          {question.type === 'multiple_choice' && <MultipleChoice question={question} onAnswer={handleAnswer} answered={answered} userAnswer={answers[question.id]}/>}
          {question.type === 'binary' && <BinaryChoice question={question} onAnswer={handleAnswer} answered={answered} userAnswer={answers[question.id]}/>}
          {question.type === 'slider' && <SliderQuestion question={question} onAnswer={handleAnswer} answered={answered} userAnswer={answers[question.id]}/>}
          {question.type === 'rank' && <RankQuestion question={question} onAnswer={handleAnswer} answered={answered} userAnswer={answers[question.id]}/>}
        </div>

        {/* Insight reveal */}
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="bg-[#f1f5f9] rounded-xl p-6 border-l-4 border-[#264653] mb-6">
              <p className="text-[12px] font-body font-bold uppercase text-[#264653] tracking-wider">Insight</p>
              <p className="font-body text-[16px] text-[#334155] mt-2 leading-relaxed">{question.insight}</p>
              <p className="text-[13px] font-body text-[#94a3b8] mt-2">{question.source}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {answered && (
          <button onClick={nextQuestion}
            className="w-full py-4 rounded-xl bg-[#264653] text-white font-body text-[16px] font-semibold cursor-pointer hover:bg-[#1a3a4a] transition-colors">
            {currentQ < total - 1 ? 'Next question' : 'See results'}
          </button>
        )}
      </div>
    </section>
  )
}
