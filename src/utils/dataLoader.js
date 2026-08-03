/**
 * Data utility layer for Life Milestones visualization.
 * Loads and filters processed JSON data for the app.
 */

import countryProfiles from '../data/country_profiles.json'
import correlationsData from '../data/correlations.json'
import genderPairAnalysis from '../data/gender_pair_analysis.json'
import milestoneCorrelations from '../data/milestone_outcome_correlations.json'
import optimalPairs from '../data/optimal_pairs_v2.json'

// Milestone chronological order and colors
const MILESTONE_ORDER = [
  { key: 'menarche_age', label: 'Menarche', color: 'var(--color-menarche)' },
  { key: 'education_completion_age', label: 'Education Complete', color: 'var(--color-education)' },
  { key: 'leaving_home_age', label: 'Leaving Home', color: 'var(--color-leaving-home)' },
  { key: 'cohabitation_age', label: 'First Cohabitation', color: 'var(--color-cohabitation)' },
  { key: 'first_home_age', label: 'First Home', color: 'var(--color-first-home)' },
  { key: 'marriage_age', label: 'Marriage', color: 'var(--color-marriage)' },
  { key: 'first_birth_age', label: 'First Baby', color: 'var(--color-first-baby)' },
  { key: 'fertility_rate', label: 'Fertility Rate', color: 'var(--color-first-baby)' },
  { key: 'menopause_age', label: 'Menopause', color: 'var(--color-menopause)' },
  { key: 'retirement_age', label: 'Retirement', color: 'var(--color-retirement)' },
  { key: 'hale', label: 'Healthy Life Ends', color: 'var(--color-hale)' },
  { key: 'life_expectancy', label: 'Life Expectancy', color: 'var(--color-life-exp)' },
]

// Metrics with gender split data
const GENDERED_METRICS = new Set([
  'life_expectancy', 'hale', 'marriage_age', 'education_completion_age', 'years_poor_health',
])

// Index data
const profilesByCode = Object.fromEntries(countryProfiles.map(p => [p.country, p]))
const corrByCode = Object.fromEntries(correlationsData.map(r => [r.country, r]))

// Compute ranges for normalization
const ranges = {}
for (const milestone of MILESTONE_ORDER) {
  const values = correlationsData
    .map(r => r[milestone.key])
    .filter(v => v != null)
  if (values.length > 0) {
    ranges[milestone.key] = Math.max(...values) - Math.min(...values)
  }
}

/**
 * Get full country profile by ISO3 code.
 */
export function getCountryProfile(countryCode) {
  return profilesByCode[countryCode] || null
}

/**
 * Get milestones where BOTH countries have non-null values.
 * Returns array sorted in chronological order.
 */
export function getPairMilestones(codeA, codeB) {
  const corrA = corrByCode[codeA]
  const corrB = corrByCode[codeB]
  if (!corrA || !corrB) return []

  return MILESTONE_ORDER
    .filter(m => corrA[m.key] != null && corrB[m.key] != null)
    .map(m => {
      const valueA = corrA[m.key]
      const valueB = corrB[m.key]
      const gap = Math.abs(valueA - valueB)
      const normGap = ranges[m.key] ? gap / ranges[m.key] : 0
      return {
        milestone: m.key,
        label: m.label,
        valueA,
        valueB,
        gap: Math.round(gap * 10) / 10,
        normGap: Math.round(normGap * 1000) / 1000,
        color: m.color,
        hasGenderSplit: GENDERED_METRICS.has(m.key),
      }
    })
}

/**
 * Get top correlations relevant to a pair.
 * Filters to strong correlations where both countries have the milestone and outcome.
 */
export function getPairCorrelations(codeA, codeB) {
  const corrA = corrByCode[codeA]
  const corrB = corrByCode[codeB]
  if (!corrA || !corrB) return []

  return milestoneCorrelations
    .filter(c => c.strength === 'STRONG' && c.p_value < 0.05)
    .filter(c => {
      // Both countries must have data for both the milestone and outcome
      return corrA[c.milestone] != null && corrB[c.milestone] != null
          && corrA[c.outcome] != null && corrB[c.outcome] != null
    })
    .map(c => {
      const milestoneGap = Math.abs(corrA[c.milestone] - corrB[c.milestone])
      return { ...c, milestoneGap }
    })
    .sort((a, b) => b.milestoneGap - a.milestoneGap)
    .slice(0, 5)
}

/**
 * Get gender stories for a pair.
 */
export function getPairGenderStories(codeA, codeB) {
  if (!genderPairAnalysis?.pair_analysis) return []

  const pairResult = genderPairAnalysis.pair_analysis.find(p =>
    (p.country_a === codeA && p.country_b === codeB) ||
    (p.country_a === codeB && p.country_b === codeA)
  )
  if (!pairResult) return []

  return pairResult.metrics.sort((a, b) => b.gap_difference - a.gap_difference)
}

/**
 * Get the 6 suggested pairs with taglines.
 */
export function getSuggestedPairs() {
  if (!optimalPairs?.optimal_pairs_v2) return []
  return optimalPairs.optimal_pairs_v2.map(p => ({
    codeA: p.country_a,
    codeB: p.country_b,
    nameA: p.name_a,
    nameB: p.name_b,
    tagline: p.tagline,
    score: p.story_score,
    topStories: p.top5_stories,
  }))
}
