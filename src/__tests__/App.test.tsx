import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import * as db from '../db';

// Mock the database module
vi.mock('../db', async () => {
    return {
        getOnboardingStatus: vi.fn(),
        // Add other exports if needed, but for App.tsx this is the main side effect
    };
});

// Mock child components to isolate App testing
vi.mock('../components/dashboard/Dashboard', () => ({
    Dashboard: () => <div data-testid="dashboard">Dashboard Component</div>
}));
vi.mock('../components/ladder/ExposureLadder', () => ({
    ExposureLadder: () => <div data-testid="ladder">ExposureLadder Component</div>
}));
vi.mock('../components/session/ActiveSession', () => ({
    ActiveSession: () => <div data-testid="session">ActiveSession Component</div>
}));
vi.mock('../components/log/VictoryLog', () => ({
    VictoryLog: () => <div data-testid="log">VictoryLog Component</div>
}));
vi.mock('../components/analytics/AnalyticsDashboard', () => ({
    AnalyticsDashboard: () => <div data-testid="analytics">AnalyticsDashboard Component</div>
}));
vi.mock('../components/onboarding/Onboarding', () => ({
    Onboarding: () => <div data-testid="onboarding">Onboarding Component</div>
}));

describe('App Component', () => {
    it('renders loading state initially', () => {
        // Mock getOnboardingStatus to returning a promise that hasn't resolved yet
        // or just rely on the initial render cycle (useEffect hasn't finished)
        // However, to be safe, we can mock it to resolve slowly or check immediately after render
        (db.getOnboardingStatus as any).mockReturnValue(new Promise(() => { }));

        render(<App />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders dashboard when onboarding is complete', async () => {
        (db.getOnboardingStatus as any).mockResolvedValue(true);

        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument();
    });

    it('renders onboarding when onboarding is NOT complete', async () => {
        (db.getOnboardingStatus as any).mockResolvedValue(false);

        render(<App />);

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        // App renders Dashboard AND Onboarding overlay when onboarding is active? 
        // Looking at App.tsx: 
        // {currentView === 'dashboard' && <Dashboard ... />}
        // {showOnboarding && <Onboarding ... />}
        // So both should be present using default logic

        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('onboarding')).toBeInTheDocument();
    });
});
