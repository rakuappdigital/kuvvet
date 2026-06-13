import Avatar from '@/components/ui/Avatar'
import { formatRelativeTime } from '@/lib/utils'

interface Props {
  post: {
    id: string
    content: string
    created_at: string
    profiles: {
      username: string
      avatar_id: number
    }
  }
  isOwn: boolean
  onDelete?: (id: string) => void
}

export default function WallPost({ post, isOwn, onDelete }: Props) {
  return (
    <div className="flex gap-3 group">
      <Avatar avatarId={post.profiles.avatar_id} username={post.profiles.username} size={36} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold">@{post.profiles.username}</span>
          <span className="text-xs text-muted">{formatRelativeTime(post.created_at)}</span>
          {isOwn && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="ml-auto text-xs text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
            >
              Sil
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
      </div>
    </div>
  )
}
