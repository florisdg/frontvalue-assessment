// helpers to manage favorites in browser storage, and to enforce the maximum of ten jokes

import type { Joke } from '../../shared/joke.d.ts'

export const MAX_FAVORITES = 10

/** Reads up to ten distinct jokes from browser storage. */
export function parseFavorites(stored: string | undefined) {
  const favorites: Joke[] = []
  if (!stored) return favorites

  try {
    const entries: unknown = JSON.parse(stored)
    if (!Array.isArray(entries)) return favorites

    for (const entry of entries as unknown[]) {
      if (!entry || typeof entry !== 'object' || !('id' in entry) || !('value' in entry)) continue
      const { id, value } = entry
      if (typeof id !== 'string' || typeof value !== 'string') continue
      if (favorites.some((joke) => joke.id === id)) continue
      favorites.push({ id, value })
      if (favorites.length === MAX_FAVORITES) break
    }
  } catch {
    // Ignore malformed JSON in browser storage.
  }

  return favorites
}

/** Toggles a joke by API ID, rejecting additions when all slots are full. */
export function toggleFavorite(favorites: Joke[], { id, value }: Joke) {
  if (favorites.some((joke) => joke.id === id)) return favorites.filter((joke) => joke.id !== id)
  if (favorites.length >= MAX_FAVORITES) return favorites
  return [...favorites, { id, value }]
}
