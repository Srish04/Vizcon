/**
 * Narrative template filling for dynamic text.
 */

/**
 * Fill a narrative template with actual country data.
 */
export function fillNarrative(template, context) {
  let text = template
  for (const [key, value] of Object.entries(context)) {
    text = text.replaceAll(`{${key}}`, value)
  }
  return text
}

/**
 * Generate a one-line contrast sentence for a marker.
 */
export function markerContrast(milestone, nameA, valueA, nameB, valueB) {
  const gap = Math.abs(valueA - valueB).toFixed(1)
  const higher = valueA > valueB ? nameA : nameB
  const lower = valueA > valueB ? nameB : nameA
  const highVal = Math.max(valueA, valueB).toFixed(1)
  const lowVal = Math.min(valueA, valueB).toFixed(1)

  const templates = {
    marriage_age: `Women in ${higher} marry at ${highVal}, while in ${lower} it's ${lowVal} -- a ${gap}-year gap.`,
    life_expectancy: `People in ${higher} live to ${highVal}, versus ${lowVal} in ${lower}.`,
    retirement_age: `Workers in ${higher} exit the labour market at ${highVal}, while ${lower} exits at ${lowVal}.`,
    hale: `Healthy life in ${higher} lasts until ${highVal}, but only ${lowVal} in ${lower}.`,
    education_completion_age: `Education ends at ${highVal} in ${higher}, versus ${lowVal} in ${lower}.`,
    first_birth_age: `First babies arrive at ${highVal} in ${higher}, but ${lowVal} in ${lower}.`,
    fertility_rate: `${lower} has ${lowVal} children per woman, while ${higher} has ${highVal}.`,
    leaving_home_age: `Young people leave home at ${highVal} in ${higher}, but ${lowVal} in ${lower}.`,
    cohabitation_age: `Couples move in together at ${highVal} in ${higher}, versus ${lowVal} in ${lower}.`,
    first_home_age: `First home purchase happens at ${highVal} in ${higher}, but ${lowVal} in ${lower}.`,
    menopause_age: `Menopause occurs at ${highVal} in ${higher}, versus ${lowVal} in ${lower}.`,
    menarche_age: `Puberty begins at ${highVal} in ${higher}, compared to ${lowVal} in ${lower}.`,
  }

  return templates[milestone] || `${milestone}: ${higher} at ${highVal} vs ${lower} at ${lowVal} (gap: ${gap}).`
}
