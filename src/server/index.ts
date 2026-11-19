import { app } from './app.ts'

app.listen(3000).once('listening', () => {
  console.log('Express listening on http://localhost:3000')
})
