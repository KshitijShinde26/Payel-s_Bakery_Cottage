import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '../ui/Button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Avoid console logs in production, but standard reporting is fine
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-amber-50/10">
          <div className="bg-amber-100 p-4 rounded-full text-amber-700 mb-4 animate-bounce">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-stone-600 max-w-md mb-6 font-sans">
            We encountered a minor baking accident while loading this page. Please try refreshing or return to home.
          </p>
          <div className="flex gap-4">
            <Button variant="primary" onClick={this.handleReload}>
              Refresh Page
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Go to Homepage
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
