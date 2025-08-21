"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/* --------------------------------------------------------------------------
   Types
---------------------------------------------------------------------------- */
type ApiProduct = {
  _id?: string
  id?: string
  name?: string
  price?: number | string
  image?: string
  categories?: string[]
}

export type Product = {
  id: string
  name: string
  price: number
  image?: string
  categories?: string[]
  _raw?: ApiProduct
}

type Category = { id: string; name: string; filter: string }

/* Utility: normalize any API product into a safe Product with required fields */
function normalizeProduct(p: ApiProduct): Product | null {
  const idSource = p._id ?? p.id
  if (!idSource) return null
  const name = (p.name ?? "").toString()
  let priceNum = 0
  if (typeof p.price === "string") priceNum = Number.parseFloat(p.price)
  else if (typeof p.price === "number") priceNum = p.price
  return {
    id: String(idSource),
    name,
    price: Number.isFinite(priceNum) ? priceNum : 0,
    image: p.image ?? "",
    categories: Array.isArray(p.categories) ? p.categories : [],
    _raw: p,
  }
}

/* --------------------------------------------------------------------------
   Page: HomePage
---------------------------------------------------------------------------- */

export default function HomePage() {
  // Cart / data state
  const [cartItemCount, setCartItemCount] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const productsRef = useRef<Product[]>([])
  useEffect(() => {
    productsRef.current = products
  }, [products])

  // Hero parallax
  const [parallax, setParallax] = useState(0)

  // Category bar scroll
  const categoryContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // animation refs so we can cancel ongoing animations
  const windowScrollAnimationRef = useRef<number | null>(null)
  const categoryScrollAnimationRef = useRef<number | null>(null)

  // Categories
  const categories: Category[] = [
    { id: "all", name: "All Jerseys", filter: "" },
    { id: "new-arrivals", name: "New Arrivals", filter: "NEW ARRIVALS" },
    { id: "retro", name: "Retro", filter: "RETRO" },
    { id: "special-kits", name: "Special Kits", filter: "SPECIAL KITS" },
    { id: "kids", name: "Kits For Kids", filter: "KITS FOR KIDS" },
    { id: "national", name: "National Kits", filter: "NATIONAL TEAM" },
  ]

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        setProducts([])
        setFilteredProducts([])
        return
      }
      const data = (await response.json()) as { products?: ApiProduct[] }
      const rawList = data?.products ?? []
      // prefer optional chaining in predicate
      const normalized = rawList.map(normalizeProduct).filter((p): p is Product => Boolean(p?.id))
      setProducts(normalized)
      setFilteredProducts(normalized)
    } catch (error) {
      // handle the exception: log + fallback state
      // this is intentional: we report the error and present an empty list to the user
      // to avoid swallowing errors silently.
      // eslint-disable-next-line no-console
      console.error("Error fetching products:", error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Category filter
  const filterByCategory = useCallback(
    (categoryFilter: string) => {
      if (!categoryFilter) {
        setFilteredProducts(products)
        return
      }
      const filtered = products.filter((product) => product.categories?.includes(categoryFilter))
      setFilteredProducts(filtered)
    },
    [products]
  )

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    const category = categories.find((cat) => cat.id === categoryId)
    if (category) filterByCategory(category.filter)
  }

  // Small easing function
  const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

  // Helper: returns the page's scroll root element (document.scrollingElement preferred)
  // avoid unnecessary assertions by checking instances explicitly
  const getScrollRoot = useCallback((): HTMLElement | null => {
    if (typeof document === "undefined") return null
    if (document.scrollingElement instanceof HTMLElement) return document.scrollingElement
    if (document.documentElement instanceof HTMLElement) return document.documentElement
    if (document.body instanceof HTMLElement) return document.body
    return null
  }, [])

  // Utility: try native smooth scroll on the root (returns true if used)
  const tryNativeRootSmooth = (root: HTMLElement, targetY: number) => {
    try {
      // modern browsers support behavior option
      if ("scrollBehavior" in document.documentElement.style && typeof root.scrollTo === "function") {
        root.scrollTo({ top: Math.round(targetY), left: 0, behavior: "smooth" as ScrollBehavior })
        return true
      }
    } catch (e) {
      // log for diagnostics (handled)
      // eslint-disable-next-line no-console
      console.debug("tryNativeRootSmooth failed:", e)
    }
    return false
  }

  // Utility: smooth scroll window/root to a Y position (JS fallback)
  // This implementation intentionally updates the document scrolling element's scrollTop
  // using an eased rAF loop to mimic a natural, user-like scroll feeling.
  const smoothScrollWindowTo = useCallback((targetY: number, duration = 600) => {
    // Respect reduced motion
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      window.scrollTo(0, Math.round(targetY))
      return
    }

    const root = getScrollRoot()
    if (!root) {
      // fallback
      window.scrollTo(0, Math.round(targetY))
      return
    }

    // Try native first for best performance / platform behavior
    const usedNative = tryNativeRootSmooth(root, targetY)
    if (usedNative) return

    // Cancel existing animation
    if (windowScrollAnimationRef.current) {
      cancelAnimationFrame(windowScrollAnimationRef.current)
      windowScrollAnimationRef.current = null
    }

    // Implement rAF-based eased scroll (easeInOutQuad)
    const startTop = root.scrollTop
    const distance = targetY - startTop
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutQuad(progress)

      // Compute next top; use Math.round to avoid jitter from fractional pixels,
      // but keep values smooth across frames
      const nextTop = Math.round(startTop + distance * eased)

      // Apply to scroll root (consistent across browsers)
      root.scrollTop = nextTop

      if (elapsed < duration) {
        windowScrollAnimationRef.current = requestAnimationFrame(step)
      } else {
        windowScrollAnimationRef.current = null
      }
    }

    windowScrollAnimationRef.current = requestAnimationFrame(step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getScrollRoot])

  // Utility: try native container smooth (returns true if used)
  const tryNativeContainerSmooth = (container: HTMLElement, left: number) => {
    try {
      if ("scrollBehavior" in document.documentElement.style && typeof container.scrollTo === "function") {
        container.scrollTo({ left: Math.round(left), behavior: "smooth" as ScrollBehavior })
        return true
      }
    } catch (e) {
      // log and fallback
      // eslint-disable-next-line no-console
      console.debug("tryNativeContainerSmooth failed:", e)
    }
    return false
  }

  // Utility: smooth scroll a container horizontally to a given scrollLeft value (JS fallback)
  const smoothScrollContainerTo = (container: HTMLElement, targetScrollLeft: number, duration = 500) => {
    // Respect reduced motion
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      container.scrollLeft = Math.round(targetScrollLeft)
      return
    }

    // Try native first
    if (tryNativeContainerSmooth(container, targetScrollLeft)) return

    // Cancel any ongoing category animation
    if (categoryScrollAnimationRef.current) {
      cancelAnimationFrame(categoryScrollAnimationRef.current)
      categoryScrollAnimationRef.current = null
    }

    const startLeft = container.scrollLeft
    const distance = targetScrollLeft - startLeft
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutQuad(progress)
      container.scrollLeft = Math.round(startLeft + distance * eased)
      if (elapsed < duration) {
        categoryScrollAnimationRef.current = requestAnimationFrame(step)
      } else {
        categoryScrollAnimationRef.current = null
      }
    }

    categoryScrollAnimationRef.current = requestAnimationFrame(step)
  }

  // Category scroll helpers
  const checkScrollButtons = useCallback(() => {
    const container = categoryContainerRef.current
    if (!container) return
    const atStart = container.scrollLeft <= 0
    // ensure using floor/ceil to avoid off-by-one due to fractional widths
    const atEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= Math.floor(container.scrollWidth)
    setCanScrollLeft(!atStart)
    setCanScrollRight(!atEnd)
  }, [])

  // Updated: custom smooth horizontal scroll for categories
  const scrollCategories = (direction: "left" | "right") => {
    const container = categoryContainerRef.current
    if (!container) return
    const amount = Math.max(200, Math.floor(container.clientWidth * 0.6))
    // clamp target so container.scrollLeft + clientWidth never exceeds scrollWidth
    const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const target =
      direction === "left"
        ? Math.max(0, container.scrollLeft - amount)
        : Math.min(maxLeft, container.scrollLeft + amount)
    smoothScrollContainerTo(container, target, 450)
  }

  // Smooth scroll to categories (easeInOutQuad, 600ms)
  // UPDATED: uses measured header height so the target is not hidden behind sticky header
  const scrollToCategories = useCallback(() => {
    const section = document.getElementById("shop-by-category")
    if (!section) return

    // Measure header height at time of click. Prefer the fixed header wrapper if present,
    // otherwise fall back to the first <header> element.
    const headerWrapperEl = document.querySelector("[data-fbpitch-header-wrapper]") as HTMLElement | null
    const headerEl = headerWrapperEl ?? document.querySelector("header")
    const headerHeight = headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 68

    const rect = section.getBoundingClientRect()
    const EXTRA_OFFSET = 12 // small gap so content isn't flush against header

    // Compute absolute target relative to document scroll root.
    // We use window.scrollY + rect.top to handle visual viewport offsets.
    const targetPosition = rect.top + window.scrollY - headerHeight - EXTRA_OFFSET

    // Final clamp: don't allow negative
    const finalTarget = Math.max(0, Math.round(targetPosition))

    // Use our custom smooth scroll to make it "feel like the user scrolled"
    smoothScrollWindowTo(finalTarget, 600)
  }, [smoothScrollWindowTo])

  // Search handler extracted to top-level to reduce nesting
  const handleSearchEvent = useCallback((event: Event) => {
    const custom = event as unknown as CustomEvent<string>
    const query = (custom.detail ?? "").toLowerCase().trim()
    if (!query) {
      setFilteredProducts(productsRef.current)
      setSelectedCategory("all")
      return
    }
    const base = productsRef.current ?? []
    const filtered = base.filter((product) => {
      const q = query
      return product.name.toLowerCase().includes(q) || product.categories?.some((cat) => cat.toLowerCase().includes(q))
    })
    setFilteredProducts(filtered)
    setSelectedCategory("all")
  }, [])

  useEffect(() => {
    let savedCartCount = localStorage.getItem("cartItemCount")
    savedCartCount ??= "0"
    const initialCount = Number.parseInt(savedCartCount)
    if (Number.isFinite(initialCount)) setCartItemCount(initialCount)

    fetchProducts()

    window.addEventListener("searchProducts", handleSearchEvent as EventListener)
    return () => window.removeEventListener("searchProducts", handleSearchEvent as EventListener)
  }, [fetchProducts, handleSearchEvent])

  // keep filtered in sync
  useEffect(() => {
    setFilteredProducts(products)
    productsRef.current = products
  }, [products])

  // observe category bar
  useEffect(() => {
    checkScrollButtons()
    const onResize = () => checkScrollButtons()
    window.addEventListener("resize", onResize)

    const container = categoryContainerRef.current
    let ro: ResizeObserver | null = null
    if (container && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => checkScrollButtons())
      ro.observe(container)
    }

    return () => {
      window.removeEventListener("resize", onResize)
      if (ro && container) ro.unobserve(container)
    }
  }, [checkScrollButtons])

  // parallax
  useEffect(() => {
    const onScroll = () => {
      const y = Math.min(30, window.scrollY * 0.15)
      setParallax(y)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // cart actions
  const handleAddToCart = (productId: string) => {
    const newCount = cartItemCount + 1
    setCartItemCount(newCount)
    localStorage.setItem("cartItemCount", newCount.toString())
    const existingCart: any[] = JSON.parse(localStorage.getItem("cartItems") ?? "[]")
    const product = products.find((p) => p.id === productId)
    if (product) {
      const cartItem = {
        id: Date.now().toString(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: "M",
        quality: "Premium",
        patch: "N/A",
        customName: "",
        instagramHandle: "",
        quantity: 1,
        totalPrice: product.price,
      }
      existingCart.push(cartItem)
      localStorage.setItem("cartItems", JSON.stringify(existingCart))
      window.dispatchEvent(new Event("cartUpdated"))
    }
    console.log(`Added product ${productId} to cart`)
  }

  /**
   * HEADER STICKY WRAPPER:
   *
   * We create a fixed wrapper that contains the shared <Header />. Then we measure
   * its height and render an invisible spacer of the same height so the page flow
   * remains exactly the same (no jumps). This keeps the header appearance and
   * behaviour (hamburger, overlays) untouched while making it follow the user.
   */
  const headerWrapperRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(0)

  useEffect(() => {
    const measure = () => {
      const el = headerWrapperRef.current
      if (el) {
        // take bounding height rounded to integer
        const h = Math.ceil(el.getBoundingClientRect().height)
        setHeaderHeight(h)
      } else {
        setHeaderHeight(68)
      }
    }

    // measure after mount
    measure()

    // observe size changes if header content changes (e.g., responsive)
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined" && headerWrapperRef.current) {
      ro = new ResizeObserver(measure)
      ro.observe(headerWrapperRef.current)
    }

    window.addEventListener("resize", measure)
    return () => {
      window.removeEventListener("resize", measure)
      if (ro && headerWrapperRef.current) ro.unobserve(headerWrapperRef.current)
    }
  }, [])

  /**
   * Close-icon positioning shim:
   *
   * Some header implementations render a close ("X") button when the mobile
   * menu is open. The visual requirement is to have the X appear exactly where
   * the hamburger icon was (no layout shift), and to transition smoothly into
   * view. The header component is left untouched; here we observe DOM changes
   * inside the header wrapper and, when a close button is present, we compute
   * the hamburger's position and apply inline positioning to the close button.
   *
   * This approach avoids modifying the header implementation while ensuring
   * the X visually overlays the prior hamburger location with a transition.
   */
  const positionCloseIcon = useCallback(() => {
    const wrapper = headerWrapperRef.current ?? document.querySelector("header")
    if (!wrapper) return

    try {
      // find the open and close menu buttons by common ARIA labels used in examples.
      // If your header uses different labels, adjust these selectors accordingly.
      const openBtn = wrapper.querySelector<HTMLElement>(
        'button[aria-label="Open menu"], button[aria-label="open menu"], button[aria-label="Open navigation"], button[aria-label="Toggle menu"]'
      )
      const closeBtn = wrapper.querySelector<HTMLElement>('button[aria-label="Close menu"], button[aria-label="close menu"], button[aria-label="Close navigation"]')

      if (!openBtn || !closeBtn) {
        // also try toggled aria-label pattern (same button toggles label)
        // if there's only one button that toggles label we don't reposition.
        return
      }

      const wrapperRect = wrapper.getBoundingClientRect()
      const openRect = openBtn.getBoundingClientRect()

      // compute coordinates relative to wrapper
      const left = Math.round(openRect.left - wrapperRect.left)
      const top = Math.round(openRect.top - wrapperRect.top)

      // apply inline styles to place the close button exactly over the hamburger
      // while preserving its original size. We add a subtle transition for transform/opacity.
      closeBtn.style.position = "absolute"
      closeBtn.style.left = `${left}px`
      closeBtn.style.top = `${top}px`
      closeBtn.style.width = `${Math.round(openRect.width)}px`
      closeBtn.style.height = `${Math.round(openRect.height)}px`
      closeBtn.style.display = "inline-flex"
      closeBtn.style.alignItems = "center"
      closeBtn.style.justifyContent = "center"
      closeBtn.style.transition = "transform 220ms cubic-bezier(.2,.9,.2,1), opacity 180ms ease"
      // Ensure it is on top visually
      closeBtn.style.zIndex = "9999"
    } catch (err) {
      // handle exception explicitly to satisfy static analysis
      // eslint-disable-next-line no-console
      console.debug("positionCloseIcon failed:", err)
    }
  }, [])

  useEffect(() => {
    const wrapper = headerWrapperRef.current ?? document.querySelector("header")
    if (!wrapper) return

    // Run once in case DOM already present
    positionCloseIcon()

    // Observe changes inside header wrapper to reposition when mobile menu toggles
    const mo = new MutationObserver(() => {
      positionCloseIcon()
    })

    mo.observe(wrapper, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-expanded", "aria-hidden", "style"] })

    // Reposition on resize / orientation change
    window.addEventListener("resize", positionCloseIcon)
    window.addEventListener("orientationchange", positionCloseIcon)

    return () => {
      mo.disconnect()
      window.removeEventListener("resize", positionCloseIcon)
      window.removeEventListener("orientationchange", positionCloseIcon)
    }
    // Header wrapper is stable; no dependency to avoid repeated observers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionCloseIcon])

  // DEV ONLY: expose the scroll function for console testing without affecting UI.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      ;(window as any).__scrollToCategories = scrollToCategories
    }
    return () => {
      if (process.env.NODE_ENV !== "production") {
        try {
          delete (window as any).__scrollToCategories
        } catch {
          // ignore deletion errors
        }
      }
    }
  }, [scrollToCategories])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* spacer — ensures no jump when header fixed */}
        <div aria-hidden style={{ height: `${headerHeight || 68}px` }} />

        {/* fixed wrapper that makes header follow the user */}
        <div
          ref={headerWrapperRef}
          data-fbpitch-header-wrapper
          style={{ position: "fixed", top: 0, left: 0, right: 0 }}
          className="z-50"
          aria-hidden={false}
        >
          <Header cartItemCount={cartItemCount} />
        </div>

        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  // Render
  return (
    <div className="min-h-screen bg-background">
      {/* spacer so content doesn't sit under fixed header (height measured) */}
      <div aria-hidden style={{ height: `${headerHeight || 68}px` }} />

      {/* fixed wrapper: keeps header visible on scroll without altering appearance */}
      <div
        ref={headerWrapperRef}
        data-fbpitch-header-wrapper
        style={{ position: "fixed", top: 0, left: 0, right: 0 }}
        className="z-50"
        aria-hidden={false}
      >
        <Header cartItemCount={cartItemCount} />
      </div>

      {/* HERO */}
      <section
        className="relative w-full h-[85svh] min-h-[560px] flex items-center justify-center overflow-hidden pt-8 pb-24 md:pb-28"
        aria-label="Premium Football Jerseys Hero"
      >
        <div
          className="absolute inset-0 bg-cover bg-center will-change-transform scale-[1.05]"
          style={{
            backgroundImage: "url('/football-jerseys-collection.png')",
            transform: `translateY(${parallax}px) scale(1.05)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/20" />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_50%_40%,transparent_0,transparent_45%,rgba(0,0,0,0.5)_100%)]" />

        <div className="relative z-10 max-w-4xl animate-fade-up px-6 text-center text-white">
          <div className="mb-6 hidden sm:block">
            <Image src="/images/fbpitch-logo.png" alt="FbPitch" width={420} height={160} className="mx-auto opacity-95 drop-shadow-lg" priority />
          </div>

          <div className="inline-block rounded-xl bg-black/20 px-4 py-2 backdrop-blur-sm">
            <div className="relative inline-block">
              <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl [text-shadow:_0_2px_10px_rgba(0,0,0,.45)]" style={{ backfaceVisibility: "hidden", transform: "translateZ(0)", WebkitFontSmoothing: "antialiased" }}>
                Premium Football Jerseys
              </h1>
              <span aria-hidden className="pointer-events-none absolute inset-0 -skew-x-12" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 80%)", animation: "shimmer 3.5s ease-in-out infinite", mixBlendMode: "overlay" }} />
            </div>
          </div>

          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-150%) skewX(-12deg); }
              100% { transform: translateX(150%) skewX(-12deg); }
            }
            @keyframes fade-up {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-up { animation: fade-up 0.9s ease-out forwards; }
          `}</style>

          <p className="mx-auto mb-8 mt-4 max-w-2xl text-base leading-relaxed text-gray-200/95 md:text-xl">Authentic designs, premium quality, worldwide shipping.</p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              type="button"
              onClick={scrollToCategories}
              className="rounded-full bg-white px-8 py-3 text-lg text-black shadow-xl transition-transform duration-300 hover:scale-[1.07] hover:bg-neutral-200 active:bg-neutral-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="container mx-auto scroll-mt-28 px-4 py-16 md:scroll-mt-32">
        <div className="mb-16">
          <div id="shop-by-category" className="mb-8 text-center">
            <h3 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Shop by Category</h3>
            <p className="text-muted-foreground">Find the perfect jersey for every occasion</p>
          </div>

          {/* Category bar */}
          <div className="relative mx-auto mb-10 max-w-6xl">
            {canScrollLeft && (
              <button
                type="button"
                aria-label="Scroll categories left"
                onClick={() => scrollCategories("left")}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow backdrop-blur-sm hover:bg-muted md:hidden"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              id="category-scroll"
              ref={categoryContainerRef}
              onScroll={checkScrollButtons}
              className="-mx-4 flex gap-3 overflow-x-auto overflow-y-hidden px-4 py-2 thin-scroll md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:py-0 lg:grid-cols-6"
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleCategorySelect(category.id)}
                    className={`h-11 rounded-xl border-2 px-4 text-sm font-medium transition-all duration-300 md:h-12 ${
                      isSelected
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-lg"
                        : "flex-shrink-0 bg-background/80 backdrop-blur-sm hover:scale-105 hover:shadow-md md:flex-shrink border-border/50 hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    {category.name}
                  </Button>
                )
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                aria-label="Scroll categories right"
                onClick={() => scrollCategories("right")}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow backdrop-blur-sm hover:bg-muted md:hidden"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Title + subtitle */}
          <div className="mb-10 px-3 text-center sm:mb-12">
            <h2 className="mb-2 text-2xl font-bold leading-snug text-foreground sm:mb-4 sm:text-3xl">
              {selectedCategory === "all" ? "Featured Jerseys" : categories.find((cat) => cat.id === selectedCategory)?.name}
            </h2>
            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
              {selectedCategory === "all"
                ? "Discover our most popular football jerseys"
                : `Browse our ${categories.find((cat) => cat.id === selectedCategory)?.name?.toLowerCase() ?? ""} collection`}
            </p>
            {filteredProducts.length !== products.length && (
              <p className="mt-2 text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} jerseys
              </p>
            )}
          </div>

          {/* Products */}
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-lg text-muted-foreground">No products available at the moment.</p>
              <p className="text-sm text-muted-foreground">Please check back later or contact support.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, id: product.id ?? "", image: product.image ?? "/placeholder.png" }}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && products.length > 0 && (
                <div className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">No jerseys found in this category.</p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => handleCategorySelect("all")}>
                    Show All Jerseys
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/50 bg-card/50 py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            <div className="text-center md:text-left">
              <div className="mb-6">
                <Image src="/images/fbpitch-logo.png" alt="FbPitch" width={140} height={56} className="mx-auto mb-4 md:mx-0" />
              </div>
              <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground md:mx-0">
                Your premier destination for authentic football jerseys and sports apparel. Quality guaranteed with worldwide shipping and exceptional customer service.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground transition-colors hover:text-primary">
                  <span className="text-primary">📧</span>
                  <span>support@fbpitch.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground transition-colors hover:text-primary">
                  <span className="text-primary">📞</span>
                  <span>+965 1234 5678</span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="mb-6 text-lg font-semibold text-foreground">Support</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/care" className="text-muted-foreground hover:text-primary">
                    Care Guide
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="text-muted-foreground hover:text-primary">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-muted-foreground hover:text-primary">
                    Your Cart
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center md:text-left">
              <h4 className="mb-6 text-lg font-semibold text-foreground">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="text-muted-foreground hover:text-primary">
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-top mt-12 border-border/50 pt-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <p className="text-center text-sm text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} FbPitch. All rights reserved.
              </p>
              <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                <div className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="text-primary">🚚</span>
                  <span>Free shipping over KWD 10</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="text-primary">🔒</span>
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="text-primary">⚡</span>
                  <span>Fast delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* (optional, TS dev convenience) declare the debug handle to avoid TS errors if you
   want to call __scrollToCategories() from the console in development. */
declare global {
  interface Window {
    __scrollToCategories?: () => void
  }
}
