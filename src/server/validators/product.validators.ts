import { z } from 'zod'

export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  age: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const variantSchema = z.object({
  title: z.string().min(1),
  sku: z.string().min(1),
  price: z.union([z.string(), z.number()]).transform((v) => String(v)),
  compare_at_price: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  inventory_quantity: z.number().int(),
  weight: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  weight_unit: z.string().optional(),
  requires_shipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
})

const imageSchema = z.object({
  src: z.string().url(),
  alt_text: z.string().optional(),
  position: z.number().int().min(0).default(0),
})

const shopifyProductSchema = z.object({
  // Shopify ids come across the wire as numbers for legacy REST payloads and
  // as GID strings like "gid://shopify/Product/8123456789" for GraphQL. We
  // store both as text in Product.externalId, so accept either here and let
  // the service layer stringify before writing.
  id: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(1),
  description: z.string().default(''),
  vendor: z.string().default(''),
  product_type: z.string().default(''),
  tags: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
  images: z.array(imageSchema).default([]),
})

export const importProductsSchema = z.object({
  products: z.array(shopifyProductSchema).min(1),
})

export type ListProductsQueryInput = z.infer<typeof listProductsQuerySchema>
export type ShopifyImportInput = z.infer<typeof importProductsSchema>
