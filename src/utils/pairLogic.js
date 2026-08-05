/**
 * Pair logic utilities: select markers, correlations, and gender stories for a pair.
 */

import { getPairMarkers, getPairCorrelations, getPairGenderStories } from './dataLoader'

/**
 * Get full pair analysis bundle for rendering.
 */
export function getPairBundle(codeA, codeB) {
  const markers = getPairMarkers(codeA, codeB)
  const correlations = getPairCorrelations(codeA, codeB)
  const genderStories = getPairGenderStories(codeA, codeB)

  // Top contrast (largest normalized gap)
  const topContrast = [...markers].sort((a, b) => b.normGap - a.normGap).slice(0, 3)

  return {
    markers,
    correlations,
    genderStories,
    topContrast,
    sharedCount: markers.length,
    hasGenderData: genderStories.length > 0,
  }
}
