"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  tags?: string[];
}

interface ProductCardProps {
  readonly product: Product;
  readonly onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Show up to two tags on the image (adjust slice count if you want more)
  const tagsToShow = (product.tags ?? []).slice(0, 2);

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Tag(s) positioned top-left inside the image */}
        {tagsToShow.length > 0 && (
          <div className="absolute left-3 top-3 z-30 flex flex-col items-start gap-2 pointer-events-none">
            {tagsToShow.map((tag) => (
              <span
                key={tag}
                className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground shadow-sm"
                aria-label={`Tag: ${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm sm:text-base leading-tight mb-2 flex-1">
          {product.name}
        </h3>

        <p className="text-lg font-bold text-primary">
          KWD {Number(product.price || 0).toFixed(3)}
        </p>
      </CardContent>

      {/* Add to Cart Button */}
      <CardFooter className="p-4 pt-0">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button className="w-full bg-black hover:bg-gray-800 text-white">
            Add to Cart
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
