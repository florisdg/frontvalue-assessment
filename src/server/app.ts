import express from 'express'
import { getJokes, getRandomJoke } from './jokes.ts'

/** Express application for the browser API. */
export const app = express()

app.get('/api/jokes', getJokes)
app.get('/api/jokes/random', getRandomJoke)
