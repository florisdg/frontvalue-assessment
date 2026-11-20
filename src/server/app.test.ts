import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { app } from './app.ts'

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
      Response.json({ ...remainingJokes.shift(), categories: [] }),
    )

    const response = await fetchFromApp(url)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), jokes)
    assert.deepEqual(
      upstream.mock.calls.map((call) => call.arguments[0]),
      Array(10).fill('https://api.chucknorris.io/jokes/random'),
    )
  })

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
