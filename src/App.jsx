import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Explore from './components/Explore'

function App() {
  return (
    <div className="bg-[#FAFAF8] text-[#264653]">
      <Navbar />
      <Hero />
      <Explore />
      <section id="compare" className="min-h-screen flex items-center justify-center">
        <p className="text-2xl opacity-40 font-body">Compare — coming next</p>
      </section>
      <section id="discoveries" className="min-h-screen flex items-center justify-center">
        <p className="text-2xl opacity-40 font-body">Discoveries — coming next</p>
      </section>
      <section id="quiz" className="min-h-screen flex items-center justify-center">
        <p className="text-2xl opacity-40 font-body">Quiz — coming next</p>
      </section>
      <footer id="footer" className="bg-[#264653] text-white p-16 text-center">
        <p className="font-display text-lg">Life Milestones: How the World Grows Up</p>
        <p className="font-body text-sm text-white/50 mt-2">VizCon 2026</p>
      </footer>
    </div>
  )
}

export default App
