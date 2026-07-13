import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
      set: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    { name: 'cloudcanvas-theme' }
  )
)

// Apply persisted theme immediately on import (before React renders)
applyTheme((JSON.parse(localStorage.getItem('cloudcanvas-theme') || '{}').state?.theme) ?? 'dark')
