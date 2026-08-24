import { Heart, MessageCircle, Reply } from 'lucide-react'
import type { FeedPost } from '../data/seed'

interface FeedPostCardProps {
  post: FeedPost
  selected: boolean
  onSelect: () => void
}

export function FeedPostCard({ post, selected, onSelect }: FeedPostCardProps) {
  return (
    <article className={`post-card${selected ? ' post-card--selected' : ''}`} aria-labelledby={`${post.id}-author`}>
      <header className="post-header">
        <div className="avatar" aria-hidden="true">
          {post.initials}
        </div>
        <div className="post-author">
          <div>
            <strong id={`${post.id}-author`}>{post.username}</strong>
            <span>{post.handle}</span>
          </div>
          <time>{post.timestamp}</time>
        </div>
      </header>
      <p className="post-text">{post.text}</p>
      <div className="post-stats" aria-label="Gönderi etkileşimleri">
        <span>
          <Heart size={17} aria-hidden="true" /> {post.likes}
        </span>
        <span>
          <MessageCircle size={17} aria-hidden="true" /> {post.comments.length}
        </span>
        <button type="button" className="text-button" onClick={onSelect} aria-pressed={selected}>
          <Reply size={17} aria-hidden="true" />
          {selected ? 'Yanıtlanıyor' : 'Yanıtla'}
        </button>
      </div>
      {post.comments.length > 0 && (
        <div className="comment-list" aria-label="Yorumlar">
          {post.comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <div className={`avatar avatar--small${comment.isDemoUser ? ' avatar--demo' : ''}`} aria-hidden="true">
                {comment.username
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="comment-bubble">
                <div className="comment-meta">
                  <strong>{comment.username}</strong>
                  <span>{comment.handle}</span>
                  <time>{comment.timestamp}</time>
                </div>
                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
