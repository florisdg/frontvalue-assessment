import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test, { type TestContext } from 'node:test'
import { createApp } from './app.ts'
import { moderateJokes } from './moderation.ts'

const API_URL_WITH_CATEGORIES =
  'https://api.chucknorris.io/jokes/random?category=animal,career,celebrity,dev,fashion,food,history,money,movie,music,science,sport,travel'

/** Creates a known joke for the upstream mock and response assertions. */
function makeJoke(index: number) {
  return { id: `joke-${index}`, value: `Joke ${index}` }
}

/** Wraps model output in an OpenRouter completion. */
function completion(content: string) {
  return Response.json({ choices: [{ finish_reason: 'stop', message: { content } }] })
}

/** Reverses the verdict order to exercise matching by ID. */
function verdicts(firstJoke: number, ...approvals: boolean[]) {
  return completion(
    JSON.stringify({
      verdicts: approvals.map((allow, index) => ({ id: makeJoke(firstJoke + index).id, allow })).reverse(),
    }),
  )
}

/** Mocks both upstreams and records the candidate batches sent for moderation. */
function mockProviders(t: TestContext, ...moderationResponses: Response[]) {
  let nextJoke = 0
  const batches: unknown[] = []
  t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    if (url === API_URL_WITH_CATEGORIES) return Response.json({ ...makeJoke(nextJoke++), categories: ['dev'] })

    assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions')
    const { messages } = JSON.parse(String(init.body))
    batches.push(JSON.parse(messages[1].content))
    const response = moderationResponses.shift()
    assert(response, 'Unexpected moderation request')
    return response
  })
  return batches
}

test('Express app', async (t) => {
  const clientDirectory = await mkdtemp(join(tmpdir(), 'frontvalue-client-'))
  t.after(() => rm(clientDirectory, { recursive: true }))
  const clientHtml = '<h1>Chuck Norris jokes</h1>'
  await writeFile(join(clientDirectory, 'index.html'), clientHtml)

  t.mock.property(process, 'env', { ...process.env, OPENROUTER_API_KEY: 'test-key' })
  const fetchFromApp = globalThis.fetch
  const server = createApp(clientDirectory).listen(0, '127.0.0.1')
  t.after(() => {
    server.close()
  })
  await once(server, 'listening')

  const address = server.address()
  assert(address && typeof address !== 'string')
  const origin = `http://127.0.0.1:${address.port}`
  const url = `${origin}/api/jokes`

  await t.test('serves the built client at /', async () => {
    const response = await fetchFromApp(origin)

    assert.equal(response.status, 200)
    assert.equal(await response.text(), clientHtml)
  })

  await t.test('returns the first ten approved jokes from one batch', async (t) => {
    const batches = mockProviders(t, verdicts(0, false, ...Array<boolean>(13).fill(true)))

    const response = await fetchFromApp(url)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(
      await response.json(),
      Array.from({ length: 10 }, (_, index) => makeJoke(index + 1)),
    )
    assert.deepEqual(batches, [Array.from({ length: 14 }, (_, index) => makeJoke(index))])
  })

  await t.test('keeps approved jokes and moderates only new candidates on refill', async (t) => {
    const batches = mockProviders(
      t,
      verdicts(0, ...Array.from({ length: 14 }, (_, index) => index < 9)),
      verdicts(14, false, true, true),
    )

    const response = await fetchFromApp(url)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), [...Array.from({ length: 9 }, (_, index) => makeJoke(index)), makeJoke(15)])
    assert.equal(batches.length, 2)
    assert.deepEqual(batches[1], [makeJoke(14), makeJoke(15), makeJoke(16)])
  })

  await t.test('returns 502 if one refill yields too few approved jokes', async (t) => {
    const batches = mockProviders(
      t,
      verdicts(0, ...Array.from({ length: 14 }, (_, index) => index < 9)),
      verdicts(14, false, false, false),
    )

    const response = await fetchFromApp(url)

    assert.equal(response.status, 502)
    assert.deepEqual(await response.json(), { error: 'Could not load jokes.' })
    assert.equal(batches.length, 2)
  })

  await t.test('GET /api/jokes/random returns the first approved candidate', async (t) => {
    const batches = mockProviders(t, verdicts(0, false, true, true))

    const response = await fetchFromApp(`${url}/random`)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), makeJoke(1))
    assert.equal(batches.length, 1)
  })

  await t.test('moderates repeated joke IDs once and applies the verdict to each occurrence', async (t) => {
    const joke = makeJoke(0)
    const batches = mockProviders(t, verdicts(0, true))
    const signal = AbortSignal.timeout(1000)

    assert.deepEqual(await moderateJokes([joke, joke], signal), [
      { ...joke, allow: true },
      { ...joke, allow: true },
    ])
    await assert.rejects(moderateJokes([joke, { ...joke, value: 'Different joke text' }], signal))
    assert.deepEqual(batches, [[joke]])
  })

  for (const [scenario, moderationResponse] of [
    ['all candidates are blocked', verdicts(0, false, false, false)],
    ['OpenRouter returns an HTTP error', new Response(null, { status: 429 })],
    ['the model returns invalid JSON', completion('invalid JSON')],
    ['the model returns a partial batch', verdicts(0, true)],
    ['the model returns an unknown ID', verdicts(1, true, true, true)],
    [
      'the model returns duplicate IDs',
      completion(
        '{"verdicts":[{"id":"joke-0","allow":true},{"id":"joke-0","allow":false},{"id":"joke-2","allow":true}]}',
      ),
    ],
  ] as const) {
    await t.test(`GET /api/jokes/random returns 502 when ${scenario}`, async (t) => {
      const batches = mockProviders(t, moderationResponse)

      const response = await fetchFromApp(`${url}/random`)

      assert.equal(response.status, 502)
      assert.deepEqual(await response.json(), { error: 'Could not load joke.' })
      assert.equal(batches.length, 1)
    })
  }

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
