import { useEffect, useState } from 'react'

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
    <main>
      <h1>Hello react</h1>
      <p role="status">{message}</p>
    </main>
  )
}
