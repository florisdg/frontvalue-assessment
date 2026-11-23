import type { RequestHandler } from 'express'

// custom list of categories that excludes `explicit`, `political`, and `religion` which are more likely to be inappropriate for a general audience
// TODO: maybe also consider removing `history`?
const allowedCategories = [
  'animal',
  'career',
  'celebrity',
  'dev',
  'fashion',
  'food',
  'history',
  'money',
  'movie',
  'music',
  'science',
  'sport',
  'travel',
]

/** Fetches one joke from the allowed categories and extracts the fields used by the client. */
async function fetchRandomJoke(signal: AbortSignal) {
  const response = await fetch(`https://api.chucknorris.io/jokes/random?category=${allowedCategories.join(',')}`, {
    signal,
  })
  if (!response.ok) throw new Error(`Chuck Norris API returned HTTP ${response.status}`)

  const joke: unknown = await response.json()
  if (typeof joke !== 'object' || joke === null) throw new Error('Invalid joke response')
  if (!('id' in joke) || typeof joke.id !== 'string' || !('value' in joke) || typeof joke.value !== 'string') {
    throw new Error('Invalid joke response')
  }
  if (
    !('categories' in joke) ||
    !Array.isArray(joke.categories) ||
    joke.categories.some((category) => !allowedCategories.includes(category))
  ) {
    throw new Error('Unexpected joke categories')
  }

  return { id: joke.id, value: joke.value }
}

/** Serves a batch of ten random Chuck Norris jokes. */
export const getJokes: RequestHandler = async (_request, response) => {
  try {
    const signal = AbortSignal.timeout(5000)
    const jokes = await Promise.all(Array.from({ length: 10 }, () => fetchRandomJoke(signal)))
    response.set('Cache-Control', 'no-store').json(jokes)
  } catch {
    response.status(502).json({ error: 'Could not load jokes.' })
  }
}

/** Serves one random Chuck Norris joke. */
export const getRandomJoke: RequestHandler = async (_request, response) => {
  try {
    const joke = await fetchRandomJoke(AbortSignal.timeout(5000))
    response.set('Cache-Control', 'no-store').json(joke)
  } catch {
    response.status(502).json({ error: 'Could not load joke.' })
  }
}
