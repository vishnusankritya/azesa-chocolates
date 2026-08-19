import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s()]{7,15}$/, "Invalid phone number"),
    email: z.string().trim().email().or(z.literal("")).optional(),
  }),
  address: z.object({
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(80),
    state: z.string().trim().min(1).max(80),
    pincode: z.string().trim().regex(/^\d{6}$/, "Invalid pincode (6 digits)"),
  }),
  payment: z.enum(["cod", "online"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "fulfilled", "cancelled"]),
});

export const createProductSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  type: z.string().min(1).max(40),
  price: z.number().int().min(0),
  mrp: z.number().int().min(0).nullable().optional(),
  accentColor: z.string().max(20).nullable().optional(),
  ingredient: z.string().max(160).nullable().optional(),
  tagline: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  occasion: z.string().max(120).nullable().optional(),
  contents: z.array(z.string()).max(50).nullable().optional(),
  imageUrl: z.string().max(500).nullable().optional(),
  images: z.array(z.string().max(500)).max(20).nullable().optional(),
  active: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
