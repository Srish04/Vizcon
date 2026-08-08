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
  happiness: 'happiness_score', 'happiness score': 'happiness_score', happiest: 'happiness_score',
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
    happiness_score: 'happiness score',
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

  // Highest/lowest questions - clear intent, answer directly
  if (lower.includes('highest') || lower.includes('lowest') || lower.includes('most') || lower.includes('least') || lower.includes('best') || lower.includes('worst') || lower.includes('happiest')) {
    const m = metric || 'gdp_per_capita'
    const sorted = [...globalMetrics].sort((a, b) => (b[m] || 0) - (a[m] || 0))
    const isLow = lower.includes('lowest') || lower.includes('least') || lower.includes('worst')
    const target = isLow ? sorted[sorted.length - 1] : sorted[0]
    const label = getMetricLabel(m)
    const name = COUNTRIES[target.country_code]
    const val = formatMetricValue(m, target[m])
    return {
      text: `${name} has the ${isLow ? 'lowest' : 'highest'} ${label} at ${val} among our 12 countries.`,
      followUps: [`Why is ${name}'s ${label} ${isLow ? 'low' : 'high'}?`, `How to improve ${label}?`, `Tell me about ${name}`]
    }
  }

  // Compare two countries
  const allCountries = Object.entries(COUNTRY_ALIASES)
  const found = []
  for (const [alias, code] of allCountries) {
    if (lower.includes(alias) && !found.includes(code)) found.push(code)
  }

  // Two countries but no metric - ask what to compare
  if (found.length >= 2 && !metric) {
    return {
      text: `I can compare ${COUNTRIES[found[0]]} and ${COUNTRIES[found[1]]}! Which metric?`,
      followUps: [`Compare on GDP`, `Compare on happiness`, `Compare on life expectancy`, `Compare on fertility rate`]
    }
  }

  if (found.length >= 2 && metric) {
    const [c1, c2] = found
    const v1 = getMetricValue(c1, metric)
    const v2 = getMetricValue(c2, metric)
    const label = getMetricLabel(metric)
    const higher = (v1 || 0) > (v2 || 0) ? COUNTRIES[c1] : COUNTRIES[c2]
    return {
      text: `📊 ${label}:\n• ${COUNTRIES[c1]}: ${formatMetricValue(metric, v1)}\n• ${COUNTRIES[c2]}: ${formatMetricValue(metric, v2)}\n\n${higher} leads on this metric.`,
      followUps: [`Why is ${higher}'s ${label} higher?`, `Compare on happiness`, `How to improve ${label}?`]
    }
  }

  // Single country + metric - direct answer
  if (country && metric) {
    const value = getMetricValue(country, metric)
    const label = getMetricLabel(metric)
    return {
      text: `${COUNTRIES[country]}'s ${label} is ${formatMetricValue(metric, value)}.`,
      followUps: [`How does ${COUNTRIES[country]} compare to others?`, `What drives ${label}?`, `Tell me more about ${COUNTRIES[country]}`]
    }
  }

  // Country mentioned but no metric - ask what they want
  if (country && !metric) {
    if (lower.includes('everything') || lower.includes('all') || lower.includes('profile') || lower.includes('tell me')) {
      const data = globalMetrics.find(d => d.country_code === country)
      if (data) {
        return {
          text: `📋 ${COUNTRIES[country]} Profile:\n• GDP: $${Math.round(data.gdp_per_capita || 0).toLocaleString()}\n• Life Expectancy: ${data.life_exp_female?.toFixed(1) || '?'}yrs (F)\n• Fertility Rate: ${data.fertility_rate?.toFixed(2) || '?'}\n• Marriage Age: ${data.marriage_age_female?.toFixed(1) || '?'}\n• Happiness: ${data.happiness_score?.toFixed(1) || '?'}/10\n• Female LFPR: ${data.female_lfpr?.toFixed(1) || '?'}%`,
          followUps: [`${COUNTRIES[country]}'s GDP details`, `Compare ${COUNTRIES[country]} to Sweden`, `How to improve ${COUNTRIES[country]}'s outcomes?`]
        }
      }
    }
    return {
      text: `I have lots of data on ${COUNTRIES[country]}! What would you like to know?`,
      followUps: [`${COUNTRIES[country]}'s GDP`, `${COUNTRIES[country]}'s life expectancy`, `${COUNTRIES[country]}'s happiness`, `Tell me everything about ${COUNTRIES[country]}`]
    }
  }

  // Metric mentioned but no country - show ranking
  if (metric && !country) {
    const label = getMetricLabel(metric)
    const sorted = [...globalMetrics].filter(d => d[metric] != null).sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    const top = sorted[0]
    const bottom = sorted[sorted.length - 1]
    return {
      text: `📊 ${label} across 12 countries:\n• Highest: ${COUNTRIES[top?.country_code]} (${formatMetricValue(metric, top?.[metric])})\n• Lowest: ${COUNTRIES[bottom?.country_code]} (${formatMetricValue(metric, bottom?.[metric])})`,
      followUps: [`Tell me about ${COUNTRIES[top?.country_code]}`, `Tell me about ${COUNTRIES[bottom?.country_code]}`, `How to improve ${label}?`]
    }
  }

  // Correlation/improvement questions
  if (lower.includes('correlat') || lower.includes('relationship') || lower.includes('affect') || lower.includes('impact') || lower.includes('improve') || lower.includes('how to') || lower.includes('why') || lower.includes('factor') || lower.includes('drive')) {
    const corr = correlationNarratives.correlations?.find(c => {
      return lower.includes(c.outcome?.replace(/_/g, ' ')) || lower.includes(c.milestone?.replace(/_/g, ' '))
    })
    if (corr) {
      let answer = `📈 ${corr.one_liner}\n\nStrength: r = ${corr.r} (${Math.abs(corr.r) > 0.7 ? 'strong' : Math.abs(corr.r) > 0.4 ? 'moderate' : 'weak'})\nType: ${corr.group === 'causal' ? 'Causal' : corr.group === 'feedback' ? 'Feedback loop' : 'Shared drivers'}\n\n${corr.mechanism}`
      if (corr.improvement_path) answer += `\n\n💡 ${corr.improvement_path}`
      return {
        text: answer,
        followUps: [`Which country does this best?`, `Lowest ${corr.outcome?.replace(/_/g, ' ')}?`, `Compare two countries`]
      }
    }
    return {
      text: `I can explain how life markers drive outcomes.`,
      followUps: [`Marriage age → GDP?`, `Education → life expectancy?`, `How to improve happiness?`, `Marriage → inequality?`]
    }
  }

  // Fallback
  return {
    text: `I'm Titan — I help you explore connections in our 12-country dataset. What would you like to explore?`,
    followUps: [`Happiest country?`, `Tell me about India`, `Compare Japan & Sweden`, `How does education affect GDP?`]
  }
}

const SUGGESTIONS = [
  "Lowest fertility rate?",
  "Compare Japan & Sweden",
  "India's GDP?",
  "Education → GDP?",
  "Happiest country?",
]


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey! I'm Titan, your data guide. Ask me anything about life markers, country stats, or how outcomes connect across our 12 countries. 🌍", followUps: ["Happiest country?", "Compare Japan & India", "How does education affect GDP?"] }
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
    setTimeout(() => {
      const result = generateAnswer(question)
      setMessages(prev => [...prev, { role: 'bot', text: result.text, followUps: result.followUps }])
    }, 400)
  }

  return (
    <>
      {/* Floating Titan button - always visible */}
      <motion.div
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}>

        {/* Label pill */}
        {!isOpen && (
          <motion.div
            className="bg-[#264653] text-white px-3 py-1.5 rounded-full shadow-lg text-[12px] font-body font-bold tracking-wide"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}>
            Ask Titan
          </motion.div>
        )}

        {/* Icon */}
        <div className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-[#E76F51]' : 'bg-gradient-to-br from-[#264653] to-[#2a9d8f]'
        }`}>
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              {/* Titan icon - stylized brain/data icon */}
              <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3"/>
              <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>
              <path d="M10 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="10" cy="8" r="2" fill="#E9C46A"/>
              <circle cx="22" cy="8" r="2" fill="#E76F51"/>
              <circle cx="8" cy="18" r="1.5" fill="#2A9D8F"/>
              <circle cx="24" cy="18" r="1.5" fill="#AB47BC"/>
              <path d="M10 8L14 11M22 8L18 11M8 18L12 16M24 18L20 16" stroke="white" strokeWidth="0.8" opacity="0.5"/>
            </svg>
          )}
        </div>
      </motion.div>

      {/* Pulse ring animation when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full pointer-events-none">
          <span className="absolute inset-0 rounded-full bg-[#2a9d8f] opacity-30 animate-ping"/>
        </div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-[9999] w-[400px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#264653] to-[#2a9d8f] text-white px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/>
                  <path d="M10 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="10" cy="8" r="2" fill="#E9C46A"/>
                  <circle cx="22" cy="8" r="2" fill="#E76F51"/>
                </svg>
              </div>
              <div>
                <p className="text-[16px] font-display font-bold">Titan</p>
                <p className="text-[11px] font-body text-white/70">Your life markers data assistant</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
                <span className="text-[10px] font-body text-white/60">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-[360px] bg-[#f8fafb]">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#264653] to-[#2a9d8f] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] text-white font-bold">T</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] font-body leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#264653] text-white rounded-br-md'
                        : 'bg-white text-[#1e293b] rounded-bl-md shadow-sm border border-gray-100'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                  {/* Clickable follow-up buttons */}
                  {msg.role === 'bot' && msg.followUps && i === messages.length - 1 && (
                    <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                      {msg.followUps.map(q => (
                        <button key={q} onClick={() => handleSend(q)}
                          className="text-[11px] font-body px-3 py-1.5 rounded-full bg-gradient-to-r from-[#f0f9ff] to-[#ecfdf5] text-[#264653] border border-[#2a9d8f]/20 cursor-pointer hover:border-[#2a9d8f]/50 hover:shadow-sm transition-all">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask Titan about the data..."
                className="flex-1 text-[13px] font-body px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2a9d8f] focus:ring-1 focus:ring-[#2a9d8f]/20 bg-gray-50 transition-all"
              />
              <button
                onClick={() => handleSend()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#264653] to-[#2a9d8f] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
