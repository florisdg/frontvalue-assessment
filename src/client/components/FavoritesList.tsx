import { Text, Title } from '@mantine/core'
import type { Joke } from '../../shared/joke.d.ts'
import { JokeList } from './JokeList.tsx'

export interface FavoritesListProps {
  favorites: Joke[]
  onToggleFavorite: (joke: Joke) => void
}

/** Shows saved jokes and lets the user remove them. */
export function FavoritesList(controls: FavoritesListProps) {
  const jokes = controls.favorites.map((joke) => ({ ...joke, entryId: joke.id }))

  return (
    <>
      <Title mb="md">Favorites</Title>
      {jokes.length === 0 ? <Text>No favorites yet.</Text> : <JokeList {...controls} jokes={jokes} />}
    </>
  )
}
