import { useState } from 'react'
import HomePage from './components/HomePage/HomePage'
import MilestoneWalk from './components/MilestoneWalk/MilestoneWalk'
import FullPicture from './components/FullPicture/FullPicture'
import Outcomes from './components/Outcomes/Outcomes'
import Reveals from './components/Reveals/Reveals'
import Explore from './components/Explore/Explore'
import Navbar from './components/shared/Navbar'

function App() {
  const [selectedPair, setSelectedPair] = useState(null)
  const [currentAct, setCurrentAct] = useState('home')
  const [exploreTab, setExploreTab] = useState('explore')

  function handlePairSelected(pair) {
    setSelectedPair(pair)
    setCurrentAct('journey')
    window.scrollTo(0, 0)
  }

  function handleJourneyComplete() { setCurrentAct('fullpicture') }
  function handleFullPictureComplete() { setCurrentAct('outcomes') }
  function handleOutcomesComplete() { setCurrentAct('reveals') }

  function handleRevealsComplete(target) {
    if (target === 'quiz') {
      setExploreTab('quiz')
      setCurrentAct('explore')
    } else {
      setExploreTab('explore')
      setCurrentAct('explore')
    }
  }

  function handleTryPair(pair) {
    setSelectedPair(pair)
    setCurrentAct('journey')
    window.scrollTo(0, 0)
  }

  function handleBackToHome() {
    setCurrentAct('home')
    window.scrollTo(0, 0)
  }

  function handleNavigate(target) {
    if (target === 'home' || target === 'hook-picker') {
      setCurrentAct('home')
      window.scrollTo(0, 0)
    } else if (target === 'journey') {
      if (selectedPair) setCurrentAct('journey')
    } else if (target === 'reveals') {
      setCurrentAct('reveals')
    } else if (target === 'explore') {
      setExploreTab('explore')
      setCurrentAct('explore')
    } else if (target === 'quiz') {
      setExploreTab('quiz')
      setCurrentAct('explore')
    } else if (target === 'about') {
      setExploreTab('about')
      setCurrentAct('explore')
    }
    window.scrollTo(0, 0)
  }

  // Show navbar on all acts except during initial home page load? No, show on ALL acts.
  const showNavbar = true

  return (
    <div className="bg-bg text-text min-h-screen font-body">
      {showNavbar && (
        <Navbar
          currentAct={currentAct}
          hasPair={selectedPair != null}
          onNavigate={handleNavigate}
        />
      )}

      <div className="pt-12">
        {currentAct === 'home' && (
          <HomePage
            onPairSelected={handlePairSelected}
            onNavigate={handleNavigate}
          />
        )}

        {currentAct === 'journey' && selectedPair && (
          <MilestoneWalk pair={selectedPair} onComplete={handleJourneyComplete} />
        )}

        {currentAct === 'fullpicture' && selectedPair && (
          <FullPicture pair={selectedPair} onComplete={handleFullPictureComplete} />
        )}

        {currentAct === 'outcomes' && selectedPair && (
          <Outcomes
            pair={selectedPair}
            onComplete={handleOutcomesComplete}
            onTryPair={handleTryPair}
          />
        )}

        {currentAct === 'reveals' && (
          <Reveals
            onComplete={handleRevealsComplete}
            onPickPair={handleBackToHome}
            selectedPair={selectedPair}
          />
        )}

        {currentAct === 'explore' && (
          <Explore
            defaultTab={exploreTab}
            onRestart={handleBackToHome}
          />
        )}
      </div>
    </div>
  )
}

export default App
