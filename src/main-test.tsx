import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Minimal test to see if React renders at all
function TestApp() {
    return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h1 style={{ color: '#5b7fa3' }}>Anchor - Test Mode</h1>
            <p>If you can see this, React is working!</p>
            <p>Checking imports...</p>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TestApp />
    </StrictMode>,
)
