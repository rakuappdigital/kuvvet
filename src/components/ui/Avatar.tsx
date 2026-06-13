import Image from 'next/image'
import { getAvatarUrl } from '@/lib/utils'

interface Props {
  avatarId: number
  username: string
  size?: number
  className?: string
}

export default function Avatar({ avatarId, username, size = 36, className = '' }: Props) {
  return (
    <Image
      src={getAvatarUrl(avatarId)}
      alt={username}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  )
}
