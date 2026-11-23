import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { app } from './app.ts'

const API_URL_WITH_CATEGORIES =
  'https://api.chucknorris.io/jokes/random?category=animal,career,celebrity,dev,fashion,food,history,money,movie,music,science,sport,travel'

test('GET /api/jokes', async (t) => {
  const fetchFromApp = globalThis.fetch
  const server = app.listen(0, '127.0.0.1')
  t.after(() => {
    server.close()
  })
  await once(server, 'listening')

  const address = server.address()
  assert(address && typeof address !== 'string')
  const url = `http://127.0.0.1:${address.port}/api/jokes`

  await t.test('returns ten random jokes', async (t) => {
    const jokes = Array.from({ length: 10 }, (_, index) => ({ id: `joke-${index}`, value: `Joke ${index}` }))
    const remainingJokes = [...jokes]
    const upstream = t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ ...remainingJokes.shift(), categories: ['dev'] }),
    )

    const response = await fetchFromApp(url)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), jokes)
    assert.deepEqual(
      upstream.mock.calls.map((call) => call.arguments[0]),
      Array(10).fill(API_URL_WITH_CATEGORIES),
    )
  })

  await t.test('GET /api/jokes/random fetches and returns one joke', async (t) => {
    const joke = { id: 'random-joke', value: 'Random joke' }
    const upstream = t.mock.method(globalThis, 'fetch', async () => Response.json({ ...joke, categories: ['dev'] }))

    const response = await fetchFromApp(`${url}/random`)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), joke)
    assert.deepEqual(
      upstream.mock.calls.map((call) => call.arguments[0]),
      [API_URL_WITH_CATEGORIES],
    )
  })

  await t.test('GET /api/jokes/random returns 502 on an upstream error', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }))

    const response = await fetchFromApp(`${url}/random`)

    assert.equal(response.status, 502)
    assert.deepEqual(await response.json(), { error: 'Could not load joke.' })
  })

  for (const category of ['explicit', 'political', 'religion']) {
    await t.test(`rejects a joke tagged ${category}`, async (t) => {
      t.mock.method(globalThis, 'fetch', async () =>
        Response.json({ id: 'blocked-joke', value: 'Blocked joke', categories: ['dev', category] }),
      )

      const response = await fetchFromApp(`${url}/random`)

      assert.equal(response.status, 502)
      assert.deepEqual(await response.json(), { error: 'Could not load joke.' })
    })
  }

  for (const [scenario, upstreamResponse] of [
    ['an upstream HTTP error', () => new Response(null, { status: 503 })],
    ['an invalid joke', () => Response.json({ id: 'joke-1' })],
  ] as const) {
    await t.test(`returns 502 for ${scenario}`, async (t) => {
      t.mock.method(globalThis, 'fetch', async () => upstreamResponse())

      const response = await fetchFromApp(url)

      assert.equal(response.status, 502)
      assert.deepEqual(await response.json(), { error: 'Could not load jokes.' })
    })
  }
})
