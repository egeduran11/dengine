import { CheckCircle2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CommentComposer } from './components/CommentComposer'
import { DemoPanel } from './components/DemoPanel'
import { FeedPostCard } from './components/FeedPostCard'
import { PrinciplesRail } from './components/PrinciplesRail'
import { RiskHistory } from './components/RiskHistory'
import { RiskStatusCard } from './components/RiskStatusCard'
import { TopBar } from './components/TopBar'
import { TransparencyDialog } from './components/TransparencyDialog'
import { proposeModeration, type ModerationProposal } from './engine'
import {
  clearDemoRestriction,
  confirmViolation,
  isRestrictionActive,
  publishCleanComment,
  resetDemoState,
  restrictionSecondsRemaining,
  setDemoRisk,
  simulateCleanDays,
} from './state/dengineState'
import { loadState, saveState } from './state/persistence'

export function App() {
  const [state, setState] = useState(loadState)
  const [selectedPostId, setSelectedPostId] = useState(state.posts[0]?.id ?? 'post-1')
  const [draft, setDraft] = useState('')
  const [pendingProposal, setPendingProposal] = useState<ModerationProposal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const selectedPost = useMemo(
    () => state.posts.find((post) => post.id === selectedPostId) ?? state.posts[0],
    [selectedPostId, state.posts],
  )
  const restrictionSeconds = restrictionSecondsRemaining(state, now)

  useEffect(() => saveState(state), [state])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4_000)
    return () => window.clearTimeout(timer)
  }, [notice])

  function updateDraft(value: string) {
    setDraft(value)
    setError(null)
  }

  function submitComment() {
    const text = draft.trim()
    if (isRestrictionActive(state)) {
      setError('Geçici kısıtlama sürerken yeni yorum gönderilemez.')
      return
    }
    if (!text) {
      setError('Göndermeden önce bir yorum yazmalısın.')
      composerRef.current?.focus()
      return
    }

    const proposal = proposeModeration(text, state.risk)
    if (proposal.requiresWarning) {
      setPendingProposal(proposal)
      return
    }

    setState((current) => publishCleanComment(current, selectedPost.id, text))
    setDraft('')
    setNotice('Yorum yayınlandı. Risk puanın değişmedi.')
  }

  const editPendingComment = useCallback(() => {
    setPendingProposal(null)
    setNotice('Yorum düzenlemeye geri döndü; puan uygulanmadı.')
  }, [])

  const confirmPendingComment = useCallback(() => {
    if (!pendingProposal) return
    setState((current) => confirmViolation(current, selectedPostId, pendingProposal))
    setDraft('')
    setPendingProposal(null)
    setNotice(`Yorum yayınlandı ve +${pendingProposal.penalty.points} risk puanı uygulandı.`)
  }, [pendingProposal, selectedPostId])

  function selectPost(postId: string) {
    setSelectedPostId(postId)
    window.setTimeout(() => composerRef.current?.focus(), 0)
  }

  function loadDemoDraft(text: string) {
    setDraft(text)
    setError(null)
    window.setTimeout(() => composerRef.current?.focus(), 0)
  }

  return (
    <>
      <TopBar risk={state.risk} />
      <div className="app-shell">
        <PrinciplesRail />

        <main id="main-content" className="feed-column" tabIndex={-1}>
          <CommentComposer
            ref={composerRef}
            draft={draft}
            onDraftChange={updateDraft}
            onSubmit={submitComment}
            error={error}
            restrictionSeconds={restrictionSeconds}
            postOwner={selectedPost.username}
          />

          <div className="feed-heading">
            <div>
              <p className="eyebrow">Topluluk akışı</p>
              <h2>Bugünün paylaşımları</h2>
            </div>
            <span>{state.posts.length} gönderi</span>
          </div>

          <div className="feed-list">
            {state.posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                selected={post.id === selectedPostId}
                onSelect={() => selectPost(post.id)}
              />
            ))}
          </div>
        </main>

        <aside className="status-column" aria-label="Risk durumu ve demo araçları">
          <RiskStatusCard risk={state.risk} restrictionSeconds={restrictionSeconds} />
          <RiskHistory events={state.history} />
          <DemoPanel
            draft={draft}
            risk={state.risk}
            onLoadDraft={loadDemoDraft}
            onReset={() => {
              setState((current) => resetDemoState(current))
              setSelectedPostId('post-1')
              setDraft('')
              setError(null)
              setNotice('Demo başlangıç durumuna döndürüldü.')
            }}
            onSimulateDays={(days) => {
              setState((current) => simulateCleanDays(current, days))
              setNotice(`${days} günlük ihlalsiz kullanım simüle edildi.`)
            }}
            onSetRisk={(risk) => {
              setState((current) => setDemoRisk(current, risk))
              setNotice(`Demo risk puanı ${risk} olarak ayarlandı.`)
            }}
            onClearRestriction={() => {
              setState((current) => clearDemoRestriction(current))
              setNotice('Demo kısıtlaması kaldırıldı.')
            }}
          />
        </aside>
      </div>

      {pendingProposal && (
        <TransparencyDialog
          proposal={pendingProposal}
          onEdit={editPendingComment}
          onConfirm={confirmPendingComment}
          returnFocusRef={composerRef}
        />
      )}

      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {notice && (
          <div className="toast">
            <CheckCircle2 size={18} aria-hidden="true" />
            {notice}
          </div>
        )}
      </div>
    </>
  )
}
