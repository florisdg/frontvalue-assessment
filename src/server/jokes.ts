import type { RequestHandler } from 'express'
import { moderateJokes } from './moderation.ts'

const INITIAL_JOKE_COUNT = 10

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

/** Fetches random jokes concurrently and keeps only those approved by moderation. */
async function fetchApprovedJokes(count: number, signal: AbortSignal) {
  const jokes = await Promise.all(Array.from({ length: count }, () => fetchRandomJoke(signal)))
  const moderated = await moderateJokes(jokes, signal)
  return moderated.filter(({ allow }) => allow).map(({ id, value }) => ({ id, value }))
}

/** Serves ten approved jokes with at most one refill. */
export const getJokes: RequestHandler = async (_request, response) => {
  try {
    // Share a five-second deadline across fetching, moderation, and any refill.
    const signal = AbortSignal.timeout(5000)
    // Fetch four extra jokes so if some jokes are blocked and discarded by moderation, we have a couple extra jokes as a backup.
    const jokes = await fetchApprovedJokes(INITIAL_JOKE_COUNT + 4, signal)
    // Count how many more approved jokes are needed to reach 10.
    const missing = INITIAL_JOKE_COUNT - jokes.length
    // Refill once, with two extra candidates in case more are blocked.
    if (missing > 0) jokes.push(...(await fetchApprovedJokes(missing + 2, signal)))
    // Return an error if the refill still leaves fewer than ten approved jokes.
    // TODO: consider ensuring a list of 10 jokes at all times, without throwing errors?
    if (jokes.length < INITIAL_JOKE_COUNT) throw new Error('Too many inappropriate approved jokes')

    // Keep only the first ten approved jokes and prevent caching of the random batch.
    response.set('Cache-Control', 'no-store').json(jokes.slice(0, INITIAL_JOKE_COUNT))
  } catch {
    // Use the same API error for upstream failures and a batch with too few approvals.
    response.status(502).json({ error: 'Could not load jokes.' })
  }
}

/** Serves the first approved joke from three candidates. */
export const getRandomJoke: RequestHandler = async (_request, response) => {
  try {
    const [joke] = await fetchApprovedJokes(3, AbortSignal.timeout(5000))
    if (!joke) throw new Error('No approved jokes')

    response.set('Cache-Control', 'no-store').json(joke)
  } catch {
    response.status(502).json({ error: 'Could not load joke.' })
  }
}
