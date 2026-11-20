import { Title } from '@mantine/core'
import { useHash, useLocalStorage } from '@mantine/hooks'
import { AppLayout } from './components/AppLayout.tsx'
import { FavoritesList } from './components/FavoritesList.tsx'
import { JokeFeed } from './components/JokeFeed.tsx'
import { type Joke, parseFavorites, toggleFavorite } from './state/favorites.ts'

const EMPTY_FAVORITES: Joke[] = []

/** Root of the app
 * Shares saved jokes across the home and favorites pages.
 * */
export default function App() {
  const [hash] = useHash({ getInitialValueInEffect: false })
  const page = hash === '#favorites' ? 'favorites' : 'home'
  // store favorites in local storage so they persist across page reloads
  const [favorites, setFavorites] = useLocalStorage({
    key: 'favorites:v1',
    defaultValue: EMPTY_FAVORITES,
    deserialize: parseFavorites,
    getInitialValueInEffect: false,
  })

  /** Saves the selection from either page. */
  function onToggleFavorite(joke: Joke) {
    setFavorites(toggleFavorite(favorites, joke))
  }

  return (
    <AppLayout page={page}>
      {page === 'favorites' ? (
        <FavoritesList favorites={favorites} onToggleFavorite={onToggleFavorite} />
      ) : (
        <>
          <Title mb="md">Chuck Norris jokes</Title>
          <JokeFeed favorites={favorites} onToggleFavorite={onToggleFavorite} />
        </>
      )}
    </AppLayout>
  )
}
