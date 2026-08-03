import { useState } from 'react'

function App() {
  const [selectedPair, setSelectedPair] = useState(null)
  const [currentAct, setCurrentAct] = useState('hook') // hook | journey | reveals | explore

  return (
    <div className="bg-bg text-text min-h-screen font-body">
      {currentAct === 'hook' && <div className="flex items-center justify-center h-screen"><p className="font-display text-3xl">Life Milestones: How the World Grows Up</p></div>}
      {currentAct === 'journey' && <div>Journey for {selectedPair?.join(' vs ')}</div>}
      {currentAct === 'reveals' && <div>Reveals placeholder</div>}
      {currentAct === 'explore' && <div>Explore placeholder</div>}
    </div>
  )
}

export default App
