export default function Footer() {
  return (
    <footer id="footer" className="py-12 px-4 md:px-8" style={{ backgroundColor: '#264653' }}>
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-white/70 text-sm font-body">
        <div>
          <p className="font-display text-base text-white/90 mb-1">Life Milestones</p>
          <p className="text-white/50 text-xs">How the World Grows Up</p>
          <p className="text-white/40 text-xs mt-2">VizCon 2026 Entry</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">Data Sources</p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-white/40">
            <span>OECD</span><span>Eurostat</span>
            <span>Our World in Data</span><span>World Bank</span>
            <span>WHO</span><span>World Happiness Report</span>
            <span>Human Fertility DB</span><span>UNESCO</span>
            <span>UNDP</span><span>WorldPopReview</span>
          </div>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">Built With</p>
          <p className="text-[10px] text-white/40">Claude + Kiro</p>
          <p className="text-[10px] text-white/40 mt-1">React, Tailwind, Framer Motion</p>
        </div>
      </div>
      <p className="text-center text-white/25 text-[10px] font-data mt-8">
        12 countries. 11 milestones. 28 data files. 8 publishers. 44-country validation.
      </p>
    </footer>
  )
}
