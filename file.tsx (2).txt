import { Outlet, Link } from 'react-router-dom'
import { Vote } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" data-testid="layout">
      {/* Navbar */}
      <nav className="border-b-2 border-text-primary bg-background" data-testid="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo">
              <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center border-2 border-text-primary">
                <span className="text-white font-display font-semibold text-sm">GDC</span>
              </div>
              <span className="font-display font-semibold text-xl tracking-tight">
                GDC — Public Voting Portal
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/create" 
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-mono text-sm uppercase tracking-widest border-2 border-text-primary hover:bg-brand-blue-hover transition-colors duration-150"
                data-testid="create-election-nav-button"
              >
                <Vote className="w-4 h-4" />
                CREATE ELECTION
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-text-primary bg-subtle-grey" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-mono text-sm text-text-secondary">
              GDC Public Voting Portal · Transparent Civic Voting
            </p>
            <p className="font-mono text-xs text-text-secondary">
              No cookies · No tracking · IP hash purged on election close
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
