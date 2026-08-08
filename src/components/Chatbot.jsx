import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import globalMetrics from '../data/global_metrics.json'
import countryProfiles from '../data/country_profiles.json'
import correlationNarratives from '../data/correlation_narratives.json'

// Country lookup
const COUNTRIES = {
  SWE: 'Sweden', ITA: 'Italy', KOR: 'South Korea', FRA: 'France',
  DNK: 'Denmark', JPN: 'Japan', BRA: 'Brazil', AUS: 'Australia',
  USA: 'United States', DEU: 'Germany', IND: 'India', MEX: 'Mexico'
}

const COUNTRY_ALIASES = {
  sweden: 'SWE', italy: 'ITA', 'south korea': 'KOR', korea: 'KOR',
  france: 'FRA', denmark: 'DNK', japan: 'JPN', brazil: 'BRA',
  australia: 'AUS', usa: 'USA', 'united states': 'USA', america: 'USA',
  germany: 'DEU', india: 'IND', mexico: 'MEX'
}

const METRIC_ALIASES = {
  gdp: 'gdp_per_capita', 'gdp per capita': 'gdp_per_capita',
  fertility: 'fertility_rate', 'fertility rate': 'fertility_rate',
  'life expectancy': 'life_exp_female', lifespan: 'life_exp_female',
  happiness: 'happiness', 'happiness score': 'happiness',
  marriage: 'marriage_age_female', 'marriage age': 'marriage_age_female',
  education: 'education_completion_age', 'education age': 'education_completion_age',
  retirement: 'retirement_age', 'retirement age': 'retirement_age',
  hale: 'hale_female', 'healthy years': 'hale_female',
  'maternal mortality': 'maternal_mortality',
  inequality: 'gender_inequality_index', gii: 'gender_inequality_index',
  'female workforce': 'female_lfpr', lfpr: 'female_lfpr',
}

function findCountry(text) {
  const lower = text.toLowerCase()
  for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) {
    if (lower.includes(alias)) return code
  }
  return null
}

function findMetric(text) {
  const lower = text.toLowerCase()
  for (const [alias, key] of Object.entries(METRIC_ALIASES)) {
    if (lower.includes(alias)) return key
  }
  return null
}

function getMetricValue(countryCode, metricKey) {
  const data = globalMetrics.find(d => d.country_code === countryCode)
  if (!data) return null
  return data[metricKey]
}

function formatMetricValue(key, value) {
  if (value == null) return 'data not available'
  if (key.includes('gdp')) return `$${Math.round(value).toLocaleString()}`
  if (key.includes('rate') && value < 10) return value.toFixed(2)
  if (key.includes('pct') || key.includes('lfpr')) return `${value.toFixed(1)}%`
  if (key.includes('mortality')) return `${value} per 100k`
  return value.toFixed(1)
}

function getMetricLabel(key) {
  const labels = {
    gdp_per_capita: 'GDP per capita',
    fertility_rate: 'fertility rate',
    life_exp_female: 'life expectancy (female)',
    happiness: 'happiness score',
    marriage_age_female: 'marriage age (female)',
    education_completion_age: 'education completion age',
    hale_female: 'healthy life expectancy (HALE)',
    maternal_mortality: 'maternal mortality',
    gender_inequality_index: 'gender inequality index',
    female_lfpr: 'female labor force participation',
    retirement_age: 'retirement age',
  }
  return labels[key] || key.replace(/_/g, ' ')
}


function generateAnswer(question) {
  const lower = question.toLowerCase()
  const country = findCountry(lower)
  const metric = findMetric(lower)

  // Highest/lowest questions
  if (lower.includes('highest') || lower.includes('lowest') || lower.includes('most') || lower.includes('least') || lower.includes('best') || lower.includes('worst')) {
    const m = metric || 'gdp_per_capita'
    const sorted = [...globalMetrics].sort((a, b) => (b[m] || 0) - (a[m] || 0))
    const isLow = lower.includes('lowest') || lower.includes('least') || lower.includes('worst')
    const target = isLow ? sorted[sorted.length - 1] : sorted[0]
    const label = getMetricLabel(m)
    const name = COUNTRIES[target.country_code]
    const val = formatMetricValue(m, target[m])
    return `${name} has the ${isLow ? 'lowest' : 'highest'} ${label} at ${val} among our 12 countries.`
  }

  // Compare two countries
  const allCountries = Object.entries(COUNTRY_ALIASES)
  const found = []
  for (const [alias, code] of allCountries) {
    if (lower.includes(alias) && !found.includes(code)) found.push(code)
  }
  if (found.length >= 2 && metric) {
    const [c1, c2] = found
    const v1 = getMetricValue(c1, metric)
    const v2 = getMetricValue(c2, metric)
    const label = getMetricLabel(metric)
    return `${COUNTRIES[c1]}: ${formatMetricValue(metric, v1)} vs ${COUNTRIES[c2]}: ${formatMetricValue(metric, v2)} (${label}).`
  }

  // Single country + metric
  if (country && metric) {
    const value = getMetricValue(country, metric)
    const label = getMetricLabel(metric)
    return `${COUNTRIES[country]}'s ${label} is ${formatMetricValue(metric, value)}.`
  }

  // Country profile
  if (country) {
    const data = globalMetrics.find(d => d.country_code === country)
    if (data) {
      return `${COUNTRIES[country]}: GDP $${Math.round(data.gdp_per_capita || 0).toLocaleString()}, Life Expectancy ${data.life_exp_female?.toFixed(1) || '?'}yrs (F), Fertility Rate ${data.fertility_rate?.toFixed(2) || '?'}, Marriage Age ${data.marriage_age_female?.toFixed(1) || '?'}, Happiness ${data.happiness?.toFixed(1) || '?'}/10.`
    }
  }

  // Correlation questions
  if (lower.includes('correlat') || lower.includes('relationship') || lower.includes('affect') || lower.includes('impact') || lower.includes('improve')) {
    const corr = correlationNarratives.correlations?.find(c => {
      const m = metric || ''
      return c.outcome === m || c.milestone === m || lower.includes(c.outcome?.replace(/_/g, ' ')) || lower.includes(c.milestone?.replace(/_/g, ' '))
    })
    if (corr) {
      let answer = `${corr.one_liner} (r=${corr.r}, ${corr.confidence} confidence). ${corr.mechanism}`
      if (corr.improvement_path) answer += `\n\n💡 ${corr.improvement_path}`
      return answer
    }
  }

  // Fallback suggestions
  return `I can answer questions about our 12 countries (Sweden, India, Japan, USA, etc.) and metrics like GDP, fertility rate, life expectancy, happiness, marriage age, education, and more.\n\nTry asking:\n• "What is India's GDP?"\n• "Which country has the lowest fertility rate?"\n• "Compare Sweden and USA on happiness"\n• "How does education affect GDP?"`
}

const SUGGESTIONS = [
  "Which country has the lowest fertility rate?",
  "Compare Japan and Sweden",
  "How does marriage age affect GDP?",
  "What is India's life expectancy?",
  "Which country is happiest?",
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your data assistant. Ask me anything about life markers across our 12 countries. 🌍" }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(text) {
    const question = text || input.trim()
    if (!question) return
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    // Simulate typing delay
    setTimeout(() => {
      const answer = generateAnswer(question)
      setMessages(prev => [...prev, { role: 'bot', text: answer }])
    }, 400)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#264653] text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}>
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-[9999] w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}>

            {/* Header */}
            <div className="bg-[#264653] text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🤖</div>
              <div>
                <p className="text-[14px] font-body font-semibold">Data Assistant</p>
                <p className="text-[11px] font-body text-white/60">Ask about life markers & outcomes</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[340px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] font-body leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#264653] text-white rounded-br-sm'
                      : 'bg-gray-100 text-[#1e293b] rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}/>
            </div>

            {/* Suggestions (only if few messages) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="text-[11px] font-body px-2.5 py-1 rounded-full bg-[#f0f9ff] text-[#264653] border border-[#264653]/10 cursor-pointer hover:bg-[#dbeafe] transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 px-3 py-2 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about the data..."
                className="flex-1 text-[13px] font-body px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#264653] bg-gray-50"
              />
              <button
                onClick={() => handleSend()}
                className="px-3 py-2 rounded-lg bg-[#264653] text-white text-[13px] font-body font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
