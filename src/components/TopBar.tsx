import { Activity } from 'lucide-react'
import { getRiskTier } from '../engine'
import { BrandMark } from './BrandMark'

interface TopBarProps {
  risk: number
}

export function TopBar({ risk }: TopBarProps) {
  const tier = getRiskTier(risk)
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <BrandMark />
        <div className="topbar-meta">
          <span className="prototype-badge">TEKNOFEST 2026 prototipi</span>
          <div className="topbar-risk" aria-label={`Risk puanı ${Math.round(risk)}, durum ${tier.label}`}>
            <Activity size={17} aria-hidden="true" />
            <span>Risk</span>
            <strong>{Math.round(risk)}</strong>
            <span className={`tier-dot tier-dot--${tier.id}`} aria-hidden="true" />
            <span>{tier.label}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
