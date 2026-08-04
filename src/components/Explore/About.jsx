export default function About() {
  return (
    <div className="max-w-[750px] mx-auto space-y-10">
      {/* About this project */}
      <section>
        <h3 className="font-display text-xl md:text-2xl text-text mb-3">About This Project</h3>
        <p className="font-body text-sm md:text-base text-text/70 leading-relaxed mb-3">
          Life Milestones: How the World Grows Up explores when people across 12 countries experience
          major life milestones, from puberty through retirement, and whether timing correlates
          with happiness, health, wealth, and gender equity.
        </p>
        <p className="font-body text-sm md:text-base text-text/70 leading-relaxed">
          Built for VizCon 2026: "How the world lives, thrives, and connects."
        </p>
      </section>

      {/* Data Sources */}
      <section>
        <h3 className="font-display text-xl md:text-2xl text-text mb-3">Data Sources</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-text/10">
                <th className="text-left py-2 pr-4 text-text/50 font-medium text-xs">Source</th>
                <th className="text-left py-2 pr-4 text-text/50 font-medium text-xs">What We Used</th>
                <th className="text-left py-2 text-text/50 font-medium text-xs">Link</th>
              </tr>
            </thead>
            <tbody className="text-text/70 text-xs md:text-sm">
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">OECD</td>
                <td className="py-2 pr-4">Pensions, Demographics</td>
                <td className="py-2"><a href="https://data-explorer.oecd.org" className="text-marriage hover:underline" target="_blank" rel="noopener">data-explorer.oecd.org</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">Eurostat</td>
                <td className="py-2 pr-4">Home-leaving age</td>
                <td className="py-2"><a href="https://ec.europa.eu/eurostat" className="text-marriage hover:underline" target="_blank" rel="noopener">ec.europa.eu/eurostat</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">Our World in Data</td>
                <td className="py-2 pr-4">Marriage, birth, fertility, education, GII</td>
                <td className="py-2"><a href="https://ourworldindata.org" className="text-marriage hover:underline" target="_blank" rel="noopener">ourworldindata.org</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">World Bank</td>
                <td className="py-2 pr-4">Life expectancy, GDP, LFPR, MMR</td>
                <td className="py-2"><a href="https://data.worldbank.org" className="text-marriage hover:underline" target="_blank" rel="noopener">data.worldbank.org</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">WHO</td>
                <td className="py-2 pr-4">HALE (Healthy Life Expectancy)</td>
                <td className="py-2"><a href="https://who.int/data/gho" className="text-marriage hover:underline" target="_blank" rel="noopener">who.int/data/gho</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">World Happiness Report</td>
                <td className="py-2 pr-4">Happiness scores</td>
                <td className="py-2"><a href="https://worldhappiness.report" className="text-marriage hover:underline" target="_blank" rel="noopener">worldhappiness.report</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">Human Fertility Database</td>
                <td className="py-2 pr-4">Age at first birth</td>
                <td className="py-2"><a href="https://humanfertility.org" className="text-marriage hover:underline" target="_blank" rel="noopener">humanfertility.org</a></td>
              </tr>
              <tr className="border-b border-text/5">
                <td className="py-2 pr-4 font-medium">WorldPopulationReview</td>
                <td className="py-2 pr-4">Menarche, menopause</td>
                <td className="py-2"><a href="https://worldpopulationreview.com" className="text-marriage hover:underline" target="_blank" rel="noopener">worldpopulationreview.com</a></td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">UNDP</td>
                <td className="py-2 pr-4">Gender Inequality Index</td>
                <td className="py-2"><a href="https://hdr.undp.org" className="text-marriage hover:underline" target="_blank" rel="noopener">hdr.undp.org</a></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-text/40 text-xs font-body mt-3">
          All data is publicly accessible. 23 raw datasets processed into 28 JSON files.
          ~3,500 records across 12 countries, plus a 44-country global dataset for pattern validation.
        </p>
      </section>

    </div>
  )
}
