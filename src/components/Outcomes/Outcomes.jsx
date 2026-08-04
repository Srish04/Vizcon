import { useState } from 'react'
import { motion } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'
import correlationData from '../../data/correlation_narratives.json'
import pairStoryData from '../../data/pair_story_analysis.json'

const MILESTONE_KEY_MAP = {
  marriage_age: 'marriage', education_completion_age: 'education',
  menarche_age: 'menarche', menopause_age: 'menopause',
  first_birth_age: 'first_baby', cohabitation_age: 'cohabitation',
  first_home_age: 'first_home', retirement_age: 'retirement_age',
  hale: 'hale', fertility_rate: 'fertility_rate',
}

const MECHANISM_COLORS = { causal: '#2D6A4F', common_cause: '#457B9D', feedback: '#E76F51' }

// Outcome metrics for the dashboard
const DASHBOARD_METRICS = [
  { key: 'happiness', label: 'Happiness', range: [3, 8], format: v => v.toFixed(1), higherBetter: true },
  { key: 'life_expectancy', label: 'Life Expectancy', range: [60, 90], format: v => v.toFixed(1), higherBetter: true },
  { key: 'hale', label: 'Healthy Years (HALE)', range: [50, 80], format: v => v.toFixed(1), higherBetter: true },
  { key: 'gdp_per_capita', label: 'GDP per Capita', range: [0, 70000], format: v => `$${(v/1000).toFixed(0)}k`, higherBetter: true },
  { key: 'female_lfpr', label: 'Women Working (LFPR)', range: [20, 90], format: v => `${v.toFixed(0)}%`, higherBetter: true },
  { key: 'gender_inequality_index', label: 'Gender Inequality', range: [0, 0.6], format: v => v.toFixed(2), higherBetter: false },
  { key: 'years_poor_health', label: 'Years in Poor Health', range: [5, 20], format: v => `${v.toFixed(1)}yr`, higherBetter: false },
  { key: 'fertility_rate', label: 'Fertility Rate', range: [0.5, 4], format: v => v.toFixed(2), higherBetter: null },
]

function getProfile(code) { return countryProfiles.find(c => c.country === code) }

function getMilestoneVal(profile, key) {
  const pKey = MILESTONE_KEY_MAP[key] || key
  const ms = profile.milestones?.[pKey]
  if (ms?.value != null) return ms.value
  const oc = profile.outcomes?.[pKey]
  if (oc?.value != null) return oc.value
  return null
}

function getOutcomeVal(profile, key) {
  const oc = profile.outcomes?.[key]
  if (oc?.value != null) return oc.value
  const ms = profile.milestones?.[key]
  if (ms?.value != null) return ms.value
  return null
}

function selectConnections(profileA, profileB) {
  const corrs = correlationData.correlations.filter(c => c.group !== 'artifact' && c.confidence !== 'low')
  const usable = corrs.map(c => {
    const mA = getMilestoneVal(profileA, c.milestone)
    const mB = getMilestoneVal(profileB, c.milestone)
    const oA = getOutcomeVal(profileA, c.outcome)
    const oB = getOutcomeVal(profileB, c.outcome)
    if (mA == null || mB == null || oA == null || oB == null) return null
    const gap = Math.abs(mA - mB)
    return { ...c, mA, mB, oA, oB, gap, score: gap * Math.abs(c.r) }
  }).filter(Boolean)
  const byMilestone = {}
  usable.forEach(c => { if (!byMilestone[c.milestone] || c.score > byMilestone[c.milestone].score) byMilestone[c.milestone] = c })
  return Object.values(byMilestone).sort((a, b) => b.score - a.score).slice(0, 4)
}

function fillTemplate(template, profileA, profileB, conn) {
  const highIsA = conn.mA >= conn.mB
  const high = highIsA ? profileA : profileB
  const low = highIsA ? profileB : profileA
  return template
    .replace(/{high_country}/g, high.name).replace(/{low_country}/g, low.name)
    .replace(/{high_val}/g, highIsA ? conn.mA : conn.mB).replace(/{low_val}/g, highIsA ? conn.mB : conn.mA)
    .replace(/{high_outcome}/g, highIsA ? conn.oA : conn.oB).replace(/{low_outcome}/g, highIsA ? conn.oB : conn.oA)
    .replace(/{gap}/g, Math.abs(conn.mA - conn.mB).toFixed(1))
}

function getSuggestedNextPair(currentPair) {
  const rankings = pairStoryData.pair_story_rankings || []
  const [cA, cB] = currentPair
  const next = rankings.find(p => p.country_a !== cA && p.country_a !== cB && p.country_b !== cA && p.country_b !== cB)
  if (!next) return null
  const pA = getProfile(next.country_a), pB = getProfile(next.country_b)
  return { codes: [next.country_a, next.country_b], nameA: pA?.name, nameB: pB?.name, flagA: pA?.flag, flagB: pB?.flag }
}

// --- Dashboard Bar (diverging style showing difference clearly) ---
function DashboardRow({ metric, valA, valB, profileA, profileB }) {
  const [min, max] = metric.range
  const pctA = Math.max(0, Math.min(100, ((valA - min) / (max - min)) * 100))
  const pctB = Math.max(0, Math.min(100, ((valB - min) / (max - min)) * 100))
  const diff = Math.abs(valA - valB)
  const better = metric.higherBetter === true ? (valA > valB ? 'A' : 'B') : metric.higherBetter === false ? (valA < valB ? 'A' : 'B') : null

  return (
    <div className="py-3 border-b border-white/8">
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-xs font-body text-white/60">{metric.label}</p>
        <span className="text-[10px] font-data text-white/30">
          {better && (better === 'A' ? `${profileA.name} leads` : `${profileB.name} leads`)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Country A value */}
        <span className={`text-sm font-data w-16 text-right ${better === 'A' ? 'text-[#48BFE3] font-bold' : 'text-[#48BFE3]/70'}`}>
          {metric.format(valA)}
        </span>
        {/* Dual bars */}
        <div className="flex-1 relative h-5 flex gap-0.5">
          <div className="flex-1 flex justify-end">
            <motion.div className="h-full rounded-l bg-[#48BFE3]"
              initial={{ width: 0 }} animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex-1">
            <motion.div className="h-full rounded-r bg-[#E07A5F]"
              initial={{ width: 0 }} animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }} />
          </div>
        </div>
        {/* Country B value */}
        <span className={`text-sm font-data w-16 ${better === 'B' ? 'text-[#E07A5F] font-bold' : 'text-[#E07A5F]/70'}`}>
          {metric.format(valB)}
        </span>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function Outcomes({ pair, onComplete, onTryPair }) {
  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const connections = selectConnections(profileA, profileB)
  const suggestedNext = getSuggestedNextPair(pair)

  // Get dashboard metrics
  const dashMetrics = DASHBOARD_METRICS.map(m => {
    const valA = getOutcomeVal(profileA, m.key)
    const valB = getOutcomeVal(profileB, m.key)
    if (valA == null || valB == null) return null
    return { ...m, valA, valB }
  }).filter(Boolean)

  return (
    <div className="min-h-screen scroll-smooth" style={{ backgroundColor: '#1a2e3b' }}>
      {/* SECTION 1: Intro + Dashboard */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-[700px] w-full">
          <motion.p className="text-white/50 font-body text-base text-center mb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            These two countries time life completely differently.
          </motion.p>
          <motion.h2 className="font-display text-2xl md:text-[36px] text-white text-center mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            What timing changes
          </motion.h2>

          {/* Country face-off header */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <span className="text-3xl">{profileA.flag}</span>
              <p className="text-sm font-body text-[#48BFE3] mt-1">{profileA.name}</p>
            </div>
            <span className="text-white/30 font-display text-2xl">vs</span>
            <div className="text-center">
              <span className="text-3xl">{profileB.flag}</span>
              <p className="text-sm font-body text-[#E07A5F] mt-1">{profileB.name}</p>
            </div>
          </div>

          {/* Dashboard rows */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
            {dashMetrics.map((m, i) => (
              <DashboardRow key={m.key} metric={m} valA={m.valA} valB={m.valB} profileA={profileA} profileB={profileB} />
            ))}
          </motion.div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-[10px] font-data">
            <span className="text-[#48BFE3]">■ {profileA.flag} {profileA.name}</span>
            <span className="text-[#E07A5F]">■ {profileB.flag} {profileB.name}</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Connection narratives */}
      <section className="px-4 py-16">
        <div className="max-w-[650px] mx-auto">
          <p className="text-white/40 text-sm font-body text-center mb-16">
            But why? Scroll to see the connections.
          </p>

          {connections.map((conn, i) => {
            const narrative = fillTemplate(conn.template, profileA, profileB, conn)
            const mechColor = MECHANISM_COLORS[conn.group] || '#457B9D'
            return (
              <motion.div key={`${conn.milestone}-${conn.outcome}`} className="mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3, once: true }}
                transition={{ duration: 0.6 }}>
                <p className="font-display text-xl md:text-2xl text-white italic mb-4 leading-relaxed">
                  {conn.one_liner}
                </p>
                <p className="font-body text-base md:text-lg text-white/65 leading-relaxed mb-4">
                  {narrative}
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-data" style={{ color: mechColor, backgroundColor: mechColor + '15' }}>
                  {conn.group === 'causal' && 'Causal'}
                  {conn.group === 'common_cause' && 'Common cause'}
                  {conn.group === 'feedback' && 'Feedback loop'}
                </span>
              </motion.div>
            )
          })}

          {/* Transition */}
          <motion.div className="text-center mt-16 mb-8"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-white/60 font-body text-base mb-2">
              These patterns hold beyond just two countries. Across 44 nations, the same story repeats.
            </p>
            <p className="text-white/40 font-body text-sm mb-8">↓ See the evidence</p>
            <motion.button onClick={onComplete}
              className="px-8 py-3 rounded-full border border-white/20 font-body text-sm text-white cursor-pointer hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              See what all 12 countries reveal →
            </motion.button>
          </motion.div>

          {/* Try another pair */}
          {suggestedNext && onTryPair && (
            <div className="text-center mt-8">
              <p className="text-white/30 text-xs font-body mb-2">Or try another pair:</p>
              <button onClick={() => onTryPair(suggestedNext.codes)}
                className="text-xs text-white/40 hover:text-white/70 cursor-pointer font-body">
                {suggestedNext.flagA} {suggestedNext.nameA} & {suggestedNext.flagB} {suggestedNext.nameB}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
