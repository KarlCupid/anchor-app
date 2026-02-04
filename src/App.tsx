import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExposureLadder } from './components/ladder/ExposureLadder';
import { ActiveSession } from './components/session/ActiveSession';
import { VictoryLog } from './components/log/VictoryLog';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { Onboarding } from './components/onboarding/Onboarding';
import { ReassuranceBank } from './components/reassurance/ReassuranceBank';
import { OutcomeCheckInModal } from './components/outcome/OutcomeCheckInModal';
import type { Exposure, OutcomeCheckIn } from './db';
import { getOnboardingStatus, getPendingCheckIns, getExposure } from './db';
import { requestNotificationPermission } from './utils/notifications';

import { AuthScreen } from './components/auth/AuthScreen';
import { LandingPage } from './components/landing/LandingPage';
import { Profile } from './components/profile/Profile';
import { useAuth } from './context/AuthContext';
import { syncService } from './services/FirebaseSyncService';

// --- Route Components (Adapters) ---

function ActiveSessionRoute() {
  const { exposureId } = useParams<{ exposureId: string }>();
  const navigate = useNavigate();
  const [exposure, setExposure] = useState<Exposure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exposureId) {
      navigate('/ladder');
      return;
    }
    getExposure(exposureId).then(exp => {
      if (exp) {
        setExposure(exp);
      } else {
        // Not found
        navigate('/ladder');
      }
      setLoading(false);
    });
  }, [exposureId, navigate]);

  if (loading) return <div>Loading session...</div>;
  if (!exposure) return null;

  return (
    <ActiveSession
      exposure={exposure}
      onComplete={() => navigate('/dashboard')}
      onCancel={() => navigate('/dashboard')}
    />
  );
}

function DashboardWrapper() {
  const navigate = useNavigate();
  return (
    <Dashboard
      onNavigate={(view) => navigate(`/${view}`)}
      onStartSession={() => navigate('/ladder')}
    />
  );
}

function LadderWrapper() {
  const navigate = useNavigate();
  // ExposureLadder expects onSelectExposure to take an exposure object.
  // We want to navigate to /session/:id
  return (
    <ExposureLadder
      onBack={() => navigate('/dashboard')}
      onSelectExposure={(exp) => navigate(`/session/${exp.id}`)}
    />
  );
}

function LogWrapper() {
  const navigate = useNavigate();
  return <VictoryLog onBack={() => navigate('/dashboard')} />;
}

function AnalyticsWrapper() {
  const navigate = useNavigate();
  return <AnalyticsDashboard onBack={() => navigate('/dashboard')} />;
}

function ReassuranceWrapper() {
  const navigate = useNavigate();
  return <ReassuranceBank onBack={() => navigate('/dashboard')} />;
}

function ProfileWrapper() {
  const navigate = useNavigate();
  return <Profile onBack={() => navigate('/dashboard')} />;
}

// --- Main App ---

function App() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCheckIn, setCurrentCheckIn] = useState<OutcomeCheckIn | null>(null);

  // Initialize App Data
  useEffect(() => {
    console.log('Sync Service Active:', !!syncService);

    const initializeApp = async () => {
      try {
        if (user) {
          const hasCompletedOnboarding = await getOnboardingStatus();
          setShowOnboarding(!hasCompletedOnboarding);

          const checkIns = await getPendingCheckIns();
          if (checkIns.length > 0) setCurrentCheckIn(checkIns[0]);

          requestNotificationPermission().catch(console.error);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      initializeApp();
    }
  }, [user, authLoading]);

  // Global Event Listeners
  useEffect(() => {
    const handleShowCheckIn = async () => {
      const checkIns = await getPendingCheckIns();
      if (checkIns.length > 0) setCurrentCheckIn(checkIns[0]);
    };
    window.addEventListener('show-outcome-checkin', handleShowCheckIn);
    return () => window.removeEventListener('show-outcome-checkin', handleShowCheckIn);
  }, []);

  const handleOnboardingComplete = () => setShowOnboarding(false);

  const handleCheckInComplete = async () => {
    setCurrentCheckIn(null);
    const checkIns = await getPendingCheckIns();
    if (checkIns.length > 0) setCurrentCheckIn(checkIns[0]);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-(--anchor-bg) flex items-center justify-center">
        <div className="animate-pulse text-(--anchor-text-muted) text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--anchor-bg)] text-[var(--anchor-text)] relative overflow-x-hidden selection:bg-[var(--anchor-primary)] selection:text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[var(--anchor-primary-muted)]/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--anchor-secondary)]/15 rounded-full blur-[150px] mix-blend-multiply" />
        <div className="absolute top-[20%] right-[15%] w-[10rem] h-[10rem] bg-[var(--anchor-accent)]/20 rounded-full blur-[60px]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 lg:p-20 animate-enter min-h-[100dvh] flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <LandingPage onGetStarted={() => navigate('/auth')} /> : <Navigate to="/dashboard" />} />
          <Route path="/auth" element={!user ? <AuthScreen onBack={() => navigate('/')} onComplete={() => { }} /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes */}
          {user && (
            <>
              <Route path="/dashboard" element={<DashboardWrapper />} />
              <Route path="/ladder" element={<LadderWrapper />} />
              <Route path="/session/:exposureId" element={<ActiveSessionRoute />} />
              <Route path="/log" element={<LogWrapper />} />
              <Route path="/analytics" element={<AnalyticsWrapper />} />
              <Route path="/reassurance" element={<ReassuranceWrapper />} />
              <Route path="/profile" element={<ProfileWrapper />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Overlays */}
      {user && showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {user && currentCheckIn && (
        <OutcomeCheckInModal
          checkIn={currentCheckIn}
          isOpen={true}
          onClose={() => setCurrentCheckIn(null)}
          onComplete={handleCheckInComplete}
        />
      )}
    </div>
  );
}

export default App;
