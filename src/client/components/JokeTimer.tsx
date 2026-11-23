import { Button, Group } from '@mantine/core'
import { useState } from 'react'
import { CountdownBar } from './CountdownBar.tsx'

const COUNTDOWN_SECONDS = 5

export interface JokeTimerProps {
  onTick: (signal: AbortSignal) => Promise<void>
}

/** Lets the user start and stop the joke countdown. */
export function JokeTimer({ onTick }: JokeTimerProps) {
  const [running, setRunning] = useState(false)

  return (
    <Group mb="md">
      <Button onClick={() => setRunning((current) => !current)} title="Fetch a random joke every 5 seconds">
        {running ? '⏹️ Stop timer' : '▶️ Start timer'}
      </Button>
      <CountdownBar key={String(running)} countdown={COUNTDOWN_SECONDS} running={running} onElapsed={onTick} />
    </Group>
  )
}
