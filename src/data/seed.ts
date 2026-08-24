export interface FeedComment {
  id: string
  username: string
  handle: string
  text: string
  timestamp: string
  isDemoUser?: boolean
}

export interface FeedPost {
  id: string
  username: string
  handle: string
  initials: string
  timestamp: string
  text: string
  likes: number
  comments: FeedComment[]
}

export const DEMO_USER = {
  username: 'Ece Yılmaz',
  handle: '@ecey',
  initials: 'EY',
} as const

export const SEEDED_POSTS: readonly FeedPost[] = [
  {
    id: 'post-1',
    username: 'Deniz Kaya',
    handle: '@denizk',
    initials: 'DK',
    timestamp: '12 dk',
    text: 'Mahalle bostanı için hafta sonu gönüllü buluşması yapıyoruz. Küçük fikirler, ortak emekle büyük bir dönüşüme dönüşebiliyor.',
    likes: 128,
    comments: [
      {
        id: 'seed-comment-1',
        username: 'Bora Ak',
        handle: '@bora',
        text: 'Harika bir fikir, komşularımla paylaşacağım.',
        timestamp: '8 dk',
      },
    ],
  },
  {
    id: 'post-2',
    username: 'Emre Can',
    handle: '@emrecan',
    initials: 'EC',
    timestamp: '31 dk',
    text: 'Erişilebilir durak haritamızın ilk saha testini tamamladık. Geri bildirim veren herkese teşekkürler.',
    likes: 94,
    comments: [
      {
        id: 'seed-comment-2',
        username: 'Selin Arı',
        handle: '@selina',
        text: 'Test sonuçlarını da paylaşabilir misiniz?',
        timestamp: '24 dk',
      },
    ],
  },
  {
    id: 'post-3',
    username: 'Selin Arı',
    handle: '@selina',
    initials: 'SA',
    timestamp: '1 sa',
    text: 'Gençler için dijital güvenlik atölyesi içeriklerini açık lisansla yayınladık. Kullanıp geliştirebilirsiniz.',
    likes: 211,
    comments: [],
  },
] as const

export function cloneSeededPosts(): FeedPost[] {
  return SEEDED_POSTS.map((post) => ({
    ...post,
    comments: post.comments.map((comment) => ({ ...comment })),
  }))
}
