import { Text } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { JokeList } from './JokeList.tsx'
import { JokeTimer } from './JokeTimer.tsx'

type Joke = { id: string; value: string }
type JokeEntry = Joke & { entryId: number }

/** Loads the initial joke list and keeps the ten most recently added entries. */
export function JokeFeed() {
  const [jokes, setJokes] = useState<JokeEntry[] | 'loading' | 'error'>('loading')
  const nextEntryId = useRef(0)

  useEffect(() => {
    const request = new AbortController()

    fetch('/api/jokes', { signal: request.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((batch: Joke[]) => {
        if (request.signal.aborted) return
        setJokes(batch.map((joke) => ({ ...joke, entryId: nextEntryId.current++ })))
      })
      .catch(() => {
        if (request.signal.aborted) return
        setJokes('error')
      })

    return () => request.abort()
  }, [])

  /** Fetches and appends one joke while the timer is running. */
  async function loadNextJoke(signal: AbortSignal) {
    const response = await fetch('/api/jokes/random', { signal })
    if (!response.ok) return
    const joke: Joke = await response.json()
    if (signal.aborted) return

    const entry = { ...joke, entryId: nextEntryId.current++ }
    setJokes((current) => (Array.isArray(current) ? [...current, entry].slice(-10) : current))
  }

  if (jokes === 'loading') return <Text role="status">Loading jokes…</Text>
  if (jokes === 'error') return <Text role="alert">Could not load jokes.</Text>

  return (
    <>
      <JokeTimer onTick={loadNextJoke} />
      <JokeList jokes={jokes} />
    </>
  )
}
