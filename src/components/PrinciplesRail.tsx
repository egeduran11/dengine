import { Eye, Gauge, RefreshCw, Scale, SlidersHorizontal } from 'lucide-react'

const principles = [
  { icon: Scale, label: 'Ağırlıklı şiddet' },
  { icon: SlidersHorizontal, label: 'Bypass direnci' },
  { icon: Eye, label: 'Gönderim öncesi şeffaflık' },
  { icon: RefreshCw, label: 'Geri kazanılabilir risk' },
  { icon: Gauge, label: 'Kademeli müdahale' },
]

export function PrinciplesRail() {
  return (
    <aside className="principles-rail" aria-labelledby="principles-title">
      <p className="eyebrow">Dengine yaklaşımı</p>
      <h2 id="principles-title">Ceza öncesi bilgi, kalıcı damga yerine iyileşme.</h2>
      <ul className="principle-list">
        {principles.map(({ icon: Icon, label }) => (
          <li key={label}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <div className="deterministic-note">
        <span className="status-pulse" aria-hidden="true" />
        <div>
          <strong>Deterministik motor</strong>
          <span>Harici yapay zekâ veya uzak moderasyon API’si yok.</span>
        </div>
      </div>
    </aside>
  )
}
