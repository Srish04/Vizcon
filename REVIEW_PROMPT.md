# Deep Review Prompt for Life Markers Dashboard

## Context

This is an interactive data visualization dashboard built for **VizCon 2026**, a data visualization competition. The theme is "How the World Grows Up." It's built with React + Vite + Tailwind CSS + Framer Motion + D3.

## What This Dashboard Does

We track **11 "life markers"** (ages and rates that define a generation) across **12 countries** and correlate them with **9 outcome metrics** to tell a story about how culture shapes the timing of life events, and how that timing correlates with national wealth, health, equality, and happiness.

### Life Markers (inputs):
Puberty (menarche age), Education completion age, Leaving home age, Cohabitation age, First home purchase age, Marriage age (female), First child age, Menopause age, Retirement age, Fertility rate, HALE (healthy life expectancy)

### Outcome Metrics:
GDP per capita, Happiness score, Life expectancy, Female LFPR, Gender Inequality Index, Adolescent fertility, Maternal mortality, Years in poor health, Contraceptive prevalence

### Countries (chosen for cultural/economic diversity):
Sweden, Denmark (Nordic), Italy, France, Germany (Western Europe), Australia (Oceania), Japan, South Korea (East Asia), USA, Brazil, Mexico (Americas), India (South Asia)

## How the Data Works

- `src/data/correlations.json` — flat table with all metric values per country
- `src/data/country_profiles.json` — structured profiles with milestones, outcomes, gender splits, pair narratives
- `src/data/correlation_narratives.json` — pre-computed correlation analysis with mechanism explanations
- `src/data/quiz.json` — quiz questions and answers
- Timeline data (education.json, fertility_rate.json, first_marriage.json, retirement.json) — historical year-by-year values for the Timeline view
- Other data files (surprise_metrics.json, optimal_pairs_v2.json, etc.) — pre-computed analysis

The app DOES NOT fetch any data at runtime. Everything is bundled as static JSON imports.

## The Story We Want to Tell

The central narrative: **"The age women marry is the single strongest predictor of a country's wealth, equality, and health. Later marriage correlates with higher GDP (r=0.78), lower gender inequality (r=-0.90), fewer teen pregnancies (r=-0.85), and fewer maternal deaths (r=-0.82). This isn't about marriage itself. It's about what delayed marriage represents: education, economic independence, and freedom of choice."**

Supporting stories:
1. The "life sequence" everyone assumes (education → leave home → marriage → baby → retirement) is broken in most countries
2. Women live longer than men everywhere, but men spend a higher % of life healthy (the health paradox)
3. South Korea's fertility collapse from 6.0 to 0.72 in one generation
4. The USA is the richest country but the sickest
5. France chose leisure, America chose labor (retirement gap)
6. Japan is healthiest but not happiest

## Dashboard Structure (in order)

1. **Hero** (scroll-driven animation, 6 phases):
   - Phase 1: Title + hook ("Have you ever wondered how culture shapes when people leave home, marry, or have children...")
   - Phase 2: Life markers appearing one by one on a timeline
   - Phase 3: Click-based sequence game ("The Sequence Is Broken" — user clicks markers in order they think is correct, gets reveal)
   - Phase 4: Dot chart showing when each marker actually happens per country
   - Phase 5: Animated "race" between countries
   - Phase 6: Rotating facts + scroll cue

2. **Explore the Data** (4 interactive views):
   - Scatter: Pick a marker (X) and outcome (Y), see correlation
   - Rankings: Bar chart ranking all countries on any metric
   - Radar: Compare 2-3 countries across 8 normalized metrics
   - Timeline: Historical trends for education, marriage, fertility, retirement

3. **Compare Countries** (pair comparison journey):
   - Pick any two countries
   - See marker timeline (ages on a track), outcome flip cards, correlation connections, key insights with expandable data visualizations

4. **Discoveries**:
   - "The Health Paradox" (women live longer but men spend higher % healthy)
   - "The Age Women Marry" (interactive guessing game + scatter proof)
   - "More Findings" (6 horizontal-scroll cards with expandable visualizations)

5. **Quiz** (7 questions testing intuition about life markers)

6. **Footer**

## Your Task: Deep Review

Please do the following:

### 1. First-Time User Experience
Open the app (`npm run dev`) and experience it as a first-time user. As you scroll/click through:
- Can you understand what the dashboard is about within the first 10 seconds?
- Is the hook compelling? Does it make you want to explore more?
- Is the scroll-driven hero section too long, too fast, or well-paced?
- Does the story build logically from section to section?

### 2. Story Coherence
- Is the narrative arc clear? (Setup → Exploration → Discovery → Insight → Conclusion)
- Are the section transitions smooth? Does each section feel like it belongs?
- Is the "winner marker" (marriage age) reveal impactful?
- Do the discoveries feel genuinely surprising?

### 3. Data Accuracy Audit
- Check every claim against the data in `src/data/correlations.json` and `src/data/country_profiles.json`
- Verify the r-values and R-squared values mentioned
- Check that quiz answers match the actual data
- Verify the Rankings average line positions correctly
- Check that the Health Paradox percentages compute correctly from HALE and life expectancy data
- Verify Korea fertility timeline data points
- Check all findings card data values

### 4. Broken Experiences
- Test all interactive elements (click games, flip cards, expand buttons, country selectors)
- Check if any views show empty states or errors for certain metric combinations
- Test the radar view with different country selections
- Test the quiz (all 7 questions) — do correct answers register correctly?
- Check if the Hero phases transition smoothly
- Test responsive behavior (resize browser)

### 5. Text & Framing Review
- Is any text too academic/statistical for a general audience?
- Are there confusing abbreviations (LFPR, GII, HALE) without definitions?
- Is the tone consistent throughout?
- Are there any text contrast/readability issues?
- Does the cultural context feel accurate and respectful?

### 6. Recommendations
Provide specific, actionable recommendations for:
- **Order**: Should any sections be reordered for better narrative flow?
- **Hooks**: How to make section headers more compelling?
- **Engagement**: Where do users likely drop off? How to keep them?
- **Clarity**: What needs simplification?
- **Impact**: How to make the key insight (marriage age predicts everything) hit harder?
- **Missing**: What's missing that would strengthen the story?

### 7. Visual/UX Issues
- Color contrast problems
- Text overflow or truncation
- Inconsistent spacing
- Charts that are hard to read
- Interactive elements that aren't obviously interactive

## How to Run

```bash
cd life-milestones
npm install  # if needed
npm run dev  # starts on localhost:5173
```

Build check: `npm run build`

## Important Notes
- All data is from published sources: WHO, World Bank, OECD, CIA World Factbook, Eurostat, DHS/NFHS surveys
- N=12 countries. All correlations are suggestive, not conclusive. This should be clear throughout.
- The dashboard does NOT mention "policy" as a driver. We frame it as culture, economics, and access.
- We use "life markers" (not "milestones") because the metrics include rates and spans, not just point-in-time ages.
- No em dashes or "--" in any text. We use periods for clause separation.
