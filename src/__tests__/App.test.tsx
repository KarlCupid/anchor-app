import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import * as db from '../db';
import * as authContext from '../context/AuthContext';
// import { User } from 'firebase/auth'; // Not needed if casting

// Mock the database module
vi.mock('../db', async () => {
    return {
        getOnboardingStatus: vi.fn(),
        getPendingCheckIns: vi.fn().mockResolvedValue([]),
        getExposure: vi.fn() // Add getExposure mock
    };
});

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

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
vi.mock('../components/auth/AuthScreen', () => ({
    AuthScreen: () => <div data-testid="auth-screen">AuthScreen</div>
}));
vi.mock('../components/landing/LandingPage', () => ({
    LandingPage: () => <div data-testid="landing-page">LandingPage</div>
}));

describe('App Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Default to logged in user for these tests
        vi.mocked(authContext.useAuth).mockReturnValue({
            user: { uid: 'test-user', displayName: 'Test User' } as unknown as import('firebase/auth').User,
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn()
        });
        vi.mocked(db.getPendingCheckIns).mockResolvedValue([]);
    });

    it('renders loading state initially', () => {
        vi.mocked(db.getOnboardingStatus).mockReturnValue(new Promise(() => { }));

        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders dashboard when onboarding is complete', async () => {
        vi.mocked(db.getOnboardingStatus).mockResolvedValue(true);

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <App />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        // Should render dashboard route
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('onboarding')).not.toBeInTheDocument();
    });

    it('renders onboarding when onboarding is NOT complete', async () => {
        vi.mocked(db.getOnboardingStatus).mockResolvedValue(false);

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <App />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('onboarding')).toBeInTheDocument();
    });

    it('renders landing page when user is not logged in', async () => {
        vi.mocked(authContext.useAuth).mockReturnValue({
            user: null,
            loading: false,
            signIn: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn()
        });
        vi.mocked(db.getOnboardingStatus).mockResolvedValue(true);

        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
});
