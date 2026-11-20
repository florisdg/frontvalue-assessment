import { Progress } from '@mantine/core'
import { useEffect, useEffectEvent, useState } from 'react'

export interface CountdownBarProps {
  countdown: number
  running: boolean
  onElapsed: (signal: AbortSignal) => Promise<void>
}

/** Fills over each countdown and runs one cancellable callback when it elapses. */
export function CountdownBar({ countdown, running, onElapsed }: CountdownBarProps) {
  const [elapsed, setElapsed] = useState(0)
  const completeCountdown = useEffectEvent(onElapsed)

  useEffect(() => {
    if (!running) return

    let secondsElapsed = 0
    let pending: AbortController | undefined

    /** Skips overlaps and lets the next countdown retry failures. */
    async function runCallback() {
      if (pending) return
      pending = new AbortController()
      try {
        await completeCountdown(pending.signal)
      } catch {
        // The next countdown will try again.
      } finally {
        pending = undefined
      }
    }

    const timer = window.setInterval(() => {
      secondsElapsed = (secondsElapsed + 1) % countdown
      setElapsed(secondsElapsed)
      if (secondsElapsed === 0) void runCallback()
    }, 1000)

    return () => {
      window.clearInterval(timer)
      pending?.abort()
    }
  }, [countdown, running])

  return (
    <Progress
      flex={1}
      maw={240}
      value={running ? (elapsed / countdown) * 100 : 0}
      aria-label="Next joke countdown"
      animated
    />
  )
}
