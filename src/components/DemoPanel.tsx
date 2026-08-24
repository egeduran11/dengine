import { Bug, CalendarClock, Gauge, LockOpen, RotateCcw, TestTube2 } from 'lucide-react'
import { proposeModeration } from '../engine'

interface DemoPanelProps {
  draft: string
  risk: number
  onLoadDraft: (text: string) => void
  onReset: () => void
  onSimulateDays: (days: number) => void
  onSetRisk: (risk: number) => void
  onClearRestriction: () => void
}

const examples = [
  { label: 'Temiz örnek', text: 'Bu fikir üzerinde birlikte çalışabiliriz.' },
  { label: '+8 doğrudan örnek', text: 'Sen adi herif' },
  { label: 'Obfuscated örnek', text: 'Sen a.d.i h.e.r.i.f' },
] as const

export function DemoPanel({
  draft,
  risk,
  onLoadDraft,
  onReset,
  onSimulateDays,
  onSetRisk,
  onClearRestriction,
}: DemoPanelProps) {
  const analysis = proposeModeration(draft, risk)

  return (
    <section className="panel demo-panel" aria-labelledby="demo-title">
      <div className="panel-heading">
        <div>
          <div className="eyebrow-row">
            <p className="eyebrow">Jüri araçları</p>
            <span>Demo only</span>
          </div>
          <h2 id="demo-title">Demo / Debug Paneli</h2>
        </div>
        <TestTube2 size={21} aria-hidden="true" />
      </div>

      <div className="demo-section">
        <h3>60–90 saniyelik örnekler</h3>
        <div className="button-grid">
          {examples.map((example) => (
            <button key={example.label} className="button button--ghost" type="button" onClick={() => onLoadDraft(example.text)}>
              {example.label}
            </button>
          ))}
        </div>
      </div>

      <div className="analysis-box" aria-live="polite">
        <div className="analysis-title">
          <Bug size={17} aria-hidden="true" />
          <strong>Teknik görünüm</strong>
        </div>
        <dl>
          <div>
            <dt>Normalize metin</dt>
            <dd>{analysis.detection.normalizedText || '—'}</dd>
          </div>
          <div>
            <dt>Tespit</dt>
            <dd>
              {analysis.detection.matches.length > 0
                ? analysis.detection.matches.map((match) => `${match.canonical} (S${match.severity})`).join(', ')
                : 'Eşleşme yok'}
            </dd>
          </div>
          <div>
            <dt>Önerilen sonuç</dt>
            <dd>{analysis.requiresWarning ? `+${analysis.penalty.points} puan` : 'Puan yok'}</dd>
          </div>
        </dl>
      </div>

      <div className="demo-section">
        <h3>
          <Gauge size={17} aria-hidden="true" /> Eşik hazırlığı
        </h3>
        <div className="button-grid button-grid--four">
          <button className="button button--ghost" type="button" onClick={() => onSetRisk(39)}>39</button>
          <button className="button button--ghost" type="button" onClick={() => onSetRisk(59)}>59</button>
          <button className="button button--ghost" type="button" onClick={() => onSetRisk(79)}>79</button>
          <button className="button button--ghost" type="button" onClick={() => onSetRisk(85)}>85</button>
        </div>
      </div>

      <div className="demo-section">
        <h3>
          <CalendarClock size={17} aria-hidden="true" /> İhlalsiz zaman
        </h3>
        <div className="button-grid button-grid--three">
          <button className="button button--ghost" type="button" onClick={() => onSimulateDays(1)}>+1 gün</button>
          <button className="button button--ghost" type="button" onClick={() => onSimulateDays(3)}>+3 gün</button>
          <button className="button button--ghost" type="button" onClick={() => onSimulateDays(7)}>+7 gün</button>
        </div>
      </div>

      <div className="demo-danger-zone">
        <button className="button button--subtle" type="button" onClick={onClearRestriction}>
          <LockOpen size={17} aria-hidden="true" /> Kısıtlamayı kaldır
        </button>
        <button className="button button--subtle" type="button" onClick={onReset}>
          <RotateCcw size={17} aria-hidden="true" /> Demoyu sıfırla
        </button>
      </div>
    </section>
  )
}
