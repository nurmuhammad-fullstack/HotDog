import { db } from "./db";
import { categories, products, orders, orderItems, type Category, type Product, type Order, type CreateOrderRequest } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: number): Promise<Product[]>;
  createOrder(order: CreateOrderRequest): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getProducts(categoryId?: number): Promise<Product[]> {
    if (categoryId) {
      return await db.select().from(products).where(eq(products.categoryId, categoryId));
    }
    return await db.select().from(products);
  }

  async createOrder(orderRequest: CreateOrderRequest): Promise<number> {
    const [order] = await db.insert(orders).values({
      customerName: orderRequest.customerName,
      customerPhone: orderRequest.customerPhone,
      address: orderRequest.address,
      totalAmount: "0", // Will be calculated below
    }).returning();

    let total = 0;
    for (const item of orderRequest.items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) {
        const itemPrice = parseFloat(product.price);
        total += itemPrice * item.quantity;
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    await db.update(orders).set({ totalAmount: total.toString() }).where(eq(orders.id, order.id));
    return order.id;
  }
}

export const storage = new DatabaseStorage();
