import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getAvatarUrl(avatarId: number): string {
  return `/avatars/avatar-${avatarId}.svg`
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1) return 'şimdi'
  if (minutes < 60) return `${minutes}dk önce`
  if (hours < 24) return `${hours}s önce`
  return `${Math.floor(hours / 24)}g önce`
}
