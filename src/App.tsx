import { useEffect, useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExposureLadder } from './components/ladder/ExposureLadder';
import { ActiveSession } from './components/session/ActiveSession';
import { VictoryLog } from './components/log/VictoryLog';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { Onboarding } from './components/onboarding/Onboarding';
import type { Exposure } from './db';
import { getOnboardingStatus } from './db';

type View = 'dashboard' | 'ladder' | 'session' | 'log' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedExposure, setSelectedExposure] = useState<Exposure | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = await getOnboardingStatus();
      setShowOnboarding(!hasCompletedOnboarding);
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleSelectExposure = (exposure: Exposure) => {
    setSelectedExposure(exposure);
    setCurrentView('session');
  };

  const handleSessionComplete = () => {
    setSelectedExposure(null);
    setCurrentView('dashboard');
  };

  const handleSessionCancel = () => {
    setSelectedExposure(null);
    setCurrentView('dashboard');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-(--anchor-bg) flex items-center justify-center">
        <div className="animate-pulse text-(--anchor-text-muted) text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--anchor-bg)] text-[var(--anchor-text)] relative overflow-x-hidden selection:bg-[var(--anchor-primary)] selection:text-white">
      {/* Background Ambience - "Sanctuary" Feel */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Main Primary Blob */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[var(--anchor-primary-muted)]/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-[10000ms]" />

        {/* Secondary Warm Blob */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--anchor-secondary)]/15 rounded-full blur-[150px] mix-blend-multiply" />

        {/* Tiny accent orb */}
        <div className="absolute top-[20%] right-[15%] w-[10rem] h-[10rem] bg-[var(--anchor-accent)]/20 rounded-full blur-[60px]" />

        {/* Noise Overlay for texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 lg:p-20 animate-enter min-h-screen flex flex-col">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            onStartSession={() => handleNavigate('ladder')}
          />
        )}

        {currentView === 'ladder' && (
          <ExposureLadder
            onBack={() => handleNavigate('dashboard')}
            onSelectExposure={handleSelectExposure}
          />
        )}

        {currentView === 'session' && selectedExposure && (
          <ActiveSession
            exposure={selectedExposure}
            onComplete={handleSessionComplete}
            onCancel={handleSessionCancel}
          />
        )}

        {currentView === 'log' && (
          <VictoryLog onBack={() => handleNavigate('dashboard')} />
        )}

        {currentView === 'analytics' && (
          <AnalyticsDashboard onBack={() => handleNavigate('dashboard')} />
        )}
      </main>

      {/* Onboarding Overlay */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </div>
  );
}

export default App;
