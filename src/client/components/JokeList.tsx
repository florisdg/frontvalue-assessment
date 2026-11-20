import { List } from '@mantine/core'

/** Renders jokes in the order supplied by the caller. */
export function JokeList({ jokes }: { jokes: readonly { entryId: number; value: string }[] }) {
  return (
    <List spacing="sm" listStyleType="none">
      {jokes.map(({ entryId, value }) => (
        <List.Item key={entryId}>{value}</List.Item>
      ))}
    </List>
  )
}
