import { ArrowDown, ArrowUp, History, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { RiskEvent } from '../state/dengineState'

interface RiskHistoryProps {
  events: RiskEvent[]
}

const typeLabel: Record<RiskEvent['type'], string> = {
  violation: 'Onaylanan ihlal',
  decay: 'Risk decay',
  reset: 'Demo sıfırlama',
  manual_demo_adjustment: 'Demo ayarı',
}

function EventIcon({ type, delta }: Pick<RiskEvent, 'type' | 'delta'>) {
  if (type === 'reset') return <RotateCcw size={17} aria-hidden="true" />
  if (type === 'manual_demo_adjustment') return <SlidersHorizontal size={17} aria-hidden="true" />
  return delta > 0 ? <ArrowUp size={17} aria-hidden="true" /> : <ArrowDown size={17} aria-hidden="true" />
}

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(timestamp))
}

function formatRisk(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2)
}

export function RiskHistory({ events }: RiskHistoryProps) {
  return (
    <section className="panel history-panel" aria-labelledby="history-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Açıklanabilir kayıt</p>
          <h2 id="history-title">Risk Geçmişi</h2>
        </div>
        <History size={21} aria-hidden="true" />
      </div>

      {events.length === 0 ? (
        <div className="empty-history">
          <History size={24} aria-hidden="true" />
          <strong>Henüz risk olayı yok</strong>
          <span>Onaylanan ihlaller ve decay burada gerekçesiyle görünür.</span>
        </div>
      ) : (
        <ol className="history-list">
          {events.slice(0, 10).map((event) => (
            <li key={event.id}>
              <span className={`history-icon history-icon--${event.delta > 0 ? 'up' : 'down'}`}>
                <EventIcon type={event.type} delta={event.delta} />
              </span>
              <div className="history-content">
                <div className="history-topline">
                  <strong>{typeLabel[event.type]}</strong>
                  <time dateTime={event.timestamp}>{formatTime(event.timestamp)}</time>
                </div>
                <p>{event.reason}</p>
                <div className="history-numbers">
                  <strong className={event.delta > 0 ? 'delta-up' : 'delta-down'}>
                    {event.delta > 0 ? '+' : ''}
                    {formatRisk(event.delta)}
                  </strong>
                  <span>
                    {formatRisk(event.previousRisk)} → {formatRisk(event.newRisk)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
