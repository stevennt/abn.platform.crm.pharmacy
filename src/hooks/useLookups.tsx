'use client'

import { useState, useEffect, createContext, useContext } from 'react'

interface Lookup {
  id: number
  category: string
  value: string
  label: string
  color: string | null
  sortOrder: number
  isActive: boolean
}

interface LookupContextValue {
  lookups: Lookup[]
  loading: boolean
  getLabel: (category: string, value: string) => string
  getColor: (category: string, value: string) => string | undefined
  getByCategory: (category: string) => Lookup[]
}

const LookupContext = createContext<LookupContextValue>({
  lookups: [],
  loading: true,
  getLabel: () => '',
  getColor: () => undefined,
  getByCategory: () => [],
})

export function LookupProvider({ children }: { children: React.ReactNode }) {
  const [lookups, setLookups] = useState<Lookup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lookups')
      .then(res => res.json())
      .then(data => {
        setLookups(data.lookups || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getLabel = (category: string, value: string): string => {
    const entry = lookups.find(l => l.category === category && l.value === value)
    return entry?.label ?? value
  }

  const getColor = (category: string, value: string): string | undefined => {
    const entry = lookups.find(l => l.category === category && l.value === value && l.color)
    return entry?.color ?? undefined
  }

  const getByCategory = (category: string): Lookup[] => {
    return lookups.filter(l => l.category === category).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return (
    <LookupContext.Provider value={{ lookups, loading, getLabel, getColor, getByCategory }}>
      {children}
    </LookupContext.Provider>
  )
}

export function useLookups() {
  return useContext(LookupContext)
}
