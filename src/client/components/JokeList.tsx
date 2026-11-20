import { List, Text } from '@mantine/core'
import { useEffect, useState } from 'react'

type Joke = { id: string; value: string }

/** Loads and displays the initial batch of random jokes. */
export function JokeList() {
  const [jokes, setJokes] = useState<Joke[] | 'loading' | 'error'>('loading')

  useEffect(() => {
    const request = new AbortController()

    fetch('/api/jokes', { signal: request.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then(setJokes)
      .catch(() => {
        if (request.signal.aborted) return
        setJokes('error')
      })

    return () => request.abort()
  }, [])

  if (jokes === 'loading') return <Text role="status">Loading jokes…</Text>
  if (jokes === 'error') return <Text role="alert">Could not load jokes.</Text>

  return (
    <List spacing="sm" listStyleType="none">
      {jokes.map(({ id, value }, index) => (
        <List.Item key={`${id}-${index}`}>{value}</List.Item>
      ))}
    </List>
  )
}
