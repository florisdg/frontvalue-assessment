import { resolve } from 'node:path'
import { createApp } from './app.ts'

const clientDirectory = process.argv.includes('--serve-client')
  ? resolve(import.meta.dirname, '../../client/dist')
  : undefined
const app = createApp(clientDirectory)

app.listen(3000).once('listening', () => {
  console.log('Express listening on http://localhost:3000')
})
