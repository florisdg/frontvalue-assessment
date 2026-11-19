import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { app } from './app.ts'

test('GET /api/hello returns the Express greeting', async (t) => {
  const server = app.listen(0, '127.0.0.1')
  t.after(() => {
    server.close()
  })
  await once(server, 'listening')

  const address = server.address()
  assert(address && typeof address !== 'string')

  const response = await fetch(`http://127.0.0.1:${address.port}/api/hello`)

  assert.equal(response.status, 200)
  assert.equal(await response.text(), 'hello from express')
})
