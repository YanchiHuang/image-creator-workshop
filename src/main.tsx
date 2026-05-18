import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from '@/components/theme-provider'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null }
    static getDerivedStateFromError(error: Error) { return { error } }
    render() {
        if (this.state.error) {
            return (
                <pre style={{ color: 'red', padding: 20, whiteSpace: 'pre-wrap', background: '#fff', fontSize: 14 }}>
                    {'ERROR:\n' + String(this.state.error) + '\n\n' + (this.state.error as Error).stack}
                </pre>
            )
        }
        return this.props.children
    }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="image-creator-theme">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
