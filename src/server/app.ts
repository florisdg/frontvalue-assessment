import express from 'express'

/** Express application for the browser API. */
export const app = express()

app.get('/api/hello', (_request, response) => {
  response.type('text/plain').send('hello from express')
})
