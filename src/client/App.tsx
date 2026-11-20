import { Title } from '@mantine/core'
import { AppLayout } from './components/AppLayout.tsx'
import { JokeList } from './components/JokeList.tsx'

/** Renders the Chuck Norris jokes page. */
export default function App() {
  return (
    <AppLayout>
      <Title mb="md">Chuck Norris jokes</Title>
      <JokeList />
    </AppLayout>
  )
}
