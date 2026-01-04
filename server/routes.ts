import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { categories, products } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.categories.list.path, async (req, res) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.get(api.products.list.path, async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const items = await storage.getProducts(categoryId);
    res.json(items);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const orderId = await storage.createOrder(input);
      res.status(201).json({ id: orderId, message: "Order created successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCats = await storage.getCategories();
  if (existingCats.length === 0) {
    const [burgerCat] = await db.insert(categories).values({ name: "Burgers", slug: "burgers" }).returning();
    const [hotdogCat] = await db.insert(categories).values({ name: "Hot Dogs", slug: "hot-dogs" }).returning();
    const [drinksCat] = await db.insert(categories).values({ name: "Drinks", slug: "drinks" }).returning();

    await db.insert(products).values([
      { categoryId: hotdogCat.id, name: "Classic Hot Dog", price: "25000", description: "Traditional beef sausage with mustard and ketchup" },
      { categoryId: hotdogCat.id, name: "Cheese Hot Dog", price: "30000", description: "Hot dog with extra melted cheese" },
      { categoryId: burgerCat.id, name: "Beef Burger", price: "35000", description: "Juicy beef patty with fresh lettuce" },
      { categoryId: drinksCat.id, name: "Coca-Cola", price: "10000", description: "0.5L chilled" },
    ]);
  }
}
