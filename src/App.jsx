import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Explore from './components/Explore'
import PairComparison from './components/PairComparison'
import Discoveries from './components/Discoveries'
import Quiz from './components/Quiz'
import SectionDivider from './components/SectionDivider'

function App() {
  return (
    <div className="bg-[#FAFAF8] text-[#264653]">
      <Navbar />
      <Hero />
      <Explore />
      <SectionDivider from="#ffffff" to="#f1f5f9" />
      <PairComparison />
      <SectionDivider from="#f1f5f9" to="#ffffff" />
      <Discoveries />
      <SectionDivider from="#ffffff" to="#fef3c7" />
      <Quiz />
      <footer id="footer" className="bg-[#264653] text-white py-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="font-display text-lg mb-3">Life Milestones</h3>
              <p className="font-body text-sm text-white/60 leading-relaxed">
                How the world grows up. An interactive exploration of life milestones across 12 countries, revealing the patterns hidden in demographic data.
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg mb-3">Data Sources</h3>
              <ul className="font-body text-sm text-white/60 space-y-1">
                <li>OECD Family Database</li>
                <li>World Bank Gender Statistics</li>
                <li>Our World in Data</li>
                <li>Eurostat (yth_demo_030)</li>
                <li>WHO Global Health Observatory</li>
                <li>World Happiness Report 2024</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-3">About</h3>
              <p className="font-body text-sm text-white/60 leading-relaxed">
                Built for VizCon 2026. All correlations are computed across 12 countries and should be interpreted as suggestive patterns, not causal claims.
              </p>
              <p className="font-body text-sm text-white/40 mt-3">
                React + D3 + Tailwind CSS
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="font-display text-base">Life Milestones: How the World Grows Up</p>
            <p className="font-body text-xs text-white/40 mt-2">VizCon 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
