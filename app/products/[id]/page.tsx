"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/* ---------------------------------------------------------------------------------------------- */
/* Types                                                                                           */
/* ---------------------------------------------------------------------------------------------- */

type ReadonlyPageProps = Readonly<{
  params: Readonly<{ id: string }>;
}>;

interface ProductImage {
  url: string;
  width?: number;
  height?: number;
}

interface ApiProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images?: ProductImage[]; // normalized by API
  longSleevesImage?: string | null;
  shortsImage?: string | null;
  showShorts?: boolean;
  showLongSleeves?: boolean;
  patches?: string[];
  categories?: string[];
}

/* ---------------------------------------------------------------------------------------------- */
/* Small inline spinner (keeps file self-contained)                                                */
/* ---------------------------------------------------------------------------------------------- */

function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <output
        className="relative h-8 w-8"
        aria-live="polite"
        aria-label="Loading"
      >
        {/* Outer pulse */}
        <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-30 animate-ping"></div>

        {/* Middle glowing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white border-t-red-600 animate-spin"></div>

        {/* Inner football dot */}
        <div className="absolute inset-2 rounded-full bg-red-600 shadow-[0_0_10px_2px_rgba(255,0,0,0.7)]"></div>
      </output>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Page                                                                                            */
/* ---------------------------------------------------------------------------------------------- */

export default function ProductPage({ params }: ReadonlyPageProps) {
  const router = useRouter();
  const { id } = params;

  // Data
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [size, setSize] = useState("");
  const [quality, setQuality] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [selectedPatches, setSelectedPatches] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [addShorts, setAddShorts] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Header badge state
  const [cartItemCount, setCartItemCount] = useState(0);

  // Gallery state
  const [activeIndex, setActiveIndex] = useState(0);

  /* ---------------------------------- Effects ---------------------------------- */

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = (await res.json()) as { product: ApiProduct };
        setProduct(data.product);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    const saved = localStorage.getItem("cartItemCount");
    if (saved) setCartItemCount(Number(saved));
  }, [id]);

  /* ---------------------------------- Constants -------------------------------- */

  const adultSizes = ["S", "M", "L", "XL", "2XL"];
  const kidsSizes = [
    { label: "16 (3-4 years)", value: "16" },
    { label: "18 (4-5 years)", value: "18" },
    { label: "20 (5-6 years)", value: "20" },
    { label: "22 (7-8 years)", value: "22" },
    { label: "24 (9-10 years)", value: "24" },
    { label: "26 (11-12 years)", value: "26" },
    { label: "28 (12-13 years)", value: "28" },
  ];

  const availablePatches: string[] = (product?.patches ?? []).filter(
    (p): p is string => typeof p === "string" && p.length > 0
  );

  const isKidsKit = product?.categories?.includes("KITS FOR KIDS") ?? false;

  /* --------------------------------- Validators -------------------------------- */

  const validateAdult = useCallback((): string | null => {
    if (!size) return "Please select a size.";
    if (!quality) return "Please select a quality.";
    if (product?.showLongSleeves && !sleeve)
      return "Please select a sleeve length.";
    const ig = instagram.trim();
    if (!ig || !ig.startsWith("@")) return "Instagram must start with @";
    if (/\s/.test(ig)) return "Instagram handle cannot contain spaces";
    return null;
  }, [instagram, product?.showLongSleeves, quality, size, sleeve]);

  const validateKids = useCallback((): string | null => {
    if (!size) return "Please select a size.";
    const ig = instagram.trim();
    if (!ig || !ig.startsWith("@")) return "Instagram must start with @";
    if (/\s/.test(ig)) return "Instagram handle cannot contain spaces";
    return null;
  }, [instagram, size]);

  /* ---------------------------------- Pricing ---------------------------------- */

  // Pricing rules (KWD):
  // - base product.price
  // - +0.5 per selected patch
  // - +0.5 for Long Sleeve
  // - +1 for custom name/number
  // - +1 for Player Version quality
  // - +2 for addShorts
  const calculatePriceNumber = useCallback((): number => {
    if (!product) return 0;
    let extra = 0;
    extra += selectedPatches.length * 0.5;
    if (sleeve === "Long Sleeve") extra += 0.5;
    if (customName.trim()) extra += 1;
    if (quality === "Player Version") extra += 1;
    if (addShorts) extra += 2;
    return Number((Number(product.price) + extra).toFixed(3));
  }, [addShorts, customName, product, quality, selectedPatches.length, sleeve]);

  /* ---------------------------------- Gallery ---------------------------------- */

  // Build gallery from normalized images + long sleeves + shorts (deduped)
  const gallery: ProductImage[] = useMemo(() => {
    const urls: string[] = [];
    if (product?.images?.length) urls.push(...product.images.map((i) => i.url));
    if (product?.longSleevesImage) urls.push(product.longSleevesImage);
    if (product?.shortsImage) urls.push(product.shortsImage);
    const unique = Array.from(new Set(urls)).filter(Boolean);
    return unique.map((u) => ({ url: u }));
  }, [product]);

  // Ensure activeIndex stays in range if gallery changes
  useEffect(() => {
    if (activeIndex >= gallery.length) setActiveIndex(0);
  }, [activeIndex, gallery.length]);

  const selectThumb = (idx: number) => setActiveIndex(idx);

  /* --------------------------------- Patches ----------------------------------- */

  const handlePatchToggle = (patch: string) => {
    setSelectedPatches((prev) =>
      prev.includes(patch) ? prev.filter((p) => p !== patch) : [...prev, patch]
    );
  };

  /* --------------------------------- Cart ops ---------------------------------- */

  /**
   * buildCartImages implements the rules:
   *
   * - If product has 3 images (main, longSleeves, shorts) and addShorts:
   *     -> [jerseyImage, shortsImage] where jerseyImage is longSleevesImage if sleeve === "Long Sleeve" else main
   * - If product has 3 images and addShorts + sleeve === "Long Sleeve":
   *     -> [longSleevesImage, shortsImage]
   * - If only long sleeves chosen (and shorts not requested):
   *     -> [longSleevesImage]
   * - If product has 2 images (main, shorts) and addShorts:
   *     -> [main, shorts]
   * - Otherwise default to single main jersey image.
   */
  const buildCartImages = useCallback(
    (opts: {
      sleeveChoice?: string | null;
      wantsShorts?: boolean;
      currentlySelectedIndex?: number;
    }): string[] => {
      const { sleeveChoice, wantsShorts, currentlySelectedIndex } = opts;
      if (!product) return [];

      // Normalize gallery URLs in predictable order (product.images preferred)
      const galleryUrls = (product.images ?? []).map((i) => i.url).filter(Boolean);
      const uniqueGallery = Array.from(new Set(galleryUrls));

      const shortsAsset = product.shortsImage ?? "";
      const longSleevesAsset = product.longSleevesImage ?? "";

      // Determine "main" gallery jersey — prefer a gallery image that is not specifically shorts/longSleeves
      const mainJerseyCandidate =
        uniqueGallery.find((u) => u !== shortsAsset && u !== longSleevesAsset) ||
        uniqueGallery[0] ||
        "";

      const wantsLong = sleeveChoice === "Long Sleeve";
      const hasLong = Boolean(longSleevesAsset);
      const hasShorts = Boolean(shortsAsset);

      // Decide which jersey image to use:
      // - If wants long and long asset exists -> longSleevesAsset
      // - else try selected gallery index if provided and valid and not shorts asset
      // - else use mainJerseyCandidate
      let jerseyImage = "";

      if (wantsLong && hasLong) {
        jerseyImage = longSleevesAsset;
      } else {
        // If currentlySelectedIndex points to a gallery image use it (but avoid returning shorts as jersey)
        if (
          typeof currentlySelectedIndex === "number" &&
          uniqueGallery[currentlySelectedIndex] &&
          uniqueGallery[currentlySelectedIndex] !== shortsAsset
        ) {
          jerseyImage = uniqueGallery[currentlySelectedIndex];
        } else {
          jerseyImage = mainJerseyCandidate || longSleevesAsset || shortsAsset || "";
        }
      }

      // Build the final images array according to the rules
      const out: string[] = [];

      // Case: user requested long sleeve and did NOT request shorts -> show only long sleeve asset (if exists)
      if (wantsLong && !wantsShorts && hasLong) {
        return [longSleevesAsset];
      }

      // Otherwise include jersey first (jerseyImage might be long sleeves or main)
      if (jerseyImage) out.push(jerseyImage);

      // If shorts requested and we have shorts asset - include as second image
      if (wantsShorts && hasShorts) {
        if (!out.includes(shortsAsset)) out.push(shortsAsset);
      }

      // Edge cases:
      // - If product only has main + shorts in gallery (2 images) and shorts requested -> this will already push both
      // - If there are no images found, return empty array
      const deduped = Array.from(new Set(out.filter(Boolean)));
      return deduped;
    },
    [product]
  );

  const addToCartAdult = () => {
    const validation = validateAdult();
    if (validation) {
      alert(validation);
      return;
    }

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      alert("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    if (!product) return;

    setAddingToCart(true);

    // Compose images for cart using helper - ensures proper ordering & dedupe
    const imagesForCart = buildCartImages({
      sleeveChoice: sleeve,
      wantsShorts: addShorts,
      currentlySelectedIndex: activeIndex,
    });

    // Fallback primary image
    const primaryImage =
      imagesForCart[0] ||
      gallery[activeIndex]?.url ||
      gallery[0]?.url ||
      product.longSleevesImage ||
      product.shortsImage ||
      "";

    const cartItem = {
      id: `cart-${Date.now()}-${Math.random()}`,
      productId: product._id,
      productName: product.name,
      size,
      quality,
      sleeve,
      patches: selectedPatches,
      customName: customName.trim(),
      instagram: instagram.trim(),
      addShorts,
      price: calculatePriceNumber(),
      basePrice: product.price,
      image: primaryImage, // legacy single image field (jersey image we chose)
      images: imagesForCart.length ? imagesForCart : [primaryImage], // ensure at least one image
      longSleevesImage: product.longSleevesImage || null,
      shortsImage: product.shortsImage || null,
      quantity: 1,
    };

    const cartKey = `cart-${loggedInUser}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    cart.push(cartItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));

    const totalQuantity = cart.reduce(
      (sum: number, it: any) => sum + (it.quantity || 1),
      0
    );
    localStorage.setItem("cartItemCount", totalQuantity.toString());
    window.dispatchEvent(new Event("cartUpdated"));
    setAddingToCart(false);
    router.push("/cart");
  };

  const addToCartKids = () => {
    const validation = validateKids();
    if (validation) {
      alert(validation);
      return;
    }

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      alert("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    if (!product) return;
    setAddingToCart(true);

    const basePrice = Number(product.price);
    const extraForName = customName.trim() ? 1 : 0;
    const finalPrice = Number((basePrice + extraForName).toFixed(3));

    // Kids flow: shorts are not applicable in this UI, sleeve choice doesn't apply.
    const primaryImage = gallery[activeIndex]?.url || gallery[0]?.url || "";

    // For kids, images array only contains the selected primary jersey image.
    const imagesForCart = [primaryImage].filter(Boolean);

    const cartItem = {
      id: `cart-${Date.now()}-${Math.random()}`,
      productId: product._id,
      productName: product.name,
      size,
      quality: "Kids",
      sleeve: null as unknown as string | null,
      patches: [] as string[],
      customName: customName.trim(),
      instagram: instagram.trim(),
      addShorts: false,
      price: finalPrice,
      basePrice,
      image: imagesForCart[0] || "",
      images: imagesForCart,
      longSleevesImage: product.longSleevesImage || null,
      shortsImage: product.shortsImage || null,
      quantity: 1,
    };

    const cartKey = `cart-${loggedInUser}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    cart.push(cartItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));

    const totalQuantity = cart.reduce(
      (sum: number, it: any) => sum + (it.quantity || 1),
      0
    );
    localStorage.setItem("cartItemCount", totalQuantity.toString());
    window.dispatchEvent(new Event("cartUpdated"));
    setAddingToCart(false);
    router.push("/cart");
  };

  /* ------------------------------- Early returns ------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemCount={cartItemCount} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || "Product Not Found"}
          </h1>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------------------------- Render ----------------------------------- */

  const hasMultipleImages = gallery.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} />

      <main className="container mx-auto px-4 py-8">
        {/* Page grid: gallery on left (desktop), details on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left column = Gallery */}
          <section className="w-full">
            {/* Desktop gallery */}
            {gallery.length > 0 ? (
              <div
                className={[
                  "hidden lg:grid gap-4",
                  hasMultipleImages ? "lg:grid-cols-[88px_1fr]" : "lg:grid-cols-1",
                ].join(" ")}
              >
                {/* Thumbnails (vertical) — only if >1 image */}
                {hasMultipleImages && (
                  <div className="flex flex-col gap-3">
                    {gallery.map((img, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={`${img.url}-${idx}`}
                          type="button"
                          onClick={() => selectThumb(idx)}
                          className={[
                            "relative aspect-square rounded-lg border overflow-hidden",
                            isActive
                              ? "border-black ring-2 ring-black"
                              : "border-gray-200 hover:border-gray-400",
                          ].join(" ")}
                          aria-label={`View image ${idx + 1}`}
                        >
                          <Image
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            sizes="88px"
                            style={{ objectFit: "cover" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Main image */}
                <div className="relative h-[640px] rounded-lg border bg-transparent">
                  <Image
                    key={gallery[activeIndex]?.url ?? "main"}
                    src={gallery[activeIndex]?.url ?? ""}
                    alt={`${product.name} image`}
                    fill
                    priority
                    sizes="(max-width: 1280px) 50vw, 640px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center rounded-lg border h-[520px] bg-white">
                <p className="text-muted-foreground">No image</p>
              </div>
            )}

            {/* Mobile gallery */}
            <div className="lg:hidden">
              {gallery.length > 0 ? (
                hasMultipleImages ? (
                  <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={8}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    onSlideChange={(s) => setActiveIndex(s.realIndex)}
                    className="w-full h-[360px] rounded-lg border bg-black"
                  >
                    {gallery.map((img, idx) => (
                      <SwiperSlide key={`${img.url}-${idx}`}>
                        <div className="relative w-full h-[440px] bg-black">
                          <Image
                            src={img.url}
                            alt={`${product.name} ${idx + 1}`}
                            fill
                            sizes="100vw"
                            style={{ objectFit: "contain" }}
                            priority={idx === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="relative w-full h-[440px] rounded-lg border bg-black">
                    <Image
                      src={gallery[0].url}
                      alt={`${product.name}`}
                      fill
                      sizes="100vw"
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center rounded-lg border h-[360px] bg-white">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
            </div>
          </section>

          {/* Right column = Details / Form */}
          <section className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              {product.description ? (
                <p className="text-muted-foreground">{product.description}</p>
              ) : null}
              <p className="mt-3 text-2xl font-semibold">
                KD {calculatePriceNumber().toFixed(3)}
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Size */}
                <div>
                  <Label className="text-sm font-medium">
                    Size <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(isKidsKit ? kidsSizes.map((k) => k.value) : adultSizes).map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSize(String(s))}
                          className={`px-4 py-2 rounded-full border font-semibold transition-colors ${
                            size === String(s)
                              ? "bg-gray-800 text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {isKidsKit
                            ? kidsSizes.find((k) => k.value === s)?.label ?? s
                            : s}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Quality */}
                {!isKidsKit && (
                  <div>
                    <Label htmlFor="quality" className="text-sm font-medium">
                      QUALITY <span className="text-red-500">*</span>
                    </Label>
                    <Select value={quality} onValueChange={(v) => setQuality(v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Please choose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fan Version">Fan Version</SelectItem>
                        <SelectItem value="Player Version">
                          Player Version (+1 KWD)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sleeve length */}
                {product.showLongSleeves && !isKidsKit && (
                  <div>
                    <Label className="text-sm font-medium">
                      Sleeve-Length *
                    </Label>
                    <Select value={sleeve} onValueChange={(v) => setSleeve(v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Please choose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short Sleeve">Short Sleeve</SelectItem>
                        <SelectItem value="Long Sleeve">Long Sleeve</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Patches */}
                {availablePatches.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Patches ( +500 fils )
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availablePatches.map((p) => {
                        const checked = selectedPatches.includes(p);
                        return (
                          <label
                            key={p}
                            className="flex items-center gap-2 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handlePatchToggle(p)}
                            />
                            <span>{p}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Name/Number presence selector */}
                <div>
                  <Label className="text-sm font-medium">Name/ Number</Label>
                  <Select
                    value={customName.trim() ? "yes" : "no"}
                    onValueChange={(v) =>
                      setCustomName((prev) => (v === "yes" ? prev : ""))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Please choose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">N/A</SelectItem>
                      <SelectItem value="yes">Yes (+1.000 KWD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Name input */}
                <div>
                  <Label className="text-sm font-medium">
                    Custom name/ number
                  </Label>
                  <Input
                    id="customName"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="mt-2"
                    placeholder="Enter your text"
                  />
                </div>

                {/* Shorts add-on */}
                {product.showShorts && !isKidsKit && (
                  <div className="flex items-center gap-2">
                    <input
                      id="addShorts"
                      type="checkbox"
                      checked={addShorts}
                      onChange={(e) => setAddShorts(e.target.checked)}
                    />
                    <label htmlFor="addShorts" className="font-medium">
                      Add Matching Shorts +2 KWD
                    </label>
                  </div>
                )}

                {/* Instagram */}
                <div>
                  <Label className="text-sm font-medium">
                    Instagram Handle <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="mt-2"
                    placeholder="@yourhandle"
                  />
                </div>

                {/* Price breakdown */}
                <div className="pt-4 border-t space-y-1 text-sm text-muted-foreground">
                  <div className="text-xl font-semibold text-black">
                    KD {calculatePriceNumber().toFixed(3)}
                  </div>

                  <div>Base price: KD {product.price.toFixed(3)}</div>

                  {selectedPatches.length > 0 && (
                    <div>
                      Patches: {selectedPatches.length} × KD 0.500 = KD{" "}
                      {(selectedPatches.length * 0.5).toFixed(3)}
                    </div>
                  )}
                  {sleeve === "Long Sleeve" && <div>Long Sleeve: KD 0.500</div>}
                  {customName.trim() && <div>Custom Name/Number: KD 1.000</div>}
                  {quality === "Player Version" && (
                    <div>Player Version Upgrade: KD 1.000</div>
                  )}
                  {addShorts && <div>Matching Shorts: KD 2.000</div>}
                </div>

                {/* Add to cart */}
                <Button
                  onClick={isKidsKit ? addToCartKids : addToCartAdult}
                  className="w-full bg-white hover:bg-gray-300 text-black py-3 text-lg font-medium"
                  size="lg"
                  disabled={addingToCart}
                >
                  {addingToCart ? "Adding..." : "Add to Bag"}
                </Button>
              </CardContent>
            </Card>

            {/* Bullets */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Premium quality materials</p>
              <p>• Authentic club branding</p>
              <p>• Comfortable fit for all-day wear</p>
              <p>• Machine washable (see care instructions)</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
