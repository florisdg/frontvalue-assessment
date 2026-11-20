import { useEffect, useState } from 'react'
import { AppLayout } from './components/AppLayout.tsx'

/** Shows the Express greeting after the page loads. */
export default function App() {
  const [message, setMessage] = useState('Loading…')

  useEffect(() => {
    const request = new AbortController()

    fetch('/api/hello', { signal: request.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.text()
      })
      .then(setMessage)
      .catch(() => {
        if (request.signal.aborted) return
        setMessage('Could not load the Express greeting.')
      })

    return () => request.abort()
  }, [])

  return (
    <AppLayout>
      <h1>Hello react</h1>
      <p role="status">{message}</p>
    </AppLayout>
  )
}
