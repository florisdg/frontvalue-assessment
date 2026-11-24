import { ActionIcon, Group, List, Text } from '@mantine/core'
import type { Joke } from '../../shared/joke.d.ts'
import { MAX_FAVORITES } from '../state/favorites.ts'

export interface JokeListProps {
  jokes: readonly (Joke & { entryId: number | string })[]
  favorites: Joke[]
  onToggleFavorite: (joke: Joke) => void
}

/** Renders jokes with a star that toggles their saved state. */
export function JokeList({ jokes, favorites, onToggleFavorite }: JokeListProps) {
  const atLimit = favorites.length >= MAX_FAVORITES

  return (
    <>
      <Text role="status" size="sm" c="dimmed" mb="sm">
        {favorites.length} / {MAX_FAVORITES} favorites{atLimit ? ' · Remove a favorite to add another.' : ''}
      </Text>
      <List spacing="sm" listStyleType="none" role="list">
        {jokes.map((joke) => {
          const isFavorite = favorites.some(({ id }) => id === joke.id)
          return (
            <List.Item key={joke.entryId}>
              <Group component="span" gap="xs" wrap="nowrap">
                <ActionIcon
                  variant="subtle"
                  color={isFavorite ? 'yellow.8' : 'gray'}
                  fz="xl"
                  aria-label={`Favorite “${joke.value}”`}
                  aria-pressed={isFavorite}
                  disabled={atLimit && !isFavorite}
                  onClick={() => onToggleFavorite(joke)}
                >
                  <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
                </ActionIcon>
                <span>{joke.value}</span>
              </Group>
            </List.Item>
          )
        })}
      </List>
    </>
  )
}
