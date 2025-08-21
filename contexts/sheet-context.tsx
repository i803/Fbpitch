"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface SheetContextType {
  isNavbarSheetOpen: boolean
  setNavbarSheetOpen: (open: boolean) => void
  isSidebarSheetOpen: boolean
  setSidebarSheetOpen: (open: boolean) => void
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [isNavbarSheetOpen, setNavbarSheetOpen] = useState(false)
  const [isSidebarSheetOpen, setSidebarSheetOpen] = useState(false)

  return (
    <SheetContext.Provider
      value={{
        isNavbarSheetOpen,
        setNavbarSheetOpen,
        isSidebarSheetOpen,
        setSidebarSheetOpen,
      }}
    >
      {children}
    </SheetContext.Provider>
  )
}

export function useSheetContext() {
  const context = useContext(SheetContext)
  if (context === undefined) {
    throw new Error("useSheetContext must be used within a SheetProvider")
  }
  return context
}
