import { AppShell, Burger, Group, NavLink, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { ReactNode } from 'react'

export interface AppLayoutProps {
  children: ReactNode
  page: 'home' | 'favorites'
}

/** Adds a header and responsive navigation around the page content. */
export function AppLayout({ children, page }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure()

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 240, breakpoint: 'sm' }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
            aria-expanded={opened}
            aria-controls="main-navigation"
          />
          <Text fw={600}>Frontvalue Assessment</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar id="main-navigation" aria-label="Main navigation" visibleFrom={opened ? undefined : 'sm'} p="md">
        <NavLink
          href="#home"
          label="Home"
          active={page === 'home'}
          aria-current={page === 'home' ? 'page' : undefined}
          onClick={close}
        />
        <NavLink
          href="#favorites"
          label="Favorites"
          active={page === 'favorites'}
          aria-current={page === 'favorites' ? 'page' : undefined}
          onClick={close}
        />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
