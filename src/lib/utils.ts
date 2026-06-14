import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getAvatarUrl(avatarId: number): string {
  return `/avatars/avatar-${avatarId}.svg`
}

export const AVATAR_NAMES: Record<number, string> = {
  1: 'Kleopatra', 2: 'Julius Caesar', 3: 'Napolyon', 4: 'Einstein',
  5: 'Che Guevara', 6: 'Da Vinci', 7: 'Atatürk', 8: 'Batman',
  9: 'Darth Vader', 10: 'Sherlock Holmes', 11: 'Harry Potter', 12: 'Joker',
  13: 'Gandalf', 14: 'Wonder Woman', 15: 'Marilyn Monroe', 16: 'James Dean',
  17: 'Audrey Hepburn', 18: 'Elvis Presley', 19: 'Charlie Chaplin', 20: 'Bruce Lee',
}

export function getGroupAvatarUrl(avatarId: number): string {
  return `/group-avatars/group-${avatarId}.svg`
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
