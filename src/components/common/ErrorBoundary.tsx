import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { reportLovableError } from "../../lib/lovable-error-reporting";

interface Props {
  children: ReactNode;
  fallback?: (args: { error: Error; reset: () => void }) => ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Global error boundary for unhandled React render/runtime errors.
 * Logs to console + Lovable telemetry and renders a polished fallback UI
 * with retry / go-home affordances.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    reportLovableError(error, {
      boundary: "global_error_boundary",
      componentStack: info.componentStack ?? undefined,
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback)
      return this.props.fallback({ error: this.state.error, reset: this.reset });

    return (
      <div className="min-h-screen grid place-items-center bg-background px-6 py-12">
        <div className="max-w-lg w-full glass-panel border border-destructive/40 p-8 text-center">
          <div className="mx-auto mb-5 size-14 grid place-items-center rounded-full bg-destructive/10 border border-destructive/40">
            <AlertTriangle className="size-7 text-destructive" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-destructive mb-2">
            Unexpected Error
          </div>
          <h1 className="font-display text-3xl md:text-4xl italic uppercase mb-3">
            Something broke
          </h1>
          <p className="text-sm text-white/60 font-mono mb-6 leading-relaxed">
            The app hit an unexpected error. It has been logged for review.
            You can retry the current view or head back to the lobby.
          </p>
          <pre className="text-left text-[11px] font-mono text-white/50 bg-black/40 border border-white/10 rounded p-3 mb-6 max-h-40 overflow-auto">
            {this.state.error.message}
          </pre>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={this.reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-accent-cyan text-black text-xs font-mono uppercase tracking-widest hover:bg-accent-cyan/80 transition-colors"
            >
              <RefreshCcw className="size-3.5" /> Retry
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-white/20 text-xs font-mono uppercase tracking-widest text-white/80 hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              <Home className="size-3.5" /> Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}