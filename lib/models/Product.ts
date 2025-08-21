import type { ObjectId } from "mongodb"

export interface Product {
  _id?: ObjectId
  name: string
  description?: string
  price: number
  category: string
  images: {
    public_id: string
    url: string
    width: number
    height: number
  }[]
  sizes: string[]
  colors: string[]
  inStock: boolean
  stockCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductInput {
  name: string
  description?: string
  price: number
  category: string
  images: {
    public_id: string
    url: string
    width: number
    height: number
  }[]
  sizes: string[]
  colors: string[]
  inStock: boolean
  stockCount: number
}
