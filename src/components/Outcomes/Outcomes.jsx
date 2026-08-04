import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import countryProfiles from '../../data/country_profiles.json'
import correlationData from '../../data/correlation_narratives.json'
import pairStoryData from '../../data/pair_story_analysis.json'

const MILESTONE_META = {
  marriage_age: { label: 'Marriage Age', unit: 'years old', color: '#E76F51', range: [18, 40] },
  education_completion_age: { label: 'Education Completion', unit: 'years old', color: '#2D6A4F', range: [14, 30] },
  menarche_age: { label: 'Puberty (Menarche)', unit: 'years old', color: '#C2185B', range: [10, 18] },
  menopause_age: { label: 'Menopause', unit: 'years old', color: '#AB47BC', range: [44, 55] },
  first_birth_age: { label: 'Age at First Child', unit: 'years old', color: '#E9C46A', range: [18, 38] },
  cohabitation_age: { label: 'First Partnership', unit: 'years old', color: '#00897B', range: [18, 35] },
  first_home_age: { label: 'First Home', unit: 'years old', color: '#48BFE3', range: [20, 42] },
  retirement_age: { label: 'Retirement Age', unit: 'years old', color: '#457B9D', range: [55, 75] },
  hale: { label: 'Healthy Life Expectancy', unit: 'years', color: '#7B2D8E', range: [55, 80] },
  fertility_rate: { label: 'Fertility Rate', unit: 'children', color: '#E9C46A', range: [0.5, 4] },
}

const OUTCOME_META = {
  gender_inequality_index: { label: 'Gender Inequality Index', unit: '', range: [0, 0.6] },
  maternal_mortality: { label: 'Maternal Mortality', unit: 'per 100k', range: [0, 150] },
  life_expectancy: { label: 'Life Expectancy', unit: 'years', range: [60, 90] },
  hale: { label: 'Healthy Life Years', unit: 'years', range: [55, 80] },
  gdp_per_capita: { label: 'GDP per Capita', unit: '$', range: [0, 70000] },
  happiness: { label: 'Happiness Score', unit: '/10', range: [3, 8] },
  female_lfpr: { label: 'Female Labor Force', unit: '%', range: [20, 90] },
  adolescent_fertility: { label: 'Teen Pregnancies', unit: 'per 1000', range: [0, 80] },
  fertility_rate: { label: 'Fertility Rate', unit: 'children', range: [0.5, 4] },
}

const MECHANISM_LABELS = {
  causal: { emoji: '🔗', text: 'This timing directly shapes this outcome.' },
  common_cause: { emoji: '🌐', text: "These aren't directly connected. Both are shaped by deeper forces: wealth, policy, infrastructure." },
  feedback: { emoji: '🔄', text: 'These reinforce each other. Later marriage creates more opportunity, and more opportunity allows later marriage.' },
}

function getProfile(code) {
  return countryProfiles.find(c => c.country === code)
}

// Map correlation_narratives milestone keys to country_profiles.milestones keys
const MILESTONE_KEY_MAP = {
  marriage_age: 'marriage',
  education_completion_age: 'education',
  menarche_age: 'menarche',
  menopause_age: 'menopause',
  first_birth_age: 'first_baby',
  cohabitation_age: 'cohabitation',
  first_home_age: 'first_home',
  retirement_age: 'retirement_age',
  hale: 'hale',
  fertility_rate: 'fertility_rate',
}

function getMilestoneVal(profile, milestoneKey) {
  const pKey = MILESTONE_KEY_MAP[milestoneKey] || milestoneKey
  const ms = profile.milestones?.[pKey]
  if (ms && ms.value !== null && ms.value !== undefined) return ms.value
  const oc = profile.outcomes?.[pKey]
  if (oc && oc.value !== null && oc.value !== undefined) return oc.value
  return null
}

function getOutcomeVal(profile, outcomeKey) {
  const oc = profile.outcomes?.[outcomeKey]
  if (oc && oc.value !== null && oc.value !== undefined) return oc.value
  // Some outcomes live in milestones
  const ms = profile.milestones?.[outcomeKey]
  if (ms && ms.value !== null && ms.value !== undefined) return ms.value
  return null
}

function selectConnections(profileA, profileB) {
  console.log(`\n=== Loading correlations for ${profileA.name} vs ${profileB.name} ===`)
  console.log(`Total correlations in file: ${correlationData.correlations.length}`)

  const corrs = correlationData.correlations.filter(c =>
    c.group !== 'artifact' && c.confidence !== 'low'
  )
  console.log(`After filtering (non-artifact, non-low): ${corrs.length}`)

  // For each correlation, check data availability and compute milestone gap
  const usable = corrs
    .map(c => {
      const mA = getMilestoneVal(profileA, c.milestone)
      const mB = getMilestoneVal(profileB, c.milestone)
      const oA = getOutcomeVal(profileA, c.outcome)
      const oB = getOutcomeVal(profileB, c.outcome)
      if (mA === null || mB === null || oA === null || oB === null) return null
      const gap = Math.abs(mA - mB)
      const score = gap * Math.abs(c.r)
      return { ...c, mA, mB, oA, oB, gap, score }
    })
    .filter(Boolean)

  console.log(`Usable (both countries have data): ${usable.length}`)

  // Group by milestone, pick best correlation (highest score = gap * |r|) per milestone
  const byMilestone = {}
  for (const c of usable) {
    if (!byMilestone[c.milestone] || c.score > byMilestone[c.milestone].score) {
      byMilestone[c.milestone] = c
    }
  }

  console.log(`Unique milestones with connections: ${Object.keys(byMilestone).length}`)

  // Rank milestones by score (gap * |r|), take top 4
  const ranked = Object.values(byMilestone).sort((a, b) => b.score - a.score)
  const selected = ranked.slice(0, 4)

  console.log('Selected connections:')
  selected.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.milestone} -> ${c.outcome} (gap: ${c.gap.toFixed(1)}, r: ${c.r}, score: ${c.score.toFixed(1)})`)
    console.log(`     ${profileA.name}: milestone=${c.mA}, outcome=${c.oA}`)
    console.log(`     ${profileB.name}: milestone=${c.mB}, outcome=${c.oB}`)
    console.log(`     "${c.one_liner}"`)
  })

  return selected
}

function fillTemplate(template, profileA, profileB, conn) {
  // Determine high/low based on milestone value
  const highIsA = conn.mA >= conn.mB
  const high = highIsA ? profileA : profileB
  const low = highIsA ? profileB : profileA
  const highVal = highIsA ? conn.mA : conn.mB
  const lowVal = highIsA ? conn.mB : conn.mA
  const highOutcome = highIsA ? conn.oA : conn.oB
  const lowOutcome = highIsA ? conn.oB : conn.oA
  const gap = Math.abs(conn.mA - conn.mB).toFixed(1)

  let text = template
    .replace(/{high_country}/g, high.name)
    .replace(/{low_country}/g, low.name)
    .replace(/{high_val}/g, highVal)
    .replace(/{low_val}/g, lowVal)
    .replace(/{high_outcome}/g, highOutcome)
    .replace(/{low_outcome}/g, lowOutcome)
    .replace(/{gap}/g, gap)

  return text
}

function getSuggestedNextPair(currentPair) {
  const rankings = pairStoryData.pair_story_rankings || []
  const [cA, cB] = currentPair
  const next = rankings.find(p =>
    p.country_a !== cA && p.country_a !== cB &&
    p.country_b !== cA && p.country_b !== cB
  )
  if (!next) return null
  const pA = getProfile(next.country_a)
  const pB = getProfile(next.country_b)
  return {
    codes: [next.country_a, next.country_b],
    nameA: pA?.name || next.name_a,
    nameB: pB?.name || next.name_b,
    flagA: pA?.flag || '',
    flagB: pB?.flag || '',
    tagline: next.top5_stories?.[0]
      ? `${Math.abs(next.top5_stories[0].abs_gap).toFixed(0)}-point gap on ${next.top5_stories[0].metric.replace(/_/g, ' ')}`
      : 'A compelling comparison',
  }
}

// --- Connection Section ---
function ConnectionSection({ conn, profileA, profileB, index, total }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.2, once: true })

  const milestoneInfo = MILESTONE_META[conn.milestone] || { label: conn.milestone, color: '#666', range: [0, 100] }
  const outcomeInfo = OUTCOME_META[conn.outcome] || { label: conn.outcome, range: [0, 100] }
  const mechanism = MECHANISM_LABELS[conn.group] || MECHANISM_LABELS.common_cause
  const narrative = fillTemplate(conn.template, profileA, profileB, conn)

  const mRange = milestoneInfo.range
  const oRange = outcomeInfo.range
  const mPctA = ((conn.mA - mRange[0]) / (mRange[1] - mRange[0])) * 100
  const mPctB = ((conn.mB - mRange[0]) / (mRange[1] - mRange[0])) * 100
  const oPctA = ((conn.oA - oRange[0]) / (oRange[1] - oRange[0])) * 100
  const oPctB = ((conn.oB - oRange[0]) / (oRange[1] - oRange[0])) * 100

  return (
    <section
      ref={ref}
      className="min-h-screen snap-start flex flex-col items-center justify-center px-4 md:px-8 py-12"
    >
      <div className="w-full max-w-[900px]">
        {/* Eyebrow */}
        <motion.p
          className="text-xs font-data text-white/40 text-center mb-3 uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          Connection {index + 1} of {total}
        </motion.p>

        {/* One-liner headline */}
        <motion.h2
          className="font-display text-xl md:text-3xl text-center mb-8"
          style={{ color: milestoneInfo.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {conn.one_liner}
        </motion.h2>

        {/* Visualization: Milestone → Outcome */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8">
          {/* Left: Milestone */}
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-xs font-data text-white/50 mb-2 text-center">{milestoneInfo.label}</p>
            <MiniBar
              flag={profileA.flag}
              name={profileA.name}
              value={conn.mA}
              pct={Math.min(Math.max(mPctA, 3), 100)}
              color={milestoneInfo.color}
              isInView={isInView}
              delay={0.4}
            />
            <MiniBar
              flag={profileB.flag}
              name={profileB.name}
              value={conn.mB}
              pct={Math.min(Math.max(mPctB, 3), 100)}
              color={milestoneInfo.color}
              opacity={0.6}
              isInView={isInView}
              delay={0.5}
            />
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="flex-shrink-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <svg className="w-12 h-8 md:w-16 md:h-10" viewBox="0 0 64 40" fill="none">
              <path
                d="M4 20 H52 M44 12 L54 20 L44 28"
                stroke={milestoneInfo.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>

          {/* Right: Outcome */}
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-xs font-data text-white/50 mb-2 text-center">{outcomeInfo.label}</p>
            <MiniBar
              flag={profileA.flag}
              name={profileA.name}
              value={conn.oA}
              pct={Math.min(Math.max(oPctA, 3), 100)}
              color={milestoneInfo.color}
              isInView={isInView}
              delay={0.9}
            />
            <MiniBar
              flag={profileB.flag}
              name={profileB.name}
              value={conn.oB}
              pct={Math.min(Math.max(oPctB, 3), 100)}
              color={milestoneInfo.color}
              opacity={0.6}
              isInView={isInView}
              delay={1.0}
            />
          </motion.div>
        </div>

        {/* Narrative */}
        <motion.p
          className="text-white/70 font-body text-sm md:text-base text-center leading-relaxed max-w-[700px] mx-auto mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          {narrative}
        </motion.p>

        {/* Mechanism tag */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.3 }}
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-data bg-white/8 text-white/50">
            {mechanism.emoji} {mechanism.text}
          </span>
        </motion.div>
      </div>
    </section>
  )
}

// --- Mini Bar (reusable) ---
function MiniBar({ flag, name, value, pct, color, opacity = 1, isInView, delay }) {
  const displayVal = typeof value === 'number'
    ? (value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : value % 1 === 0 ? value : value.toFixed(1))
    : value

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-body text-white/60 w-16 md:w-20 text-right truncate">
        {flag} {name}
      </span>
      <div className="flex-1 relative h-5 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color, opacity }}
          initial={{ width: '0%' }}
          animate={isInView ? { width: `${pct}%` } : { width: '0%' }}
          transition={{ delay, duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <motion.span
        className="text-xs font-data text-white/70 w-12 md:w-14"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.4, duration: 0.3 }}
      >
        {displayVal}
      </motion.span>
    </div>
  )
}

// --- Main Component ---
export default function Outcomes({ pair, onComplete, onTryPair }) {
  const profileA = getProfile(pair[0])
  const profileB = getProfile(pair[1])
  const connections = selectConnections(profileA, profileB)
  const suggestedNext = getSuggestedNextPair(pair)

  console.log('[Outcomes] Rendering with', connections.length, 'connections for', pair[0], 'vs', pair[1])

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth" style={{ backgroundColor: '#1a2e3b' }}>
      {/* Intro */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl md:text-[40px] text-white mb-3">
            Does timing matter?
          </h2>
          <p className="text-white/60 font-body text-base md:text-lg max-w-[500px] mx-auto mb-4">
            These two countries time life completely differently. So here's the real question: does it matter?
          </p>
          <p className="text-white/40 font-body text-sm mb-8">
            {connections.length} connections found. Scroll to explore.
          </p>
          <motion.div
            className="text-white/30"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Connection sections */}
      {connections.map((conn, i) => (
        <ConnectionSection
          key={`${conn.milestone}-${conn.outcome}-${i}`}
          conn={conn}
          profileA={profileA}
          profileB={profileB}
          index={i}
          total={connections.length}
        />
      ))}

      {/* Outro / What's next */}
      <section className="min-h-screen snap-start flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center max-w-[600px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ amount: 0.5, once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-2xl md:text-3xl text-white mb-3">
            You followed {profileA.flag} {profileA.name} & {profileB.flag} {profileB.name} through life.
          </h2>
          <p className="text-white/60 font-body text-base mb-8">
            But there are 66 possible pairs in this data, and each one tells a different story.
          </p>

          {/* Suggested next pair */}
          {suggestedNext && onTryPair && (
            <div className="mb-8">
              <p className="text-text/50 text-sm font-body mb-3">Try another pair:</p>
              <motion.button
                onClick={() => onTryPair(suggestedNext.codes)}
                className="px-5 py-3 rounded-xl border border-text/10 bg-white/60 hover:bg-white hover:shadow-md transition-all cursor-pointer text-left w-full max-w-[400px] mx-auto block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-body font-medium text-sm text-text">
                  {suggestedNext.flagA} {suggestedNext.nameA} & {suggestedNext.flagB} {suggestedNext.nameB}
                </span>
                <p className="text-xs text-text/50 italic mt-1">{suggestedNext.tagline}</p>
              </motion.button>
            </div>
          )}

          {/* Continue to reveals */}
          <motion.button
            onClick={onComplete}
            className="px-6 py-3 rounded-xl border border-text/20 font-body text-sm text-text hover:bg-white hover:shadow-md transition-all cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See what all 12 countries reveal →
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}
