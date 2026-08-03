/**
 * Pair logic utilities: select milestones, correlations, and gender stories for a pair.
 */

import { getPairMilestones, getPairCorrelations, getPairGenderStories } from './dataLoader'

/**
 * Get full pair analysis bundle for rendering.
 */
export function getPairBundle(codeA, codeB) {
  const milestones = getPairMilestones(codeA, codeB)
  const correlations = getPairCorrelations(codeA, codeB)
  const genderStories = getPairGenderStories(codeA, codeB)

  // Top contrast (largest normalized gap)
  const topContrast = [...milestones].sort((a, b) => b.normGap - a.normGap).slice(0, 3)

  return {
    milestones,
    correlations,
    genderStories,
    topContrast,
    sharedCount: milestones.length,
    hasGenderData: genderStories.length > 0,
  }
}
