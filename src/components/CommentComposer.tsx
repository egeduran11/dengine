import { AlertCircle, ArrowUp, Clock3 } from 'lucide-react'
import { forwardRef, type FormEvent } from 'react'
import { DEMO_USER } from '../data/seed'

interface CommentComposerProps {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  error: string | null
  restrictionSeconds: number
  postOwner: string
}

export const CommentComposer = forwardRef<HTMLTextAreaElement, CommentComposerProps>(
  ({ draft, onDraftChange, onSubmit, error, restrictionSeconds, postOwner }, ref) => {
    const restricted = restrictionSeconds > 0

    function handleSubmit(event: FormEvent) {
      event.preventDefault()
      onSubmit()
    }

    return (
      <section className="composer-card" aria-labelledby="composer-title">
        <div className="composer-heading">
          <div>
            <p className="eyebrow">Yorum alanı</p>
            <h1 id="composer-title">{postOwner} gönderisine yanıt ver</h1>
          </div>
          <span className="no-penalty-badge">Yazarken puan uygulanmaz</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="composer-row">
            <div className="avatar avatar--demo" aria-hidden="true">
              {DEMO_USER.initials}
            </div>
            <div className="composer-field">
              <label htmlFor="comment-input">Yorumun</label>
              <textarea
                ref={ref}
                id="comment-input"
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder="Düşünceni açık ve saygılı biçimde paylaş…"
                rows={3}
                maxLength={320}
                disabled={restricted}
                aria-describedby={error ? 'comment-error comment-help' : 'comment-help'}
                aria-invalid={Boolean(error)}
              />
              <div className="composer-footer">
                <span id="comment-help" className="helper-text">
                  Analiz yalnızca Gönder’e bastığında karar akışını başlatır.
                </span>
                <span className="character-count">{draft.length}/320</span>
              </div>
            </div>
          </div>
          {error && (
            <p id="comment-error" className="inline-error" role="alert">
              <AlertCircle size={17} aria-hidden="true" />
              {error}
            </p>
          )}
          {restricted && (
            <div className="restriction-banner" role="status">
              <Clock3 size={18} aria-hidden="true" />
              <span>Geçici kısıtlama etkin. {restrictionSeconds} saniye sonra yeniden deneyebilirsin.</span>
            </div>
          )}
          <div className="composer-actions">
            <span className="agency-copy">Karar ve sonuç gönderimden önce açıkça gösterilir.</span>
            <button className="button button--primary" type="submit" disabled={restricted || draft.trim().length === 0}>
              Gönder
              <ArrowUp size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>
    )
  },
)

CommentComposer.displayName = 'CommentComposer'
