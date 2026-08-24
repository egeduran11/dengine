import { AlertTriangle, ArrowRight, CheckCircle2, Pencil, ShieldAlert } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ModerationProposal } from '../engine'

interface TransparencyDialogProps {
  proposal: ModerationProposal
  onEdit: () => void
  onConfirm: () => void
  returnFocusRef: React.RefObject<HTMLTextAreaElement | null>
}

export function TransparencyDialog({ proposal, onEdit, onConfirm, returnFocusRef }: TransparencyDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusTimerRef = useRef<number | null>(null)
  const primary = proposal.penalty.primary

  useEffect(() => {
    if (returnFocusTimerRef.current !== null) {
      window.clearTimeout(returnFocusTimerRef.current)
      returnFocusTimerRef.current = null
    }
    editButtonRef.current?.focus()
    const dialog = dialogRef.current
    const returnFocusElement = returnFocusRef.current

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEdit()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled])')]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      returnFocusTimerRef.current = window.setTimeout(() => returnFocusElement?.focus(), 0)
    }
  }, [onEdit, returnFocusRef])

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        ref={dialogRef}
        className="transparency-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="warning-title"
        aria-describedby="warning-description"
      >
        <div className="dialog-icon" aria-hidden="true">
          <ShieldAlert size={26} />
        </div>
        <p className="eyebrow eyebrow--warning">Dengine uyarısı</p>
        <h2 id="warning-title">
          Bu yorum hesabına <span>+{proposal.penalty.points} risk puanı</span> ekleyecek.
        </h2>
        <p id="warning-description" className="dialog-lead">
          Göndermeden önce nedeni ve sonucu inceleyebilir, metni düzenleyebilir veya sonucu bilerek gönderebilirsin.
        </p>

        <section className="reason-panel" aria-labelledby="reason-title">
          <div className="reason-heading">
            <AlertTriangle size={19} aria-hidden="true" />
            <h3 id="reason-title">Neden?</h3>
          </div>
          <p>{primary?.explanation}</p>
          <div className="severity-row">
            <span className="severity-badge">Seviye {primary?.severity}</span>
            <strong>{primary?.category}</strong>
            {proposal.penalty.additionalDistinctCount > 0 && (
              <span>+{proposal.penalty.additionalDistinctCount} farklı eşleşme</span>
            )}
          </div>
        </section>

        <div className="risk-comparison" aria-label="Risk puanı karşılaştırması">
          <div>
            <span>Mevcut risk</span>
            <strong>{Math.round(proposal.currentRisk)}</strong>
            <small>{proposal.currentTier.label}</small>
          </div>
          <ArrowRight size={22} aria-hidden="true" />
          <div className="risk-comparison__projected">
            <span>Gönderim sonrası</span>
            <strong>{Math.round(proposal.projectedRisk)}</strong>
            <small>{proposal.projectedTier.label}</small>
          </div>
        </div>

        {proposal.crossesTier && (
          <div className="threshold-notice" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>
              Yeni durum: <strong>{proposal.projectedTier.label}</strong>. {proposal.projectedTier.explanation}
            </span>
          </div>
        )}

        <div className="dialog-actions">
          <button ref={editButtonRef} className="button button--secondary" type="button" onClick={onEdit}>
            <Pencil size={18} aria-hidden="true" />
            Düzenle
          </button>
          <button className="button button--danger" type="button" onClick={onConfirm}>
            Yine de Gönder
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="dialog-footnote">Düzenle’yi seçersen hiçbir risk puanı uygulanmaz.</p>
      </div>
    </div>
  )
}
