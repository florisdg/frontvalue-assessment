import express from 'express'
import { getJokes, getRandomJoke } from './jokes.ts'

/** Creates the joke API and serves the built client when a directory is provided. */
export function createApp(clientDirectory?: string) {
  const app = express()

  app.get('/api/jokes', getJokes)
  app.get('/api/jokes/random', getRandomJoke)
  if (clientDirectory) app.use(express.static(clientDirectory))

  return app
}
