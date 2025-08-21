"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, ShoppingCart, X, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  readonly cartItemCount?: number
}

/**
 * Header
 *
 * Changes made:
 * - Ensured header is sticky (keeps existing sticky class but strengthened behavior).
 * - Implemented a small debounced real-time search dispatcher:
 *    • typing dispatches a CustomEvent("searchProducts", { detail })
 *    • clearing the input immediately dispatches an empty string so page restores all products
 * - Kept all existing toggles (sidebar, navbar/user-drawer, mobile search) and
 *   preserved the original markup & accessibility behavior.
 *
 * Notes:
 * - This header intentionally does not itself fetch or filter products — it dispatches
 *   the event for the page to handle (matching your existing app pattern). That keeps
 *   behavior consistent with the rest of your codebase.
 */

export function Header({ cartItemCount: propCartItemCount }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItemCount, setCartItemCount] = useState<number>(propCartItemCount ?? 0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNavbarOpen, setIsNavbarOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; role: string; name: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // --- Helpers ---
  const updateCartCount = useCallback(() => {
    const savedCartCount = localStorage.getItem("cartItemCount")
    if (savedCartCount) {
      const parsed = Number.parseInt(savedCartCount)
      if (Number.isFinite(parsed)) setCartItemCount(parsed)
    }
  }, [])

  const checkAuthState = useCallback(() => {
    const isAuth = localStorage.getItem("isAuthenticated")
    const userStr = localStorage.getItem("user")

    if (isAuth === "true" && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setUser(null)
        setIsAuthenticated(false)
      }
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  // --- Debounce utility for search (keeps events from spamming)
  const debounceRef = useRef<number | undefined>(undefined)
  const debouncedDispatch = useCallback((value: string, delay = 250) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      // Dispatch site-wide search event
      window.dispatchEvent(new CustomEvent("searchProducts", { detail: value }))
    }, delay)
  }, [])

  // --- Effects ---
  useEffect(() => {
    // Initial load
    updateCartCount()
    checkAuthState()

    // Storage listener
    const storageListener = (e: StorageEvent) => {
      if (e.key === "cartItemCount") updateCartCount()
      if (e.key === "isAuthenticated" || e.key === "user") checkAuthState()
    }
    window.addEventListener("storage", storageListener)

    // Custom events
    window.addEventListener("cartUpdated", updateCartCount)
    window.addEventListener("authUpdated", checkAuthState)

    return () => {
      window.removeEventListener("storage", storageListener)
      window.removeEventListener("cartUpdated", updateCartCount)
      window.removeEventListener("authUpdated", checkAuthState)
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [updateCartCount, checkAuthState])

  useEffect(() => {
    if (propCartItemCount !== undefined) {
      setCartItemCount(propCartItemCount)
    }
  }, [propCartItemCount])

  // --- Search handler (real-time) ---
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    // If cleared, immediately dispatch an empty search so pages restore all products
    if (!query || query.trim() === "") {
      // clear any pending debounce and immediately dispatch
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
        debounceRef.current = undefined
      }
      window.dispatchEvent(new CustomEvent("searchProducts", { detail: "" }))
      return
    }

    // Otherwise debounce dispatch to avoid too many events
    debouncedDispatch(query.trim())
  }

  // --- Toggles ---
  const toggleSidebar = () => setIsSidebarOpen((s) => !s)
  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleNavbar = () => setIsNavbarOpen((s) => !s)
  const closeNavbar = () => setIsNavbarOpen(false)
  const toggleMobileSearch = () => setIsMobileSearchOpen((s) => !s)
  const closeMobileSearch = () => setIsMobileSearchOpen(false)

  // --- Keyboard ---
  const handleSidebarKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleSidebar()
    }
  }
  const handleNavbarKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleNavbar()
    }
  }
  const handleMobileSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") closeMobileSearch()
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggleMobileSearch()
    }
  }

  // --- Sign out ---
  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
    closeNavbar()
    window.dispatchEvent(new Event("authUpdated"))
  }

  // --- Navigation items ---
  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Return Policy", href: "/return-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Contact Us", href: "/contact" },
    { name: "Care Instructions", href: "/care" },
  ]

  return (
    <>
      {/* Header */}
      {/* sticky is preserved; z-index and backdrop-blur help it stay on top and readable */}
      <header
        className="sticky top-0 z-50 w-full bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-md shadow-sm"
        // reinforce sticky behavior with inline style (doesn't change appearance)
        style={{ position: "sticky", top: 0, zIndex: 50 }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3 md:gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-expanded={isSidebarOpen}
                aria-controls="site-sidebar"
                className="p-2 md:p-3"
              >
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>

              <Link href="/" className="flex items-center" aria-label="Go to homepage">
                <Image
                  src="/images/fbpitch-logo.png"
                  alt="FbPitch"
                  width={280}
                  height={180}
                  className="h-20 w-auto sm:h-14 md:h-16 lg:h-20"
                  priority
                />
              </Link>
            </div>

            {/* Center: Desktop search */}
            <div className="hidden md:flex flex-1 justify-center px-4">
              <div className="w-full max-w-lg">
                <label htmlFor="header-search" className="sr-only">
                  Search jerseys
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="header-search"
                    type="search"
                    placeholder="Search jerseys..."
                    className="pl-10 pr-4 rounded-full h-11 bg-card/60 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    aria-label="Search jerseys"
                  />
                </div>
              </div>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Mobile search button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden p-2"
                onClick={toggleMobileSearch}
                aria-expanded={isMobileSearchOpen}
                aria-controls="mobile-search"
              >
                <Search className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Search</span>
              </Button>

              {/* Cart */}
              <Link href="/cart" aria-label="View cart">
                <Button variant="ghost" size="icon" className="relative p-2 md:p-3">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  {cartItemCount > 0 && (
                    <span
                      aria-live="polite"
                      className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </Link>

              {/* User/drawer */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNavbar}
                aria-expanded={isNavbarOpen}
                aria-controls="user-drawer"
                className="p-2 md:p-3"
              >
                <User className="h-5 w-5 md:h-6 md:w-6" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Mobile search overlay --- */}
      {isMobileSearchOpen && (
        <>
          <div
            id="mobile-search"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeMobileSearch}
            role="button"
            tabIndex={0}
            onKeyDown={handleMobileSearchKeyDown}
            aria-label="Close search overlay"
          />
          <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-background border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search jerseys..."
                    className="pl-12 pr-4 rounded-full h-11 bg-card/60 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                    aria-label="Search jerseys"
                  />
                </div>

                <Button variant="ghost" size="icon" onClick={closeMobileSearch} className="p-2">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close search</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Sidebar overlay (left) --- */}
      {isSidebarOpen && (
        <div
          id="site-sidebar-overlay"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={handleSidebarKeyDown}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* --- Sidebar --- */}
      <aside
        id="site-sidebar"
        className={`fixed top-0 left-0 z-50 h-full w-80 transform transition-transform duration-300 ease-in-out bg-background border-r border-border ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isSidebarOpen}
        aria-label="Primary navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <div />
            <Button variant="ghost" size="icon" onClick={closeSidebar} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex justify-center mb-6 px-4">
            <Image
              src="/images/fbpitch-logo.png"
              alt="FbPitch"
              width={280}
              height={112}
              className="h-24 w-auto object-contain"
            />
          </div>

          <nav className="flex-1 px-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Navigation</h3>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* --- User drawer --- */}
      <aside
        id="user-drawer"
        className={`fixed top-0 right-0 z-50 h-full w-80 transform transition-transform duration-300 ease-in-out bg-background border-l border-border ${
          isNavbarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isNavbarOpen}
        aria-label="User menu"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <div />
            <Button variant="ghost" size="icon" onClick={closeNavbar} aria-label="Close user menu">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex justify-center mb-6 px-4">
            <Image
              src="/images/fbpitch-logo.png"
              alt="FbPitch"
              width={280}
              height={112}
              className="h-24 w-auto object-contain"
            />
          </div>

          {isAuthenticated && user ? (
            <div className="flex flex-col items-center mb-8 px-6">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">0</span>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome back!</h2>
              <p className="text-lg font-medium text-foreground mb-1 capitalize">{user.role}</p>
              <p className="text-sm text-muted-foreground text-center mb-6">{user.email}</p>

              <div className="flex flex-col gap-3 w-full">
                {user.role === "admin" && (
                  <Link href="/admin" onClick={closeNavbar}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      Admin Panel
                    </Button>
                  </Link>
                )}

                <Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-8 px-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to FbPitch</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Sign in to access your account and enjoy personalized shopping experiences
              </p>

              <div className="flex flex-col gap-3 w-full">
                <Link href="/login" onClick={closeNavbar}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeNavbar}>
                  <Button variant="outline" className="w-full bg-transparent">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="p-6 border-t border-border mt-auto">
            <div className="text-xs text-muted-foreground text-center">
              <p className="mb-2">By signing up, you agree to our</p>
              <div className="flex justify-center gap-4">
                <Link href="/terms" onClick={closeNavbar} className="text-primary hover:underline">
                  Terms of Service
                </Link>
                <span>and</span>
                <Link href="/privacy" onClick={closeNavbar} className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
