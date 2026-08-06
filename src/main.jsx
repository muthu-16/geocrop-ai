import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Boundary Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
          <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-lg">
            GeoCrop AI System Notice
          </div>
          <p className="text-sm text-slate-300 max-w-md leading-relaxed">
            An unexpected session error occurred. Please click below to refresh and re-open the portal safely.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('geocrop_users');
              window.location.reload();
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 font-black text-slate-950 rounded-xl text-xs uppercase tracking-wider shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all"
          >
            Refresh & Reset Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

