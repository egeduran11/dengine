import { ArrowDown, ChevronRight, Info, ShieldCheck } from 'lucide-react'
import { getNextTier, getRiskTier } from '../engine'

interface RiskStatusCardProps {
  risk: number
  restrictionSeconds: number
}

export function RiskStatusCard({ risk, restrictionSeconds }: RiskStatusCardProps) {
  const tier = getRiskTier(risk)
  const nextTier = getNextTier(risk)
  const pointsToNext = nextTier ? Math.max(0, Math.ceil(nextTier.min - risk)) : 0

  return (
    <section className={`panel risk-card risk-card--${tier.id}`} aria-labelledby="risk-status-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Canlı durum</p>
          <h2 id="risk-status-title">Risk Puanı</h2>
        </div>
        <ShieldCheck size={22} aria-hidden="true" />
      </div>

      <div className="risk-score-row">
        <strong className="risk-score">{Math.round(risk)}</strong>
        <span>/ 100</span>
        <span className={`tier-badge tier-badge--${tier.id}`}>{tier.label}</span>
      </div>
      <progress className="risk-progress" max="100" value={risk} aria-label={`Risk puanı ${Math.round(risk)} / 100`} />

      <div className="status-explanation">
        <Info size={18} aria-hidden="true" />
        <p>{tier.explanation}</p>
      </div>

      {restrictionSeconds > 0 && (
        <div className="active-restriction" role="status">
          <strong>Geçici kısıtlama etkin</strong>
          <span>{restrictionSeconds} saniye kaldı.</span>
        </div>
      )}

      <div className="recovery-copy">
        <ArrowDown size={17} aria-hidden="true" />
        <span>{tier.recovery}</span>
      </div>

      {nextTier ? (
        <div className="next-tier">
          <span>Sonraki seviye</span>
          <div>
            <strong>{nextTier.label}</strong>
            <ChevronRight size={16} aria-hidden="true" />
            <span>{pointsToNext} puan</span>
          </div>
        </div>
      ) : (
        <div className="next-tier">
          <span>Üst sınır</span>
          <strong>Geçici ve geri kazanılabilir</strong>
        </div>
      )}
    </section>
  )
}
