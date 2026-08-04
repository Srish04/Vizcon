import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Explore from './components/Explore/CorrelationExplorer'
import PairComparison from './components/PairComparison'
import Discoveries from './components/Reveals/Reveals'
import Quiz from './components/Explore/Quiz'
import Footer from './components/Footer'

function App() {
  return (
    <div className="bg-bg text-text font-body">
      <Navbar />
      <Hero />
      <section id="explore" className="py-16 px-4 md:px-8">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-display text-2xl md:text-[32px] text-text mb-2">Explore the Data</h2>
          <p className="font-body text-sm text-text-secondary mb-8">Pick any two metrics. See what connects.</p>
          <Explore />
        </div>
      </section>
      <PairComparison />
      <section id="discoveries">
        <Discoveries onComplete={() => {}} onPickPair={() => {}} selectedPair={null} />
      </section>
      <section id="quiz" className="py-16 px-4 md:px-8 bg-[#F0E6D3]">
        <div className="max-w-[600px] mx-auto">
          <h2 className="font-display text-2xl md:text-[32px] text-text mb-2 text-center">Test Your Intuition</h2>
          <p className="font-body text-sm text-text-secondary mb-8 text-center">8 questions. Most people get half wrong.</p>
          <Quiz />
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default App
