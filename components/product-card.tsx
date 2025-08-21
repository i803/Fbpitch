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
}

interface ProductCardProps {
  readonly product: Omit<Product, "id" | "image"> & {
    readonly id: string;
    readonly image: string;
  };
  readonly onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm sm:text-base leading-tight mb-2 flex-1">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-primary">
          KWD {product.price.toFixed(3)}
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
